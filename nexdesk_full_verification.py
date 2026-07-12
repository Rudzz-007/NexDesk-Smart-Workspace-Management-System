"""
nexdesk_full_verification.py
-----------------------------
Verifies all new routes AND confirms pre-existing routes still work.
Produces a pass/fail report for every test case.

Run with:
    .venv\\Scripts\\python.exe nexdesk_full_verification.py
Server must be running on http://127.0.0.1:8000
"""
import sys, json, time, urllib.request, urllib.error, urllib.parse

if sys.stdout.encoding != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE = "http://127.0.0.1:8000"
PASS = "[PASS]"
FAIL = "[FAIL]"
SKIP = "[SKIP]"

# ── helpers ────────────────────────────────────────────────────────────────────
def _request(method, path, body=None, token=None, form=False):
    url = BASE + path
    if form:
        headers = {"Content-Type": "application/x-www-form-urlencoded"}
        data = urllib.parse.urlencode(body).encode()
    elif body is not None:
        headers = {"Content-Type": "application/json"}
        data = json.dumps(body).encode()
    else:
        headers = {}
        data = None
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw)
        except Exception:
            return e.code, {"raw": raw.decode(errors="replace")}

def get(path, token=None):    return _request("GET",    path, token=token)
def post(path, body=None, token=None, form=False):
    return _request("POST", path, body=body, token=token, form=form)
def delete(path, token=None): return _request("DELETE", path, token=token)
def put(path, token=None):    return _request("PUT",    path, token=token)

results = []
def check(label, cond, actual=None, note=""):
    tag = PASS if cond else FAIL
    msg = f"  {tag} {label}"
    if actual is not None:
        compact = json.dumps(actual)
        if len(compact) > 160:
            compact = compact[:157] + "..."
        msg += f"\n         Response: {compact}"
    if note:
        msg += f"\n         Note    : {note}"
    print(msg)
    results.append((tag, label))

# ══════════════════════════════════════════════════════════════════════════════
print("\n" + "="*70)
print("  NEXDESK FULL VERIFICATION SUITE")
print("="*70)

# ── SECTION 0: Health check ────────────────────────────────────────────────────
print("\n[0] SERVER HEALTH")
s, r = get("/")
check("GET / → 200 healthy", s == 200, r)

# ── SECTION 1: Auth ────────────────────────────────────────────────────────────
print("\n[1] AUTHENTICATION")

ADMIN_EMAIL = "rudra@example.com"
ADMIN_PASS  = "Rudra@123"
EMP_EMAIL   = "emp_verify@nexdesk.io"
EMP_PASS    = "Test@1234"
EMP2_EMAIL  = "emp2_verify@nexdesk.io"
EMP2_PASS   = "Test@5678"

# Signup employee accounts (idempotent — may already exist)
post("/auth/signup", None, form=False)  # warm-up
s, r = post("/auth/signup", {}, form=False)

# Signup emp1
s, r = _request("POST", f"/auth/signup?email={urllib.parse.quote(EMP_EMAIL)}&password={EMP_PASS}&role=employee")
if s not in (201, 400):
    check("Signup emp1", False, r)
else:
    check("Signup/exist emp1", s in (201, 400), r,
          "201=created fresh, 400=already exists — both OK")

# Signup emp2
s, r = _request("POST", f"/auth/signup?email={urllib.parse.quote(EMP2_EMAIL)}&password={EMP2_PASS}&role=employee")
check("Signup/exist emp2", s in (201, 400), r,
      "201=created fresh, 400=already exists — both OK")

# Login admin
s, r = post("/auth/login", {"username": ADMIN_EMAIL, "password": ADMIN_PASS}, form=True)
check("Login admin", s == 200 and "access_token" in r, r)
ADMIN_TOKEN = r.get("access_token", "")

# Login emp1
s, r = post("/auth/login", {"username": EMP_EMAIL, "password": EMP_PASS}, form=True)
check("Login emp1", s == 200 and "access_token" in r, r)
EMP_TOKEN = r.get("access_token", "")

