import asyncio
from app.services.gemini_service import generate_question

def main():
    print("Testing generate_question with history...")
    history = [
        {"q": "Can you explain what the DOM (Document Object Model) is?", "a": "The DOM is a tree representation of the HTML document."},
    ]
    res1 = generate_question(role="Frontend Developer", mode="technical", history=history)
    print("Result 1:", res1)
    
    history.append({"q": res1.get("question"), "a": "I don't know much about that."})
    res2 = generate_question(role="Frontend Developer", mode="technical", history=history)
    print("Result 2:", res2)

    history.append({"q": res2.get("question"), "a": "Let's move on."})
    res3 = generate_question(role="Frontend Developer", mode="technical", history=history)
    print("Result 3:", res3)


if __name__ == "__main__":
    main()
