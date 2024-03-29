const btcPrice = document.getElementById("btc-price");
const fastestFee = document.getElementById("fastest-fee");
const halfHourFee = document.getElementById("half-hour-fee");
const oneHourFee = document.getElementById("one-hour-fee");
const latestBlocks = document.getElementById("latest-blocks");

// Define an array of API endpoints
const apiEndpoints = [
  "https://api.coincap.io/v2/assets/bitcoin"
];

// Current API index
let currentApiIndex = 0;

// Fetch the current Bitcoin price
async function fetchBitcoinPrice() {
  try {
    const currentApiEndpoint = apiEndpoints[currentApiIndex];
    const response = await fetch(currentApiEndpoint);
    const data = await response.json();

    if (response.ok) {
      let price;

      if (currentApiEndpoint.includes("coingecko")) {
        price = data.bitcoin.usd;
      } else if (currentApiEndpoint.includes("coincap")) {
        price = data.data.priceUsd;
      }

      btcPrice.textContent = `${parseFloat(price).toFixed(2)} USD`;
      btcPrice.style.color = "#FFB86C";

      // Add the flash class to animate the text
      btcPrice.classList.add("flash");

      // Remove the flash class after the animation is completed
      setTimeout(() => {
        btcPrice.classList.remove("flash");
      }, 1000);

      // Toggle the current API index for the next fetch
      currentApiIndex = (currentApiIndex + 1) % apiEndpoints.length;

      return parseFloat(price);
    } else {
      console.error("Error fetching Bitcoin price:", data.error);
    }
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
  }
}

// HOW MUCH CORN???

async function updateBitcoinToCorn() {
  const pricePerOunce = 4.6; // Price of Bushel of Corn per USD 01/12/2024
  const btcPrice = await fetchBitcoinPrice();
  const btcToCorn = btcPrice / pricePerOunce;
  document.getElementById("btc-to-corn").textContent = `${btcToCorn.toFixed(
    2
  )} bushels`;
}

async function fetchBitcoinFeeRates() {
  try {
    const response = await fetch(
      "https://mempool.space/api/v1/fees/recommended"
    );
    const data = await response.json();

    // Get the current Bitcoin price in USD
    const btcPrice = await fetchBitcoinPrice();

    // Conversion function
    function satFeeToUsd(feeSat) {
      const satoshis = feeSat * 140; // Multiply sat/vB by an average tx size in vbytes (assume 140 vbytes)
      const btcAmount = satoshis / 100000000; // Convert sats to BTC
      return btcAmount * btcPrice; // Convert BTC to USD using the BTC price
    }

    const fastFeeUsd = satFeeToUsd(data.fastestFee);
    const mediumFeeUsd = satFeeToUsd(data.halfHourFee);
    const slowFeeUsd = satFeeToUsd(data.hourFee);

    // Update the DOM elements with the new fee rates
    fastestFee.innerHTML = `<span class="fee-rate-value">${
      data.fastestFee
    } sat/vB</span><br/><span style="color: #BD93F9">$${fastFeeUsd.toFixed(
      2
    )} USD</span>`;
    halfHourFee.innerHTML = `<span class="fee-rate-value">${
      data.halfHourFee
    } sat/vB</span><br/><span style="color: #BD93F9">$${mediumFeeUsd.toFixed(
      2
    )} USD</span>`;
    oneHourFee.innerHTML = `<span class="fee-rate-value">${
      data.hourFee
    } sat/vB</span><br/><span style="color: #BD93F9">$${slowFeeUsd.toFixed(
      2
    )} USD</span>`;

    // Add the flash class to the elements
    fastestFee.classList.add("flash");
    halfHourFee.classList.add("flash");
    oneHourFee.classList.add("flash");

    // Remove the flash class after the animation has completed (1 second)
    setTimeout(() => {
      fastestFee.classList.remove("flash");
      halfHourFee.classList.remove("flash");
      oneHourFee.classList.remove("flash");
    }, 1000);
  } catch (error) {
    console.error("Error fetching Bitcoin fee rates:", error);
  }
}

function sanitizeHTML(str) {
  const tempDiv = document.createElement("div");
  tempDiv.textContent = str;
  return tempDiv.innerHTML;
}

