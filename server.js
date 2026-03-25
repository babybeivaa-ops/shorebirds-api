import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req,res)=>{
  res.send("Bird API running");
});

app.post("/analyze", async (req,res)=>{

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify(req.body)
    }
  );

  const data = await response.json();
  res.json(data);

});

const PORT = process.env.PORT || 10000;

app.listen(PORT,()=>{
  console.log("Server started");
});