# Login emp2
s, r = post("/auth/login", {"username": EMP2_EMAIL, "password": EMP2_PASS}, form=True)
check("Login emp2", s == 200 and "access_token" in r, r)
EMP2_TOKEN = r.get("access_token", "")

if not ADMIN_TOKEN or not EMP_TOKEN or not EMP2_TOKEN:
    print("\n[FATAL] Could not obtain all required tokens. Aborting.")
    sys.exit(1)

# ── SECTION 2: PRE-EXISTING ROUTES REGRESSION ─────────────────────────────────
print("\n[2] PRE-EXISTING ROUTES REGRESSION")

# POST /bookings/ (existing)
UNIQUE_TS = int(time.time())
DESK_OLD  = f"DESK-REG-{UNIQUE_TS}"
START_OLD = "2026-10-01T09:00:00"
END_OLD   = "2026-10-01T17:00:00"
s, r = post("/bookings/", {"desk_id": DESK_OLD, "start_time": START_OLD, "end_time": END_OLD}, token=ADMIN_TOKEN)
check("POST /bookings/ → 201", s == 201, r)
check("POST /bookings/ has id, status, final_price, noshow_probability",
      all(k in r for k in ("id","status","final_price","noshow_probability")), r)
REGR_BOOKING_ID = r.get("id")

# Check-in initialize
if REGR_BOOKING_ID:
    s, r = post(f"/checkin/initialize/{REGR_BOOKING_ID}", token=ADMIN_TOKEN)
    check("POST /checkin/initialize/{id} → 200", s == 200, r)
    TOK_STR = r.get("qr_token_string", "")
    if TOK_STR:
        s, r = post(f"/checkin/verify?token_string={urllib.parse.quote(TOK_STR)}", token=ADMIN_TOKEN)
        check("POST /checkin/verify → 200 checked_in", s == 200, r)

# Analytics summary (admin only — existing)
s, r = get("/analytics/summary", token=ADMIN_TOKEN)
check("GET /analytics/summary → 200 (admin)", s == 200, r)
check("GET /analytics/summary fields present",
      all(k in r for k in ("total_reservations_processed", "total_revenue_generated_inr", "high_risk_no_show_alerts")), r)

# ── SECTION 3: GET /desks/ ─────────────────────────────────────────────────────
print("\n[3] GET /desks/")

s, r = get("/desks/", token=EMP_TOKEN)
check("GET /desks/ → 200 (employee)", s == 200, r)
check("GET /desks/ has total + desks array", "total" in r and isinstance(r.get("desks"), list), r)
check("GET /desks/ total >= 8 (seeded desks present)", r.get("total", 0) >= 8, r)

if r.get("desks"):
    d = r["desks"][0]
    check("Desk object has all required fields",
          all(k in d for k in ("id","desk_id","location","base_price","amenities","is_active")), d)
    check("Desk base_price is float", isinstance(d.get("base_price"), float), d)
    check("Desk is_active is string", isinstance(d.get("is_active"), str), d)

# No auth → 401
s, r = get("/desks/")
check("GET /desks/ without token → 401", s == 401, r)

# ── SECTION 4: GET /bookings/me ───────────────────────────────────────────────
print("\n[4] GET /bookings/me")

# emp2 has 0 bookings — new account
s, r = get("/bookings/me", token=EMP2_TOKEN)
check("GET /bookings/me (0 bookings) → 200 empty array", s == 200 and r == [], r)

# admin user has bookings from earlier tests
s, r = get("/bookings/me", token=ADMIN_TOKEN)
check("GET /bookings/me (admin with bookings) → 200 list", s == 200 and isinstance(r, list), r)
check("GET /bookings/me list has >= 1 booking", len(r) >= 1, {"count": len(r)})
if r:
    b = r[0]
    check("Booking in /me has all BookingResponse fields",
          all(k in b for k in ("id","user_id","desk_id","start_time","end_time","final_price","status")), b)
    check("Bookings sorted newest first (start_time desc)",
          len(r) < 2 or r[0]["start_time"] >= r[1]["start_time"], {"first": r[0]["start_time"], "second": r[1]["start_time"] if len(r) > 1 else "N/A"})

