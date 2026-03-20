import { askLLM } from '../../Client/llmClient.js';

async function performAITask() {
  const prompt = "Extract contact information from the text. Reach out to John Doe at john.doe@example.com or call 555-0199.";

  const response = await askLLM(prompt);

  if (response.ok) {
    try {
      const data = response.data;
      console.log("Extracted Data:", data);
    } catch (e) {
      console.error("Error", e);
    }
  }
}

await performAITask()