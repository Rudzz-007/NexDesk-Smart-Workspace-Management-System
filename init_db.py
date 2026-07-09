import sys
import os
import asyncio

# 1. Force the root path context
BASE_DIR = r"C:\Users\Rudra\OneDrive\Desktop\Management System\NexDesk-Smart-Workspace-Management-System"
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from app.db.session import engine
from app.models import Base

async def init_models():
    print("Connecting to PostgreSQL 18 cluster at localhost...")
    async with engine.begin() as conn:
        print("Initializing Schema Tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_models())