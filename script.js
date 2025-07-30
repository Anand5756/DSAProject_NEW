const API_KEY = "AIzaSyC2RYvVU7ARCUDsNMGD_hfFmPygp_rYRpo"; // 🔐 Paste your Gemini API key here
const MODEL = "models/gemini-1.5-flash"; // Or use "gemini-1.5-pro"

const inputField = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const typingIndicator = document.getElementById("typingIndicator");

async function sendMessage() {
  const userInput = inputField.value.trim();
  if (!userInput) return;

  appendMessage("You", userInput, "user");
  inputField.value = "";
  inputField.disabled = true;
  typingIndicator.style.display = "block";

  const prompt = `System: You are a friendly AI who only answers Data Structures and Algorithms (DSA) questions in a simple way. If the user asks anything else, reply politely and Say I am not able to answer question which is not related to DSA. Give answer in bullet points so that the user uderstand easily User: ${userInput}`;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    let botReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response from Gemini.";
    botReply = formatBullets(botReply);  // ✨ convert • bullets to HTML list
    appendMessage("Bot", botReply, "bot");

    // speak(botReply);

  } catch (error) {
    appendMessage("Bot", "❌ Error: " + error.message, "bot");
  } finally {
    inputField.disabled = false;
    typingIndicator.style.display = "none";
    inputField.focus();
  }
}

function appendMessage(sender, text, cssClass) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-msg ${cssClass}`;
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enter key support
inputField.addEventListener("keydown", function (e) {
  if (e.key === "Enter") sendMessage();
});

// Human-like speech
function speak(text) {
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();

    const preferredVoice =
      voices.find(voice => voice.name.includes("Google") && voice.lang === "hi-IN") ||
      voices.find(voice => voice.name.includes("Microsoft") && voice.lang === "hi-IN") ||
      voices.find(voice => voice.lang === "hi-IN");

    if (preferredVoice) utter.voice = preferredVoice;

    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    speechSynthesis.speak(utter);
  }
}

// Preload voices
window.speechSynthesis.onvoiceschanged = () => {
  speechSynthesis.getVoices();
};

function formatBullets(text) {
  // Convert lines starting with •, -, or * into <li>
  const lines = text.split('\n');
  let inList = false;
  let formatted = '';

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (/^[-•*]\s+/.test(trimmed)) {
      if (!inList) {
        inList = true;
        formatted += '<ul>';
      }
      formatted += `<li>${trimmed.replace(/^[-•*]\s+/, '')}</li>`;
    } else {
      if (inList) {
        inList = false;
        formatted += '</ul>';
      }
      formatted += `<p>${trimmed}</p>`;
    }
  });

  if (inList) formatted += '</ul>';
  return formatted;
}
