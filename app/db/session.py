from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from urllib.parse import quote_plus
from app.core.config import settings

# URL-encode password to safely handle special characters like '@', ':', '/' in the DSN
_encoded_password = quote_plus(settings.DB_PASSWORD)

DATABASE_URL = (
    f"postgresql+asyncpg://{settings.DB_USER}:{_encoded_password}"
    f"@127.0.0.1:{settings.DB_PORT}/{settings.DB_NAME}"
)

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args={"ssl": False}  # Disable SSL on localhost — asyncpg boolean False is fine here
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