import "dotenv/config";
import express from "express";

const app = express();

app.get("/", (req, res) => res.send("Hello there obi wan"));

app.listen(8080, () => console.log("Server listening at port 8080"));
