import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/flights", async (req, res) => {
  try {
    const response = await fetch(
      "https://aeroapi.flightaware.com/aeroapi/airports/SBGR/flights",
      {
        headers: {
          "Accept": "application/json; charset=UTF-8",
          "x-apikey": "u08IR2ZC8GsXGxzNjhzgOeEZS9jgINGC"
        }
      }
    );
    const data = await response.json();
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "API error", detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on ${PORT}`);
});