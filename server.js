import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "15mb" }));

app.get("/", (req, res) => {
  res.send("Bird API running");
});

app.post("/analyze", async (req, res) => {
  try {
    let groqPayload;

    // 1) Kiro 방식: imageBase64, imageMime, prompt를 보낸 경우
    if (req.body.imageBase64 && req.body.prompt) {
      const imageMime = req.body.imageMime || "image/jpeg";

      groqPayload = {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: req.body.prompt },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageMime};base64,${req.body.imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 1024
      };
    } else {
      // 2) 기존 방식: 프론트가 Groq payload 전체를 보낸 경우
      groqPayload = req.body;
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(groqPayload)
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      detail: error.message
    });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server started");
});
