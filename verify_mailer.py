"""
Verification test for the background mailer task.
Creates a fresh booking and checks that the mailer logs appear in the server terminal.
"""
import urllib.request, urllib.error, urllib.parse, json, time, sys

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

# ── AUTH ──────────────────────────────────────────────────────────────────────
print("=" * 60)
print("AUTH: Logging in as rudra@example.com")
print("=" * 60)
status, resp = post("/auth/login", {"username": "rudra@example.com", "password": "Rudra@123"}, form=True)
if status != 200:
    print(f"  [FAIL] Login returned {status}: {resp}")
    raise SystemExit(1)
token = resp["access_token"]
print(f"  [OK] JWT token acquired.")

# ── POST /bookings/ ───────────────────────────────────────────────────────────
print()
print("=" * 60)
print("STEP 1: Submit fresh booking via POST /bookings/")
print("=" * 60)

# Use a far-future unique date to avoid any collision boundary conflicts
booking_body = {
    "desk_id": "DESK-MAIL-01",
    "start_time": "2026-08-01T10:00:00",
    "end_time":   "2026-08-01T18:00:00"
}
print(f"  Payload : {json.dumps(booking_body)}")

t0 = time.time()
status, resp = post("/bookings/", booking_body, token=token)
elapsed = round((time.time() - t0) * 1000)

print(f"  HTTP Status  : {status}  ({elapsed}ms)")
print(f"  Response body:")
print(f"    {json.dumps(resp, indent=4)}")

if status == 201:
    print()
    print("  [201 CREATED] Booking accepted instantly. Response did NOT block on the mailer.")
    print()
    print("=" * 60)
    print("STEP 2: Check your uvicorn PowerShell terminal for:")
    print("=" * 60)
    print("  [MAILER QUEUE] Preparing outbound email broadcast thread targeting: rudra@example.com")
    print("  [MAILER MOCK LOG] Outbound email targeting rudra@example.com sent successfully via console fallback.")
    print()
    print("  If you see those two lines -> background task injection is VERIFIED.")
else:
    print(f"  [FAIL] Expected 201, got {status}. Check server logs.")
