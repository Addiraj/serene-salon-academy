import urllib.request
import urllib.parse
import json

BASE_URL = 'http://localhost:3000'

def test_get(path, expected_code=200, check_str=None):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={'User-Agent': 'TestRunner'})
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            assert status == expected_code, f"Expected {expected_code}, got {status} for {url}"
            content = resp.read()
            if check_str:
                body = content.decode('utf-8', errors='ignore')
                assert check_str in body, f"Substring '{check_str}' not found in response from {url}"
            print(f" PASS: GET {path} ({status})")
            return content
    except Exception as e:
        print(f" FAIL: GET {path} -> {e}")
        raise e

def test_post(path, data, expected_code=200):
    url = f"{BASE_URL}{path}"
    payload = json.dumps(data).encode('utf-8')
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            assert status == expected_code, f"Expected {expected_code}, got {status} for {url}"
            body = resp.read().decode('utf-8')
            res_json = json.loads(body)
            assert res_json.get('success') is True, f"Response success is not True: {body}"
            print(f" PASS: POST {path} ({status})")
            return res_json
    except Exception as e:
        print(f" FAIL: POST {path} -> {e}")
        raise e

def run_all():
    print("--- 1. Testing Static Assets & React SPA Serving ---")
    test_get('/', 200, 'Serene Salon & Academy')
    test_get('/images/hero-sanctuary.jpg', 200)
    test_get('/images/lookbook-bridal.jpg', 200)

    print("\n--- 2. Testing Image-Based Services & Rates Catalog ---")
    services_res = json.loads(test_get('/api/services', 200).decode('utf-8'))
    assert len(services_res['services']) > 0
    first_srv = services_res['services'][0]
    assert 'image' in first_srv and first_srv['image'], f"Service missing image property: {first_srv}"
    print(f"  First service '{first_srv['name']}' has image: {first_srv['image'][:40]}...")

    print("\n--- 3. Testing Enrich-Style Quick Booking Request ---")
    quick_res = test_post('/api/bookings/quick-request', {
        'name': 'Pooja Shah',
        'phone': '9876543210',
        'segment': 'women',
        'captchaToken': 'enrich-test-token'
    })
    assert quick_res['booking']['guestName'] == 'Pooja Shah'
    print(f"  Created Enrich-style priority booking: {quick_res['booking']['id']}")

    print("\n--- 4. Testing OTP Customer Authentication & reCAPTCHA ---")
    # Verify Captcha
    cap_res = test_post('/api/auth/verify-captcha', {'token': 'captcha-token-abc'})
    assert cap_res['verified'] is True

    # Send OTP
    otp_res = test_post('/api/auth/send-otp', {'phone': '9876543210'})
    dev_otp = otp_res['devOtp']
    print(f"  Generated OTP: {dev_otp}")

    # Verify OTP
    verify_res = test_post('/api/auth/verify-otp', {'phone': '9876543210', 'otp': dev_otp})
    assert verify_res['user']['name'] == 'Ananya Patel'
    print(f"  Logged in user: {verify_res['user']['name']} ({verify_res['user']['tier']})")

    # Current User Profile
    me_res = json.loads(test_get('/api/auth/me?phone=9876543210', 200).decode('utf-8'))
    assert me_res['user']['name'] == 'Ananya Patel'
    print(f"  Profile sync success: {len(me_res['bookings'])} bookings linked to user")

    print("\n--- 5. Testing Multi-Service Cart Drawer Flow ---")
    promo_res = test_post('/api/offers/validate', {'code': 'SERENE20', 'subtotal': 3000})
    assert promo_res['offer']['discountPercent'] == 20
    print(f"  Discount applied: {promo_res['discount']} INR")

    booking_res = test_post('/api/bookings', {
        'guestName': 'Ananya Patel',
        'guestPhone': '+91 9876543210',
        'userId': 'usr-101',
        'date': '2026-11-20',
        'time': '02:00 PM',
        'stylist': 'Rashmi Sah (Founder & Master Artist)',
        'services': ['Signature Luxury Hydra-Glow Facial'],
        'subtotal': 2000,
        'discount': 400,
        'promoCode': 'SERENE20',
        'total': 1600,
        'notes': 'Enrich-inspired luxury appointment'
    })
    print(f"  Created booking: {booking_res['booking']['id']}")

    print("\n--- 6. Testing Academy & Certificate Registry ---")
    inq_res = test_post('/api/inquiries', {
        'name': 'Pooja Trivedi',
        'phone': '+91 9988776655',
        'course': 'Master Bridal & HD Airbrush Artistry Diploma',
        'preferredTime': 'Morning Batch (10 AM - 1 PM)'
    })
    print(f"  Registered student inquiry: {inq_res['inquiry']['id']}")
    test_get('/api/certificates/verify/SSA-2026-104', 200, 'Priya Patel')

    print("\n--- 7. Testing Admin Operations ---")
    pin_res = test_post('/api/admin/verify-pin', {'pin': '1234'})
    assert pin_res['success'] is True
    test_get('/api/bookings/calendar?date=2026-11-20', 200, 'Rashmi Sah')
    test_get('/api/admin/export/bookings.csv', 200, 'Booking ID')
    test_get('/api/admin/export/inquiries.csv', 200, 'Inquiry ID')
    test_get('/api/admin/backup/db.json', 200, 'settings')

    print("\n ALL ENRICH-STYLE LUXURY UPGRADE TESTS PASSED 100%!")

if __name__ == '__main__':
    run_all()
