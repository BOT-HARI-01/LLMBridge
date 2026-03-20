import requests
import json

def build_strict_json_prompt(task, context, schema):
    """
    Constructs a prompt that forces the LLM to return valid, raw JSON.
    """
    return f"""
You are an autonomous API interface agent. 
Your goal: {task}

DATA CONTEXT:
{context}

EXPECTED JSON STRUCTURE:
{json.dumps(schema, indent=2)}

STRICT RESPONSE RULES:
1. OUTPUT ONLY THE RAW JSON OBJECT.
2. NO MARKDOWN BLOCKS. DO NOT use ```json or ```.
3. NO PREAMBLE OR EXPLANATION.
4. All strings must use DOUBLE QUOTES (").
5. If a value is unknown, use null.
6. Ensure the response is a single, valid JSON object matching the structure above.
"""

def ask_llm(prompt):
    """
    Sends a prompt to the LLMBridge native host and returns the response.
    """
    try:
        url = "http://localhost:3000/prompt"
        response = requests.post(url, json={"prompt": prompt})
        
        if response.status_code != 200:
            return {"ok": False, "error": f"Server error: {response.status_code}"}
            
        return response.json()
    except requests.exceptions.ConnectionError:
        return {"ok": False, "error": "Native host not reachable. Is the bridge connected?"}