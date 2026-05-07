import asyncio
import json
from app.services import gemini_service
from app.services import nlp_service

def test():
    try:
        metrics = nlp_service.run_nlp_pipeline("I used python and sql to build a cool app.", "")
        res = gemini_service.evaluate_answer("What is your experience?", "I used python and sql to build a cool app.", metrics)
        print("Success:")
        print(res)
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {e}")

if __name__ == "__main__":
    test()