// Fetch latest Bitcoin blocks
async function fetchLatestBlocks() {
  try {
    const response = await fetch("https://mempool.space/api/v1/blocks");
    const data = await response.json();
    const latestBlocksTable = document.getElementById("latest-blocks");
    latestBlocksTable.innerHTML = "";

    // Slice the data array to include only the first 10 elements
    const lastTenBlocks = data.slice(0, 10);

    const blockRows = await Promise.all(
      lastTenBlocks.map(async (block) => {
        const row = document.createElement("tr");

        // Block Height
        const blockHeight = document.createElement("td");
        const blockHeightLink = document.createElement("a");
        blockHeightLink.href = `https://mempool.space/block/${block.id}`;
        blockHeightLink.textContent = block.height;
        blockHeightLink.style.color = "#FF79C6";
        blockHeight.appendChild(blockHeightLink);
        row.appendChild(blockHeight);

        // Timestamp
        const timestamp = document.createElement("td");
        timestamp.textContent = new Date(
          block.timestamp * 1000
        ).toLocaleString();
        row.appendChild(timestamp);

        // Transactions
        const transactions = document.createElement("td");
        transactions.textContent = sanitizeHTML(block.tx_count);
        row.appendChild(transactions);

        return row;
      })
    );

    for (const row of blockRows) {
      latestBlocksTable.appendChild(row);
    }
  } catch (error) {
    console.error("Error fetching latest Bitcoin blocks:", error);
  }
}

// Fetch Bitcoin data and populate the table
async function fetchBitcoinData() {
  try {
    const response = await fetch("https://api.coincap.io/v2/assets/bitcoin");
    const data = await response.json();
    const bitcoinData = data.data;

    const tableBody = document.getElementById("bitcoin-data-table");
    tableBody.innerHTML = "";

    const keyMapping = {
      rank: "Rank",
      symbol: "Symbol",
      supply: "Circulating Supply",
      maxSupply: "Max Supply",
      marketCapUsd: "Market Cap",
    };

    const hiddenKeys = [
      "id",
      "vwap24Hr",
      "explorer",
      "name",
      "priceUsd",
      "changePercent24Hr",
      "volumeUsd24Hr",
    ];

    for (const key in bitcoinData) {
      // Skip hidden keys
      if (hiddenKeys.includes(key)) continue;

      const tableRow = document.createElement("tr");
      const keyCell = document.createElement("td");
      const valueCell = document.createElement("td");

      keyCell.textContent = keyMapping[key] || key; // Use the mapped label if available, otherwise use the original key

      // Add color to the text on the left side of the table
      keyCell.style.color = "#f1fa8c";

      // Check if the value is a number and display only 4 decimal places if it is
      if (!isNaN(bitcoinData[key]) && parseFloat(bitcoinData[key])) {
        const formattedNumber = parseFloat(bitcoinData[key]).toFixed(4);
        valueCell.textContent = Number(formattedNumber).toLocaleString("en");
      } else {
        valueCell.textContent = bitcoinData[key];
      }

      // Check if the value is a number and display only 4 decimal places if it is
      if (!isNaN(bitcoinData[key]) && parseFloat(bitcoinData[key])) {
        // Check if the key is 'marketCapUsd' and format it as billions of USD
        if (key === "marketCapUsd") {
          const formattedNumber = (
            parseFloat(bitcoinData[key]) / 1000000000
          ).toFixed(2);
          valueCell.textContent = `$${formattedNumber}B USD`;
        } else {
          const formattedNumber = parseFloat(bitcoinData[key]).toFixed(4);
          valueCell.textContent = Number(formattedNumber).toLocaleString("en");
        }
      } else {
        valueCell.textContent = bitcoinData[key];
      }

      tableRow.appendChild(keyCell);
      tableRow.appendChild(valueCell);
      tableBody.appendChild(tableRow);
    }
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
  }
}

// Fetch Bitcoin hash rate
async function fetchBitcoinHashRate() {
  try {
    const response = await fetch("https://blockchain.info/q/hashrate");
    const hashRate = await response.text();
    document.getElementById("hash-rate").textContent =
      parseFloat(hashRate / 1e9).toFixed(2) + " EH/s";
  } catch (error) {
    console.error("Error fetching Bitcoin hash rate:", error);
  }
}

