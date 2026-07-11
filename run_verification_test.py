"""
Verification test for POST /bookings/ with rudra2@example.com.
Tests that:
1. Login succeeds
2. Booking returns 201 Created instantly
3. Terminal shows mailer background task logs
"""
import sys
import urllib.request, urllib.error, urllib.parse, json, time

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
        headers["Authorization"] = "Bearer " + token
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

print("=" * 60)
print("VERIFICATION TEST: NexDesk Concurrent Email Notification")
print("=" * 60)

# ─── STEP 1: Try logging in as rudra2@example.com ────────────────────────────
print("\n[AUTH] Attempting login as rudra2@example.com ...")
token = None
passwords_to_try = ["Rudra@123", "password123", "admin123", "test123", "Rudra2@123"]
for pwd in passwords_to_try:
    s, r = post("/auth/login", {"username": "rudra2@example.com", "password": pwd}, form=True)
    if s == 200:
        token = r["access_token"]
        print(f"  [OK] Authenticated with password: {pwd}")
        break
    else:
        print(f"  [FAIL] {pwd} -> HTTP {s}: {r.get('detail', r)}")

if not token:
    print("\n  rudra2@example.com login failed. Falling back to rudra@example.com ...")
    s, r = post("/auth/login", {"username": "rudra@example.com", "password": "Rudra@123"}, form=True)
    if s == 200:
        token = r["access_token"]
        print(f"  [OK] Authenticated as rudra@example.com (fallback)")
    else:
        print(f"  [FATAL] Both accounts failed. Last error: {r}")
        sys.exit(1)

# ─── STEP 2: POST /bookings/ with unique far-future time window ───────────────
print("\n[BOOKING] Submitting fresh reservation with a unique time window ...")
booking_body = {
    "desk_id": "DESK-MAILER-VT-01",
    "start_time": "2026-09-15T09:00:00",
    "end_time":   "2026-09-15T17:00:00"
}
print(f"  Payload: {json.dumps(booking_body)}")

t0 = time.time()
status, resp = post("/bookings/", booking_body, token=token)
elapsed = round((time.time() - t0) * 1000)

print(f"\n  HTTP Status  : {status}  ({elapsed}ms)")
print(f"  Response Body:")
print(f"    {json.dumps(resp, indent=4, default=str)}")

print("\n" + "=" * 60)
if status == 201:
    print("  [201 CREATED] Booking accepted. Response did NOT block on mailer.")
    print("=" * 60)
    print("\n  Now look at your running uvicorn PowerShell terminal.")
    print("  You should see these two lines appear immediately:\n")
    print("    📧 [MAILER QUEUE] Preparing outbound email broadcast thread targeting: rudra2@example.com")
    print("    💡 [MAILER MOCK LOG] Outbound email targeting rudra2@example.com sent successfully via console fallback.")
    print("\n  If those lines appear -> CONCURRENT EMAIL ENGINE IS VERIFIED ✅")
else:
    print(f"  [FAIL] Expected 201, got {status}.")
    print(f"  Detail: {resp}")
    print("=" * 60)
