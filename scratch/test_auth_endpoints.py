import urllib.request
import json

BASE = 'http://localhost:3000'

def post(path, data):
    req = urllib.request.Request(f"{BASE}{path}", data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get(path):
    req = urllib.request.Request(f"{BASE}{path}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

# 1. Test Send OTP
res_otp = post('/api/auth/send-otp', {'phone': '9876543210'})
print('Send OTP response:', res_otp)
assert res_otp['success'] is True
dev_otp = res_otp['devOtp']

# 2. Test Verify OTP
res_verify = post('/api/auth/verify-otp', {'phone': '9876543210', 'otp': dev_otp})
print('Verify OTP response:', res_verify)
assert res_verify['success'] is True
assert res_verify['user']['name'] == 'Ananya Patel'

# 3. Test Verify Captcha
res_cap = post('/api/auth/verify-captcha', {'token': 'test-token-123'})
print('Verify Captcha:', res_cap)
assert res_cap['success'] is True

# 4. Test Enrich Quick Request
res_quick = post('/api/bookings/quick-request', {
    'name': 'Pooja Shah',
    'phone': '9988776655',
    'segment': 'women',
    'notes': 'Enrich-style appointment test'
})
print('Enrich Quick Request:', res_quick)
assert res_quick['success'] is True
assert res_quick['booking']['guestName'] == 'Pooja Shah'

# 5. Test Register New User
res_reg = post('/api/auth/register', {
    'name': 'Meera Joshi',
    'phone': '9112233445',
    'email': 'meera@gmail.com'
})
print('Register new user:', res_reg)
assert res_reg['success'] is True
assert res_reg['user']['name'] == 'Meera Joshi'

print('\n All Auth & Enrich Endpoints Passed 100%!')