// Fetch Lightning Network statistics and populate the table
function fetchLightningStats() {
  fetch("https://mempool.space/api/v1/lightning/statistics/latest")
    .then((response) => response.json())
    .then((data) => {
      const lightningStatsTable = document.getElementById(
        "lightning-stats-table"
      );
      lightningStatsTable.innerHTML = "";

      const keysToDisplay = [
        "channel_count",
        "node_count",
        "total_capacity",
        "average_capacity",
      ];
      const keyLabels = {
        channel_count: "Channel Count",
        node_count: "Node Count",
        total_capacity: "Total Capacity",
        average_capacity: "Average Channel Capacity",
      };

      const keyColors = {
        channel_count: "#f1fa8c",
        node_count: "#f1fa8c",
        total_capacity: "#f1fa8c",
        average_capacity: "#f1fa8c",
      };

      for (const key of keysToDisplay) {
        const newRow = lightningStatsTable.insertRow(-1);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        cell1.textContent = keyLabels[key] || key;
        cell1.style.color = keyColors[key] || "black";

        if (key === "total_capacity") {
          const capacityInBtc = data.latest[key] / 100000000;
          const formattedCapacity =
            capacityInBtc.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            }) + " BTC";
          cell2.textContent = formattedCapacity;
        } else if (key === "average_capacity") {
          const avgCapacityInSats =
            data.latest["total_capacity"] / data.latest["channel_count"];
          const formattedAvgCapacity =
            Math.floor(avgCapacityInSats).toLocaleString();
          cell2.textContent = formattedAvgCapacity + " sats";
        } else {
          const formattedValue = data.latest[key].toLocaleString();
          cell2.textContent = formattedValue;
        }
      }
    })
    .catch((error) =>
      console.error("Error fetching Lightning Network statistics:", error)
    );
}

async function fetchMiningDifficulty() {
  const response = await fetch("https://blockchain.info/q/getdifficulty");
  const difficulty = await response.text();
  const teraDifficulty = parseFloat(difficulty) / 1e12;
  document.getElementById("mining-difficulty").innerText =
    teraDifficulty.toFixed(2) + " T";
}

async function fetchQuotes() {
  const response = await fetch("quotes.txt");
  const text = await response.text();
  const quotes = text.split("\n").map((quote) => quote.trim());
  return quotes;
}

function displayQuote(quotes) {
  const quoteTextElement = document.getElementById("quote-text");
  const quoteSourceElement = document.getElementById("quote-source");
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteTextElement.textContent = quote;
  quoteSourceElement.textContent = "- Satoshi Nakamoto";
}

async function cycleQuotes() {
  const quotes = await fetchQuotes();
  displayQuote(quotes);
  setInterval(() => {
    displayQuote(quotes);
  }, 10000); // Change quotes every 10 seconds
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").then(
      function (registration) {
        console.log("Service Worker is registered", registration);
      },
      function (err) {
        console.log("Service Worker registration failed: ", err);
      }
    );
  });
}

// Fetch top three mining pools
async function fetchTopMiningPools() {
  try {
    const response = await fetch(
      "https://mempool.space/api/v1/mining/pools/1w"
    );
    const data = await response.json();

    // Get the three mining pools with the lowest rank (highest score)
    const topPools = data.pools.slice(0, 3);

    // Get the DOM elements
    const poolElements = ["pool-1", "pool-2", "pool-3"].map((id) =>
      document.getElementById(id)
    );

    // Populate the poolElements with data from topPools
    topPools.forEach((pool, i) => {
      poolElements[
        i
      ].innerHTML = `${pool.name}: <span class="orangeText">${pool.blockCount}</span> blocks mined`;
    });
  } catch (error) {
    console.error("Error fetching top mining pools:", error);
  }
}

// Fetch data from the API
fetch("https://api.blockchair.com/bitcoin/stats")
  .then((response) => response.json())
  .then((data) => {
    // Convert blockchain size from bytes to gigabytes
    const blockchainSizeGB = data.data.blockchain_size / 1000 ** 3;

    // Update the HTML element with the blockchain size
    document.getElementById(
      "chain-size"
    ).textContent = `${blockchainSizeGB.toFixed(2)} GB`;
  })
  .catch((error) => {
    console.error("Error:", error);
  });

let isChartVisible = false;

document.querySelector(".chart-icon").addEventListener("click", function () {
  const chartContainer = document.getElementById("chartContainer");
  isChartVisible = !isChartVisible;
  chartContainer.style.display = isChartVisible ? "block" : "none";
});

cycleQuotes();
fetchMiningDifficulty();
fetchTopMiningPools();
fetchBitcoinPrice();
fetchBitcoinFeeRates();
fetchLatestBlocks();
fetchBitcoinData();
fetchBitcoinHashRate();
fetchLightningStats();
updateBitcoinToCorn();

setInterval(fetchBitcoinPrice, 13000); // Update the price every 13 seconds
setInterval(fetchBitcoinFeeRates, 15000); // Update the fee rates every 15 seconds
setInterval(fetchLatestBlocks, 150000); // Update the latest blocks every 2.5 minutes
setInterval(fetchBitcoinHashRate, 3600000); // Update the hash rate every 60 minutes
setInterval(fetchLightningStats, 360000); // Update the Lightning Stats every 60 minutes
setInterval(updateBitcoinToCorn, 300000); // Update the conversion every 5 minutes
setInterval(fetchTopMiningPools, 3600000); // Update the mining pools every 30 minutes
