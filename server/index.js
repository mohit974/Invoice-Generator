import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import routes from "./routes/invoice.js";

const app = express();

app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
const PORT = 5000;
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("APP IS RUNNING");
});

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
