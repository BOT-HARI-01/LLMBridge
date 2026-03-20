import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from Client.llmClient import ask_llm, build_strict_json_prompt
import json

def run_task():
    task = "Extract product details from the description."
    context = "The new UltraTab G15 features 128GB storage and a 12-inch OLED screen for $499."
    
    # Define the structure you WANT
    schema = {
        "product_name": "string",
        "storage_gb": "number",
        "screen_size_inches": "number",
        "price_usd": "number"
    }

    # 1. Build the prompt
    prompt = build_strict_json_prompt(task, context, schema)

    # 2. Call the bridge
    response = ask_llm(prompt)

    if response.get('ok'):
        try:
            # Parse the result string
            data = json.loads(response['data'])
            print("Data Extracted Successfully:")
            print(json.dumps(data, indent=4))
        except Exception as e:
            print(f"JSON Parse Error: {e}")
            print("Raw Response:", response.get('data'))

if __name__ == "__main__":
    run_task()