import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhook.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/webhook", webhookRoutes);

app.get("/", (req, res) => {
  res.send("CHICA MOCHA API");
});

app.listen(process.env.PORT, () => {
  console.log(`Backend corriendo en http://localhost:${process.env.PORT}`);
});