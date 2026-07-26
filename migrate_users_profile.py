import asyncio
from sqlalchemy import text
from app.db.session import engine

async def migrate_users_table():
    print("Connecting to database to run users profile migration...")
    async with engine.begin() as conn:
        print("Ensuring full_name column exists...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;"))

        print("Ensuring company_name column exists...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name VARCHAR;"))

        print("Ensuring usage_type column exists...")
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS usage_type VARCHAR;"))

    print("User profile migration complete!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_users_table())