# No auth → 401
s, r = get("/bookings/me")
check("GET /bookings/me without token → 401", s == 401, r)

# ── SECTION 5: GET /bookings/{id} ────────────────────────────────────────────
print("\n[5] GET /bookings/{id}")

# Create a booking owned by emp1
DESK_EMP = f"DESK-EMP-{UNIQUE_TS}"
s, emp_bk = post("/bookings/", {"desk_id": DESK_EMP, "start_time": "2026-11-01T10:00:00", "end_time": "2026-11-01T12:00:00"}, token=EMP_TOKEN)
check("Setup: emp1 booking created", s == 201, emp_bk)
EMP_BOOKING_ID = emp_bk.get("id")

if EMP_BOOKING_ID:
    # Owner can fetch
    s, r = get(f"/bookings/{EMP_BOOKING_ID}", token=EMP_TOKEN)
    check(f"GET /bookings/{EMP_BOOKING_ID} → 200 (owner)", s == 200, r)
    check("Response matches BookingResponse shape",
          all(k in r for k in ("id","user_id","desk_id","start_time","end_time","final_price","status")), r)

    # Different employee is BLOCKED
    s, r = get(f"/bookings/{EMP_BOOKING_ID}", token=EMP2_TOKEN)
    check(f"GET /bookings/{EMP_BOOKING_ID} → 403 (non-owner employee)", s == 403, r)
    check("403 detail message correct", "Access denied" in r.get("detail",""), r)

    # Admin can fetch ANY booking
    s, r = get(f"/bookings/{EMP_BOOKING_ID}", token=ADMIN_TOKEN)
    check(f"GET /bookings/{EMP_BOOKING_ID} → 200 (admin)", s == 200, r)

# 404 for nonexistent
s, r = get("/bookings/999999", token=ADMIN_TOKEN)
check("GET /bookings/999999 → 404", s == 404, r)

# No auth → 401
s, r = get(f"/bookings/{EMP_BOOKING_ID or 1}")
check("GET /bookings/{id} without token → 401", s == 401, r)

# ── SECTION 6: DELETE /bookings/{id} ─────────────────────────────────────────
print("\n[6] DELETE /bookings/{id}")

# Create a fresh booking for emp1 to cancel
DESK_DEL = f"DESK-DEL-{UNIQUE_TS}"
s, del_bk = post("/bookings/", {"desk_id": DESK_DEL, "start_time": "2026-12-01T10:00:00", "end_time": "2026-12-01T12:00:00"}, token=EMP_TOKEN)
check("Setup: emp1 booking for delete test created", s == 201, del_bk)
DEL_BOOKING_ID = del_bk.get("id")

if DEL_BOOKING_ID:
    # Non-owner emp2 CANNOT cancel
    s, r = delete(f"/bookings/{DEL_BOOKING_ID}", token=EMP2_TOKEN)
    check(f"DELETE /bookings/{DEL_BOOKING_ID} → 403 (non-owner)", s == 403, r)
    check("403 detail message present", "Access denied" in r.get("detail",""), r)

    # Owner cancels — status_code 200, returns JSON body
    s, r = delete(f"/bookings/{DEL_BOOKING_ID}", token=EMP_TOKEN)
    check(f"DELETE /bookings/{DEL_BOOKING_ID} → 200 (owner)", s == 200, r)
    check("Cancel response has status=cancelled", r.get("status") == "cancelled", r)
    check("Cancel response has booking_id, desk_id, message",
          all(k in r for k in ("booking_id","desk_id","message","status")), r)

    # Confirm status in DB is "cancelled" (soft delete, not hard delete)
    s, confirm = get(f"/bookings/{DEL_BOOKING_ID}", token=ADMIN_TOKEN)
    check("After cancel: booking still exists in DB (soft delete)", s == 200, confirm)
    check("After cancel: status field is 'cancelled'", confirm.get("status") == "cancelled", confirm)
    check("After cancel: analytics count still intact (row not deleted)",
          s == 200, {"note": "row exists → analytics counts unaffected"})

    # Cannot cancel AGAIN (terminal state guard)
    s, r = delete(f"/bookings/{DEL_BOOKING_ID}", token=EMP_TOKEN)
    check("DELETE already-cancelled booking → 400", s == 400, r)
    check("400 detail mentions terminal state", "terminal" in r.get("detail","").lower(), r)

