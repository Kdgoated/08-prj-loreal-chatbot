/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");

// Replace this with your deployed Cloudflare Worker URL.
const workerUrl = "https://your-cloudflare-worker-url.workers.dev/";

// Keep a conversation history so the assistant can answer in context.
const conversation = [
  {
    role: "system",
    content:
      "You are the L'Oréal Beauty Assistant. Only answer questions related to L'Oréal products, routines, recommendations, skincare, makeup, haircare, fragrance, and general beauty guidance. If the request is unrelated, politely explain that you can only help with beauty and L'Oréal product topics.",
  },
];

// Small list of beauty-related words to keep the answers on topic.
const beautyKeywords = [
  "loreal",
  "skincare",
  "makeup",
  "foundation",
  "lipstick",
  "haircare",
  "fragrance",
  "beauty",
  "routine",
  "products",
  "serum",
  "cream",
  "shampoo",
  "conditioner",
  "moisturizer",
  "mask",
  "perfume",
  "face",
  "skin",
  "hair",
];

/* Create the opening greeting */
function addMessage(role, text, question = "") {
  const messageWrapper = document.createElement("div");
  messageWrapper.className = `msg ${role}`;

  if (role === "assistant" && question) {
    const questionLabel = document.createElement("div");
    questionLabel.className = "question-label";
    questionLabel.textContent = `Latest question: ${question}`;
    messageWrapper.appendChild(questionLabel);
  }

  const textNode = document.createElement("div");
  textNode.className = "message-text";
  textNode.textContent = text;
  messageWrapper.appendChild(textNode);

  chatWindow.appendChild(messageWrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setInitialMessage() {
  addMessage(
    "assistant",
    "👋 Hello! I’m your L’Oréal Beauty Assistant. Ask me about skincare, makeup, haircare, fragrance, or a personalized routine.",
  );
}

function isBeautyRelated(message) {
  const lowerCaseMessage = message.toLowerCase();
  return beautyKeywords.some((keyword) => lowerCaseMessage.includes(keyword));
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userMessage = userInput.value.trim();
  if (!userMessage) {
    return;
  }

  addMessage("user", userMessage);
  userInput.value = "";

  if (!isBeautyRelated(userMessage)) {
    addMessage(
      "assistant",
      "I can only help with L’Oréal products, beauty routines, and related beauty topics. You can ask me about skincare, makeup, haircare, fragrances, or a personalized routine.",
      userMessage,
    );
    return;
  }

  conversation.push({ role: "user", content: userMessage });

  const loadingMessage = document.createElement("div");
  loadingMessage.className = "msg assistant loading";
  loadingMessage.textContent = "Thinking…";
  chatWindow.appendChild(loadingMessage);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: conversation,
      }),
    });

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "I’m sorry, I couldn't generate a response right now.";

    loadingMessage.remove();
    addMessage("assistant", reply, userMessage);
    conversation.push({ role: "assistant", content: reply });
  } catch (error) {
    loadingMessage.remove();
    addMessage(
      "assistant",
      "I hit a connection issue while contacting the assistant service. Please try again in a moment.",
      userMessage,
    );
    console.error(error);
  }
});

setInitialMessage();
