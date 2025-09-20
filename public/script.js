// ---------------- FILE SYSTEM ----------------
const files = {
  "index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <link rel='stylesheet' href='style.css'>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src='script.js'></script>\n</body>\n</html>",
  "style.css": "body { font-family: Arial; background: #fafafa; } h1 { color: #007acc; }",
  "script.js": "console.log('Hello from script.js');"
};

let currentFile = "index.html";

const fileList = document.querySelectorAll("#sidebar li");
const editor = document.getElementById("codeEditor");
const iframe = document.getElementById("liveFrame");

function loadFile(name) {
  currentFile = name;
  editor.value = files[name];
  fileList.forEach(li => li.classList.remove("active"));
  document.querySelector(`#sidebar li[data-file='${name}']`).classList.add("active");
  updatePreview();
}

function updatePreview() {
  const html = files["index.html"];
  const css = `<style>${files["style.css"]}</style>`;
  const js = `<script>${files["script.js"]}<\/script>`;
  iframe.srcdoc = html.replace("</head>", css + "</head>").replace("</body>", js + "</body>");
}

editor.addEventListener("input", () => {
  files[currentFile] = editor.value;
  updatePreview();
});

fileList.forEach(li => {
  li.addEventListener("click", () => loadFile(li.dataset.file));
});

loadFile("index.html");

// ---------------- CHAT SYSTEM ----------------
const convo = document.getElementById("conversation");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = "msg " + sender;
  div.textContent = text;
  convo.appendChild(div);
  convo.scrollTop = convo.scrollHeight;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, file: currentFile, code: files[currentFile] })
    });
    const data = await response.json();

    if (data.newCode) {
      files[currentFile] = data.newCode;
      editor.value = data.newCode;
      updatePreview();
      addMessage(`✅ Updated ${currentFile}`, "ai");
    } else {
      addMessage(data.error || "⚠️ No reply from AI", "ai");
    }
  } catch (e) {
    addMessage("⚠️ Error: " + e.message, "ai");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });
