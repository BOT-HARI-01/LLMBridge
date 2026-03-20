export function buildStrictJSONPrompt({ task, context, schema }) {
  return `
You are an autonomous API interface agent. 
Your goal: ${task}

DATA CONTEXT:
${context}

EXPECTED JSON STRUCTURE:
${JSON.stringify(schema, null, 2)}

STRICT RESPONSE RULES:
1. OUTPUT ONLY THE RAW JSON.
2. NO MARKDOWN BLOCKS.
3. NO PREAMBLE OR EXPLANATION.
4. All strings must use DOUBLE QUOTES (").
5. Ensure the response is a single, valid JSON structure (Object or Array) matching the schema above.
`;
}

export async function askLLM(prompt) {
  try {
    const response = await fetch('http://localhost:3000/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();

    if (result.ok && result.data) {
      let cleaned = result.data;

      cleaned = cleaned.replace(/```json|```/g, '');

      cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

      cleaned = cleaned.replace(/[\r\n]+/g, ' ').trim();

      result.data = cleaned;
    }

    return result;
  } catch (err) {
    console.error('LLMBridge Error');
    throw err;
  }
}
