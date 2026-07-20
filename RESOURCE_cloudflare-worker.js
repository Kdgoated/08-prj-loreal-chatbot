// Copy this code into your Cloudflare Worker script.
// Store the OpenAI key in Cloudflare under "Variables and Secrets".

export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENAI_API_KEY environment secret.",
        }),
        {
          status: 500,
          headers: corsHeaders,
        },
      );
    }

    const userInput = await request.json();

    const requestBody = {
      model: "gpt-4.1",
      messages: userInput.messages,
      max_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  },
};
