import { askLLM, buildStrictJSONPrompt } from '../../Client/llmClient.js';

async function performAITask() {
  const task = "Extract contact information from the text.";
  const context = "Reach out to John Doe at john.doe@example.com or call 555-0199.";
  
  // Define the structure you WANT
  const schema = {
    name: "string",
    email: "string",
    phone: "string",
    confidence_score: "number (0-1)"
  };

  const prompt = buildStrictJSONPrompt({ task, context, schema });
  const response = await askLLM(prompt);

  if (response.ok) {
    try {
      const data = JSON.parse(response.data);
      console.log("Extracted Data:", data);
    } catch (e) {
      console.error("Parsing Error. Raw Text:", response.data);
    }
  }
}

await performAITask()

