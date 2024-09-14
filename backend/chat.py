import requests


def send_message(message):
    response = requests.post(
        "http://127.0.0.1:8000/dialogue", json={"message": message}
    )
    return response.json()


if __name__ == "__main__":
    print("Start chatting with the agent (type 'exit' to quit):")
    while True:
        user_message = input("You: ")
        if user_message.lower() == "exit":
            break
        response = send_message(user_message)
print(f"Agent: {response.get('response', 'Error: No response from agent')}")
