import urllib.request, urllib.error, urllib.parse, json, time
import sys

# Force UTF-8 output on Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE = "http://127.0.0.1:8000"

CREDS = [
    ("rudra@example.com", "Rudra@123"),
    ("rudra@example.com", "Krishna@770"),
    ("rudra@example.com", "admin123"),
    ("rudra@example.com", "password"),
    ("rudra2@example.com", "Krishna@770"),
    ("admin@nexdesk.com", "admin123"),
    ("admin@nexdesk.com", "Krishna@770"),
    ("testuser@example.com", "test123"),
    ("testuser@example.com", "password"),
]

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
        body = e.read()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body.decode(errors="replace")}

def get(path, token=None):
    url = BASE + path
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return e.code, json.loads(body)
        except Exception:
            return e.code, {"raw": body.decode(errors="replace")}

# ── AUTH ──────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("AUTH: Trying multiple credential combinations")
print("="*60)
token = None
for email, password in CREDS:
    status, resp = post("/auth/login", {"username": email, "password": password}, form=True)
    if status == 200:
        token = resp.get("access_token")
        print(f"  [OK] Logged in as: {email}")
        print(f"  Token: {token[:40]}...")
        break
    else:
        print(f"  [FAIL] {email} / {password[:5]}*** -> {status}: {resp.get('detail')}")

if not token:
    print("\n  All credentials failed. Please provide valid login credentials.")
    raise SystemExit(1)

# ── STEP 1: Create Test Booking ────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 1: Create Test Booking")
print("="*60)
booking_body = {
    "desk_id": "DESK-QR2",
    "start_time": "2026-07-20T09:00:00",
    "end_time": "2026-07-20T17:00:00"
}
status, resp = post("/bookings/", booking_body, token=token)
print(f"  HTTP Status : {status}")
print(f"  Response    :\n{json.dumps(resp, indent=4)}")
booking_id = resp.get("id")

if not booking_id:
    print("\n  ERROR: No booking id returned. Aborting.")
    raise SystemExit(1)
print(f"\n  [OK] Booking created with ID: {booking_id}")

# ── STEP 2a: Initialize Check-in ──────────────────────────────────────────
print("\n" + "="*60)
print(f"STEP 2a: Initialize Check-in for Booking ID {booking_id}")
print("="*60)
status, resp = post(f"/checkin/initialize/{booking_id}", token=token)
print(f"  HTTP Status : {status}")
print(f"  Response    :\n{json.dumps(resp, indent=4)}")
tok_str = resp.get("qr_token_string")

if not tok_str:
    print("\n  ERROR: No qr_token_string found in response!")
else:
    # ── STEP 2b: Verify Token immediately ─────────────────────────────────
    print("\n" + "="*60)
    print("STEP 2b: Verify QR Token (within 30s window) — FAST PATH")
    print("="*60)
    print(f"  QR Token : {tok_str}")
    # /checkin/verify expects token_string as a QUERY PARAMETER (bare str in FastAPI)
    status, resp = post(f"/checkin/verify?token_string={urllib.parse.quote(tok_str)}", token=token)
    print(f"  HTTP Status : {status}")
    print(f"  Response    :\n{json.dumps(resp, indent=4)}")
    if status == 200:
        print("\n  [SUCCESS] Physical presence verified! Fast check-in path works!")
    else:
        print(f"\n  [FAILED] Expected 200 OK, got {status}")

# ── STEP 3: No-Show Booking ────────────────────────────────────────────────
print("\n" + "="*60)
print("STEP 3: Create NO-SHOW Booking")
print("="*60)
booking_body2 = {
    "desk_id": "DESK-QR3",
    "start_time": "2026-07-21T09:00:00",
    "end_time": "2026-07-21T17:00:00"
}
status, resp = post("/bookings/", booking_body2, token=token)
print(f"  HTTP Status : {status}")
print(f"  Response    :\n{json.dumps(resp, indent=4)}")
booking_id2 = resp.get("id")

if not booking_id2:
    print("\n  ERROR: No booking id returned for no-show test.")
    raise SystemExit(1)

print(f"\n  [OK] No-show booking created with ID: {booking_id2}")

print("\n" + "="*60)
print(f"STEP 3b: Initialize Check-in for Booking {booking_id2} — will NOT verify")
print("="*60)
status, resp = post(f"/checkin/initialize/{booking_id2}", token=token)
print(f"  HTTP Status : {status}")
print(f"  Response    :\n{json.dumps(resp, indent=4)}")

print(f"\n  Token initialized. NOT calling /checkin/verify.")
print(f"  Waiting 35 seconds for Auto-Release Watchdog to fire...")
for remaining in range(35, 0, -5):
    print(f"    {remaining}s remaining...")
    time.sleep(5)

print("\n" + "="*60)
print(f"STEP 3c: Confirm booking {booking_id2} status after watchdog")
print("="*60)
s3, r3 = get(f"/bookings/{booking_id2}", token=token)
print(f"  HTTP Status : {s3}")
print(f"  Body        :\n{json.dumps(r3, indent=4)}")

print("\n" + "="*60)
print("ALL TESTS COMPLETE")
print("="*60)
print(f"  >>> Check your uvicorn terminal window for:")
print(f"  [AUTO-RELEASE] Booking ID {booking_id2} flagged as NO-SHOW. Inventory freed.")
print("="*60)
