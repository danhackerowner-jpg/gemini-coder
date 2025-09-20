require("dotenv").config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// AI endpoint
app.post("/api/ask", async (req, res) => {
  const { message, file, code } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "system", parts: [{ text: "You are an AI code editor. Modify only the requested file’s code. Respond with ONLY raw updated code." }] },
            { role: "user", parts: [{ text: `File: ${file}\nCurrent Code:\n${code}\n\nInstruction: ${message}\n\nReturn only updated full code.` }] }
          ]
        })
      }
    );

    const data = await response.json();
    const aiCode = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    res.json({ newCode: aiCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
          
