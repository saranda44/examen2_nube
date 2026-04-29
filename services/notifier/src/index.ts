import express from "express";
import { notifyClient } from "./controllers/notifier.controller";

const app = express();
const port = 8082;

app.use(express.json());

// Health check para Kubernetes
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});

// Endpoint principal
app.post("/notify", notifyClient);

app.listen(port, () => {
    console.log(`notifier corriendo en puerto ${port}`);
});