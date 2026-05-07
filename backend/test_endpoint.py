import requests
import json

def test():
    # We will use the session_id from the user's URL
    url = "http://127.0.0.1:8000/api/interviews/evaluate"
    payload = {
        "session_id": "69fccb01de092e3cd728c670",
        "user_answer": "I have a lot of experience."
    }
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer dummy_token"
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        print("====== STATUS ======")
        print(response.status_code)
        print("====== TEXT ======")
        print(response.text)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
