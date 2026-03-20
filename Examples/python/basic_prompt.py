import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from Client.llmClient import ask_llm


def run_task():

    # 1. Write the prompt
    prompt = "Extract product details from the description. The new UltraTab G15 features 128GB storage and a 12-inch OLED screen for $499."

    # 2. Call the bridge
    response = ask_llm(prompt)

    if response.get("ok"):
        try:
            print("Data:")
            print(response["data"])
        except Exception as e:
            print("Error", e)


if __name__ == "__main__":
    run_task()
