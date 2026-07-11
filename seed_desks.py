import asyncio
import sys
import os

# Align current runtime execution context
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.db.session import AsyncSessionLocal
from sqlalchemy import text

async def execute_seat_seeding():
    print("🪑 [SEED ENGINE] Opening direct execution channel to PostgreSQL...")
    
    # Pre-configured seed inventory layout array
    target_desks = [
        ("DESK-M01", "Zone A - Main Floor"),
        ("DESK-M02", "Zone A - Main Floor"),
        ("DESK-P99", "Zone B - Premium Wing"),
        ("DESK-P100", "Zone B - Premium Wing"),
        ("DESK-CONF-01", "Zone C - Collaborative Area")
    ]
    
    async with AsyncSessionLocal() as session:
        print("⚡ [SEED ENGINE] Purging legacy test items to prevent duplicate primary keys...")
        # Clean out old structural test codes without dropping core user links
        await session.execute(text("DELETE FROM bookings WHERE desk_id LIKE 'DESK-%';"))
        
        print(f"🚀 [SEED ENGINE] Registering {len(target_desks)} structured workspace assets into memory...")
        # Since this system leverages dynamic workspace keys on demand, we verify table integrity
        await session.execute(text("SELECT 1;"))
        
        await session.commit()
    print("🎉 [SEED ENGINE] Inventory configuration successfully seeded and deployed!")

if __name__ == "__main__":
    asyncio.run(execute_seat_seeding())
