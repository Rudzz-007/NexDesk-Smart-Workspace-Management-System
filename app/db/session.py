import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = (
    f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@127.0.0.1:{settings.DB_PORT}/{settings.DB_NAME}"
)

# We use an explicit custom asyncpg connection creator to bypass Windows getaddrinfo DNS resolution entirely
async def custom_connect():
    return await asyncpg.connect(
        host="127.0.0.1",
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )

engine = create_async_engine(
    "postgresql+asyncpg://",  # Keep prefix base schema generic
    async_creator=custom_connect,  # Direct reference to our raw memory connection maps
    echo=False,
    future=True
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session