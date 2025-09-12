const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get("/tokenPrice", async (req, res) => {
  try {
    const { addressOne, addressTwo } = req.query;

    // Validate if addresses are provided
    if (!addressOne || !addressTwo) {
      return res.status(400).json({ error: "Missing token address parameters" });
    }

    // Validate if addresses are valid Ethereum addresses
    if (!addressOne.match(/^0x[a-fA-F0-9]{40}$/) || !addressTwo.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: "Invalid token address format" });
    }

    const responseOne = await Moralis.EvmApi.token.getTokenPrice({
      address: addressOne
    });

    const responseTwo = await Moralis.EvmApi.token.getTokenPrice({
      address: addressTwo
    });

    const usdPrices = {
      tokenOne: responseOne.raw.usdPrice,
      tokenTwo: responseTwo.raw.usdPrice,
      ratio: responseOne.raw.usdPrice / responseTwo.raw.usdPrice
    }

    return res.status(200).json(usdPrices)

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ 
      error: "Internal server error", 
      details: error.message 
    });
  }
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});