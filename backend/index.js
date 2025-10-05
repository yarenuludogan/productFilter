const express = require("express");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());

const products = JSON.parse(fs.readFileSync("products.json", "utf-8"));

async function getGoldPrice() {
  try {
    const res = await axios.get("https://api.metals.dev/v1/latest", {
      params: {
        api_key: "demo",
        currency: "USD",
        metals: "XAU"
      }
    });
    const pricePerGram = res.data.metals.XAU / 31.1035;
    return pricePerGram;
  } catch (error) {
    console.error("Gold price fetch error:", error.message);
    return 60;
  }
}

app.get("/api/products", async (req, res) => {
  const goldPrice = await getGoldPrice();

  const updatedProducts = products.map(p => {
    const hesap = (p.popularityScore + 1) * p.weight * goldPrice;

    return {
      ...p,
      price: parseFloat(hesap.toFixed(2)),
      popularityScoreOutOf5: parseFloat((p.popularityScore * 5).toFixed(1))
    };
  });

  res.json(updatedProducts);
});

app.listen(PORT, () => {
  console.log(`Backend running: http://localhost:${PORT}`);
});
