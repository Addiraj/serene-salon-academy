import subprocess
import re
import sys
import os
import webbrowser
import time

def run_automated_deploy():
    print("=" * 60)
    print("🚀 AUTOMATED VERCEL DEPLOYMENT INITIATOR")
    print("=" * 60)
    
    # Step 1: Start vercel login
    print("\n[Step 1] Starting Vercel authentication...")
    proc = subprocess.Popen(
        ["cmd.exe", "/c", "npx", "vercel", "login"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    auth_url = None
    user_code = None
    
    # Read until device authorization URL is found
    start_time = time.time()
    while True:
        line = proc.stdout.readline()
        if not line:
            if proc.poll() is not None:
                break
            time.sleep(0.1)
            continue
            
        print("  " + line.strip(), flush=True)
        
        match = re.search(r'(https://vercel\.com/oauth/device\?user_code=([A-Z0-9\-]+))', line)
        if match:
            auth_url = match.group(1)
            user_code = match.group(2)
            print(f"\n🌐 >>> AUTO-LAUNCHING BROWSER FOR 1-CLICK CONFIRMATION <<<")
            print(f"URL:  {auth_url}")
            print(f"CODE: {user_code}\n", flush=True)
            try:
                webbrowser.open(auth_url)
            except Exception as e:
                print(f"Could not auto-open browser: {e}")
            break
            
        if time.time() - start_time > 30:
            print("Timeout waiting for authorization URL.")
            break

    if not auth_url:
        print("Could not obtain authorization URL from Vercel CLI.")
        return

    # Step 2: Stream remaining output while waiting for user confirmation
    print("[Step 2] Waiting for your confirmation in the browser window...")
    while True:
        line = proc.stdout.readline()
        if not line and proc.poll() is not None:
            break
        if line:
            print("  " + line.strip(), flush=True)

    proc.wait()
    print(f"\nLogin process finished with exit code {proc.returncode}")
    
    if proc.returncode != 0:
        print("❌ Login did not complete successfully.")
        return

    # Step 3: Trigger Production Deployment
    print("\n[Step 3] 🚀 Deploying Serene Salon & Academy to Vercel Production...")
    deploy_proc = subprocess.Popen(
        ["cmd.exe", "/c", "npx", "vercel", "deploy", "--prod", "--yes"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    prod_url = None
    while True:
        line = deploy_proc.stdout.readline()
        if not line and deploy_proc.poll() is not None:
            break
        if line:
            clean = line.strip()
            print("  " + clean, flush=True)
            if "https://" in clean and ".vercel.app" in clean:
                prod_url = clean

    deploy_proc.wait()
    if deploy_proc.returncode == 0:
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! LIVE PRODUCTION DEPLOYMENT COMPLETE!")
        if prod_url:
            print(f"🌐 Live URL: {prod_url}")
        print("=" * 60)
    else:
        print(f"Deployment ended with exit code {deploy_proc.returncode}")

if __name__ == '__main__':
    run_automated_deploy()

