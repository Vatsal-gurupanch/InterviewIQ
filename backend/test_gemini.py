import asyncio
from app.services.gemini_service import generate_question

def main():
    print("Testing generate_question...")
    res = generate_question(role="Frontend Developer", mode="technical", history=[])
    print("Result 1:", res)
    
    res2 = generate_question(role="Frontend Developer", mode="technical", history=[{"q": "Q1", "a": "A1"}])
    print("Result 2:", res2)

if __name__ == "__main__":
    main()