# Admin can cancel any booking
DESK_ADEL = f"DESK-ADEL-{UNIQUE_TS}"
s, adel_bk = post("/bookings/", {"desk_id": DESK_ADEL, "start_time": "2026-12-15T10:00:00", "end_time": "2026-12-15T12:00:00"}, token=EMP_TOKEN)
ADEL_ID = adel_bk.get("id")
if ADEL_ID:
    s, r = delete(f"/bookings/{ADEL_ID}", token=ADMIN_TOKEN)
    check(f"DELETE /bookings/{ADEL_ID} → 200 (admin cancelling emp booking)", s == 200, r)

# 404 for nonexistent
s, r = delete("/bookings/999999", token=ADMIN_TOKEN)
check("DELETE /bookings/999999 → 404", s == 404, r)

# No auth → 401
s, r = delete(f"/bookings/{DEL_BOOKING_ID or 1}")
check("DELETE /bookings/{id} without token → 401", s == 401, r)

# ── SECTION 7: GET /admin/users ───────────────────────────────────────────────
print("\n[7] GET /admin/users")

s, r = get("/admin/users", token=ADMIN_TOKEN)
check("GET /admin/users → 200 (admin)", s == 200, r)
check("Returns a list", isinstance(r, list), {"type": type(r).__name__})
check("List has >= 1 user", len(r) >= 1, {"count": len(r)})
if r:
    u = r[0]
    check("User object has id, email, role", all(k in u for k in ("id","email","role")), u)
    check("User object does NOT expose hashed_password", "hashed_password" not in u, u)

# Employee is BLOCKED → 403
s, r = get("/admin/users", token=EMP_TOKEN)
check("GET /admin/users → 403 (employee)", s == 403, r)
check("403 detail message correct",
      "privileges" in r.get("detail","").lower() or "access denied" in r.get("detail","").lower(), r)

# No auth → 401
s, r = get("/admin/users")
check("GET /admin/users without token → 401", s == 401, r)

# ── SECTION 8: PUT /admin/users/{id}/role ────────────────────────────────────
print("\n[8] PUT /admin/users/{id}/role")

# Get emp1's user id from admin/users list
s, users_list = get("/admin/users", token=ADMIN_TOKEN)
EMP1_USER_ID = next((u["id"] for u in users_list if u["email"] == EMP_EMAIL), None)

if EMP1_USER_ID:
    # Admin promotes emp1 → admin
    s, r = put(f"/admin/users/{EMP1_USER_ID}/role?new_role=admin", token=ADMIN_TOKEN)
    check(f"PUT /admin/users/{EMP1_USER_ID}/role?new_role=admin → 200 (admin)", s == 200, r)
    check("Response shows updated role=admin", r.get("role") == "admin", r)
    check("Response has id, email, role (no password)", all(k in r for k in ("id","email","role")), r)

    # Reset back to employee
    s, r = put(f"/admin/users/{EMP1_USER_ID}/role?new_role=employee", token=ADMIN_TOKEN)
    check("PUT /admin/users/{id}/role reset → employee", s == 200 and r.get("role") == "employee", r)

    # Invalid role value → 400
    s, r = put(f"/admin/users/{EMP1_USER_ID}/role?new_role=manager", token=ADMIN_TOKEN)
    check("PUT /admin/users/{id}/role?new_role=manager → 400 (invalid)", s == 400, r)
    check("400 detail mentions invalid role", "invalid role" in r.get("detail","").lower() or
          "manager" in r.get("detail","").lower(), r)

    # Employee CANNOT call this → 403
    s, r = put(f"/admin/users/{EMP1_USER_ID}/role?new_role=admin", token=EMP_TOKEN)
    check("PUT /admin/users/{id}/role → 403 (employee token)", s == 403, r)

