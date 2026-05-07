import asyncio
from app.core.database import init_db
from app.models.session import Session

async def main():
    await init_db()
    try:
        session = await Session.get("69fccb01de092e3cd728c670")
        print("Success:", session.id if session else "None")
    except Exception as e:
        print("Error getting session with string ID:", type(e).__name__, e)

if __name__ == "__main__":
    asyncio.run(main())
