import express from "express";
import { generatePDF } from "./controllers/pdf.controller";

const app = express();
const port = 8081;

app.use(express.json());

// Health check para Kubernetes
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Endpoint principal
app.post("/generate", generatePDF);

app.listen(port, () => {
    console.log(`pdf-generator corriendo en puerto ${port}`);
});