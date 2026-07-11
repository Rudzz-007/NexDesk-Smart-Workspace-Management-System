"""
Quick test ONLY for the fast check-in path (Step 2).
Creates a booking, initializes token, and immediately verifies it.
"""
import urllib.request, urllib.error, urllib.parse, json, time
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = "http://127.0.0.1:8000"

def post(path, body=None, token=None, form=False):
    url = BASE + path
    if form:
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = urllib.parse.urlencode(body).encode()
    else:
        headers = {"Content-Type": "application/json"}
        data = json.dumps(body).encode() if body else b""
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body_bytes = e.read()
        try:
            return e.code, json.loads(body_bytes)
        except Exception:
            return e.code, {"raw": body_bytes.decode(errors="replace")}

# Auth
_, resp = post("/auth/login", {"username": "rudra@example.com", "password": "Rudra@123"}, form=True)
token = resp["access_token"]
print(f"[OK] Authenticated as rudra@example.com")

# Create booking
status, resp = post("/bookings/", {"desk_id": "DESK-QR9", "start_time": "2026-07-25T09:00:00", "end_time": "2026-07-25T17:00:00"}, token=token)
booking_id = resp["id"]
print(f"[OK] Booking created: ID={booking_id}, status={resp['status']}")

# Initialize check-in
status, resp = post(f"/checkin/initialize/{booking_id}", token=token)
tok_str = resp["qr_token_string"]
print(f"[OK] Token initialized: {tok_str}")

# Verify IMMEDIATELY
print(f"Verifying token NOW (within 30s window)...")
status, resp = post(f"/checkin/verify?token_string={urllib.parse.quote(tok_str)}", token=token)
print(f"  HTTP Status : {status}")
print(f"  Response    : {json.dumps(resp, indent=2)}")
if status == 200:
    print("\n[SUCCESS] Fast check-in path VERIFIED! Desk marked as checked_in.")
else:
    print(f"\n[FAILED] Expected 200, got {status}")
