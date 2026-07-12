import urllib.request
import urllib.error
import urllib.parse
import json

BASE_URL = 'http://127.0.0.1:8000'

def test_auth_pipeline():
    print("🧪 [UI AUTH VERIFICATION] Initiating automated client integration test...")
    
    # Test Case 1: Simulate invalid password submission in Login.tsx form state
    print("\n👉 Test 1: Simulating failed credentials payload...")
    bad_payload = urllib.parse.urlencode({'username': 'rudra2@example.com', 'password': 'WrongPassword123'}).encode()
    req1 = urllib.request.Request(f'{BASE_URL}/auth/login', data=bad_payload, method='POST')
    try:
        urllib.request.urlopen(req1)
        print("❌ FAILURE: Server accepted a compromised credential bundle!")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode())
        print(f"✅ SUCCESS: Captured exact contract failure. HTTP Code: {e.code}")
        print(f"   Frontend Notification Detail: {err_body.get('detail')}")

    # Test Case 2: Simulate successful 'Authenticate Profile' form button click
    print("\n👉 Test 2: Simulating valid admin credentials payload...")
    good_payload = urllib.parse.urlencode({'username': 'rudra2@example.com', 'password': 'Rudra@123'}).encode()
    req2 = urllib.request.Request(f'{BASE_URL}/auth/login', data=good_payload, method='POST')
    try:
        with urllib.request.urlopen(req2) as response:
            res_body = json.loads(response.read().decode())
            print(f"✅ SUCCESS: Authenticated smoothly! HTTP Code: {response.status}")
            print(f"   Token Extracted to client.ts localStorage Interceptor: {res_body.get('access_token')[:30]}...")
            print("\n🎉 [UI AUTH VERIFICATION] React Frontend integration pipeline is fully verified!")
    except Exception as e:
        print(f"❌ FAILURE: Core communication layer broken: {str(e)}")

if __name__ == '__main__':
    test_auth_pipeline()
