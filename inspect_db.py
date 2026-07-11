import bcrypt

# Test common passwords against the hash for rudra@example.com
target_hash = b"$2b$12$lTb5X3PWaixppJbeel/LdOxqTLU6HBopZI2oxeR7hTGbUIaKZhKDG"

candidates = [
    "admin123", "password", "password123", "test123", "123456",
    "Krishna@770", "rudra123", "nexdesk123", "admin@123",
    "Password1", "Admin123", "Secret123", "nexdesk",
    "rudra", "admin", "qwerty", "letmein", "welcome",
    "12345678", "Rudra@123", "Rudra123"
]

print("Testing passwords for rudra@example.com...")
found = False
for pw in candidates:
    if bcrypt.checkpw(pw.encode(), target_hash):
        print(f"  FOUND! Password is: {pw}")
        found = True
        break
    else:
        print(f"  [x] {pw}")

if not found:
    print("\nNot found in common list. Try the signup endpoint to create a known user instead.")
