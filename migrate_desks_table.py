"""
migrate_desks_table.py
Run once to create the desks table and seed the standard workspace inventory.
Usage: python migrate_desks_table.py
"""
import asyncio
import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.db.session import engine, AsyncSessionLocal
from app.models.desk import Desk
from app.db.base_class import Base


# Default desk inventory -- matches desk_ids referenced in existing booking rows
DESK_INVENTORY = [
    {"desk_id": "DESK-A01",     "location": "Zone A - Main Floor",        "base_price": 120.0, "amenities": "WiFi,Monitor,Power"},
    {"desk_id": "DESK-A02",     "location": "Zone A - Main Floor",        "base_price": 120.0, "amenities": "WiFi,Monitor,Power"},
    {"desk_id": "DESK-M01",     "location": "Zone A - Main Floor",        "base_price": 120.0, "amenities": "WiFi,Power"},
    {"desk_id": "DESK-M02",     "location": "Zone A - Main Floor",        "base_price": 120.0, "amenities": "WiFi,Power"},
    {"desk_id": "DESK-P99",     "location": "Zone B - Premium Wing",      "base_price": 180.0, "amenities": "WiFi,4K Monitor,Standing Desk,Power"},
    {"desk_id": "DESK-P100",    "location": "Zone B - Premium Wing",      "base_price": 180.0, "amenities": "WiFi,4K Monitor,Standing Desk,Power"},
    {"desk_id": "DESK-CONF-01", "location": "Zone C - Collaborative Area","base_price": 200.0, "amenities": "WiFi,Whiteboard,Projector,Power"},
    {"desk_id": "DESK-CONF-02", "location": "Zone C - Collaborative Area","base_price": 200.0, "amenities": "WiFi,Whiteboard,Power"},
]


async def run_migration():
    print("[MIGRATION] Creating desks table if not exists...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[MIGRATION] Table structure verified.")

    print(f"[SEED] Inserting {len(DESK_INVENTORY)} desk records (skipping duplicates)...")
    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        for desk_data in DESK_INVENTORY:
            result = await session.execute(
                select(Desk).where(Desk.desk_id == desk_data["desk_id"])
            )
            existing = result.scalar_one_or_none()
            if existing:
                print(f"   [SKIP]   {desk_data['desk_id']} -- already exists.")
                continue
            session.add(Desk(**desk_data))
            print(f"   [INSERT] {desk_data['desk_id']} @ {desk_data['location']}")

        await session.commit()

    print("[MIGRATION] desks table fully seeded and ready.")


if __name__ == "__main__":
    asyncio.run(run_migration())
