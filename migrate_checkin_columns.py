"""
One-shot migration: adds check_in_token and checked_in_at columns to the
bookings table if they don't already exist.
Run once: .venv\Scripts\python.exe migrate_checkin_columns.py
"""
import asyncio
from sqlalchemy import text
from app.db.session import engine

ADD_COLUMNS_SQL = """
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='bookings' AND column_name='check_in_token'
    ) THEN
        ALTER TABLE bookings ADD COLUMN check_in_token TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS ix_bookings_check_in_token ON bookings(check_in_token);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='bookings' AND column_name='checked_in_at'
    ) THEN
        ALTER TABLE bookings ADD COLUMN checked_in_at TIMESTAMP;
    END IF;
END
$$;
"""

async def run():
    async with engine.begin() as conn:
        await conn.execute(text(ADD_COLUMNS_SQL))
    print("[OK] Migration complete: check_in_token and checked_in_at columns are ready.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run())