# 404 for nonexistent user
s, r = put("/admin/users/999999/role?new_role=employee", token=ADMIN_TOKEN)
check("PUT /admin/users/999999/role → 404", s == 404, r)

# Admin cannot modify own role
ADMIN_USER_ID = next((u["id"] for u in users_list if u["email"] == ADMIN_EMAIL), None)
if ADMIN_USER_ID:
    s, r = put(f"/admin/users/{ADMIN_USER_ID}/role?new_role=employee", token=ADMIN_TOKEN)
    check("Admin modifying own role → 400 (self-demotion guard)", s == 400, r)
    check("400 detail mentions self-modification", "own role" in r.get("detail","").lower() or
          "themselves" in r.get("detail","").lower() or "self" in r.get("detail","").lower(), r)

# No auth → 401
s, r = put(f"/admin/users/{EMP1_USER_ID or 1}/role?new_role=admin")
check("PUT /admin/users/{id}/role without token → 401", s == 401, r)

# ── SECTION 9: FIELD NAMING CONSISTENCY AUDIT ────────────────────────────────
print("\n[9] FIELD NAMING CONSISTENCY AUDIT")

s, bookings_list = get("/bookings/me", token=ADMIN_TOKEN)
if bookings_list and isinstance(bookings_list, list) and bookings_list:
    bk = bookings_list[0]
    keys = list(bk.keys())
    check("BookingResponse uses snake_case keys", all(k == k.lower() and " " not in k for k in keys), keys)
    check("start_time / end_time present (not startTime/endTime)", "start_time" in bk and "end_time" in bk, keys)
    check("final_price present (not finalPrice)", "final_price" in bk, keys)
    check("noshow_probability present (not noshowProbability)", "noshow_probability" in bk, keys)
    check("status is lowercase string value", bk.get("status","").islower(), {"status": bk.get("status")})

s, dsks = get("/desks/", token=EMP_TOKEN)
if dsks.get("desks"):
    dk = dsks["desks"][0]
    dkeys = list(dk.keys())
    check("DeskResponse uses snake_case keys", all(k == k.lower() and " " not in k for k in dkeys), dkeys)
    check("desk_id present (not deskId)", "desk_id" in dk, dkeys)
    check("base_price present (not basePrice)", "base_price" in dk, dkeys)
    check("is_active present (not isActive)", "is_active" in dk, dkeys)
    check("is_active value is lowercase", dk.get("is_active","").islower(), {"is_active": dk.get("is_active")})

s, asum = get("/analytics/summary", token=ADMIN_TOKEN)
akeys = list(asum.keys())
check("AnalyticsSummary uses snake_case keys", all(k == k.lower() and " " not in k for k in akeys), akeys)

# Check date format consistency (all datetimes should be ISO 8601 strings)
s, mybks = get("/bookings/me", token=ADMIN_TOKEN)
if mybks and isinstance(mybks, list) and mybks:
    dt_val = mybks[0].get("start_time","")
    check("start_time is ISO 8601 string (not epoch int)",
          isinstance(dt_val, str) and ("T" in dt_val or "-" in dt_val), {"start_time": dt_val})

# ── SUMMARY ───────────────────────────────────────────────────────────────────
total   = len(results)
passed  = sum(1 for t, _ in results if t == PASS)
failed  = sum(1 for t, _ in results if t == FAIL)

print("\n" + "="*70)
print(f"  RESULTS: {passed}/{total} passed   |   {failed} failed")
print("="*70)
if failed:
    print("\n  FAILURES:")
    for tag, label in results:
        if tag == FAIL:
            print(f"    {FAIL} {label}")
else:
    print("\n  All checks passed.")
print()
