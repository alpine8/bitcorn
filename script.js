// DOM elements
const btcPrice = document.getElementById('btc-price');
const fastestFee = document.getElementById('fastest-fee');
const halfHourFee = document.getElementById('half-hour-fee');
const oneHourFee = document.getElementById('one-hour-fee');
const latestBlocks = document.getElementById('latest-blocks');

// Fetch the current Bitcoin price
async function fetchBitcoinPrice() {
  try {
    const response = await fetch('https://api.coincap.io/v2/rates/bitcoin');
    const data = await response.json();
    const price = data.data.rateUsd;
    btcPrice.textContent = `${parseFloat(price).toFixed(2)} USD`;

    // Add the flash-white class to animate the text
    btcPrice.classList.add('flash-white');

    // Remove the flash-white class after the animation is completed
    setTimeout(() => {
      btcPrice.classList.remove('flash-white');
    }, 1000);
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
  }
}

// Fetch Bitcoin fee rates
async function fetchBitcoinFeeRates() {
  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');
    const data = await response.json();
    fastestFee.textContent = `${data.fastestFee} sat/vB`;
    halfHourFee.textContent = `${data.halfHourFee} sat/vB`;
    oneHourFee.textContent = `${data.hourFee} sat/vB`;

    // Add the flash-white class to the elements
    fastestFee.classList.add('flash-white');
    halfHourFee.classList.add('flash-white');
    oneHourFee.classList.add('flash-white');

    // Remove the flash-white class after the animation has completed (1 second)
    setTimeout(() => {
      fastestFee.classList.remove('flash-white');
      halfHourFee.classList.remove('flash-white');
      oneHourFee.classList.remove('flash-white');
    }, 1000);

  } catch (error) {
    console.error('Error fetching Bitcoin fee rates:', error);
  }
}

function sanitizeHTML(str) {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = str;
  return tempDiv.innerHTML;
}

// Fetch latest Bitcoin blocks
async function fetchLatestBlocks() {
  try {
    const response = await fetch('https://mempool.space/api/v1/blocks');
    const data = await response.json();
    const latestBlocksTable = document.getElementById('latest-blocks');
    latestBlocksTable.innerHTML = '';

    // Slice the data array to include only the first 10 elements
    const lastTenBlocks = data.slice(0, 10);

    lastTenBlocks.forEach(block => {
      const row = document.createElement('tr');

      // Block Height
      const blockHeight = document.createElement('td');
      blockHeight.textContent = block.height;
      row.appendChild(blockHeight);

      // Timestamp
      const timestamp = document.createElement('td');
      timestamp.textContent = new Date(block.timestamp * 1000).toLocaleString();
      row.appendChild(timestamp);

      // Transactions
      const transactions = document.createElement('td');
      transactions.textContent = sanitizeHTML(block.tx_count);
      row.appendChild(transactions);

      latestBlocksTable.appendChild(row);
    });
  } catch (error) {
    console.error('Error fetching latest Bitcoin blocks:', error);
  }
}

// Fetch Bitcoin data and populate the table
async function fetchBitcoinData() {
  try {
    const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
    const data = await response.json();
    const bitcoinData = data.data;

    const tableBody = document.getElementById('bitcoin-data-table');
    tableBody.innerHTML = '';

    const keyMapping = {
      id: 'ID',
      rank: 'Rank',
      symbol: 'Symbol',
      name: 'Name',
      supply: 'Supply',
      maxSupply: 'Max Supply',
      marketCapUsd: 'Market Cap',
      volumeUsd24Hr: 'Volume (24hr)',
      priceUsd: 'Price (USD)',
      changePercent24Hr: '% Change (24hr)',
      // Add more key mappings as needed
    };

    const hiddenKeys = ['id', 'vwap24Hr', 'explorer', 'name'];

    for (const key in bitcoinData) {
      // Skip hidden keys
      if (hiddenKeys.includes(key)) continue;

      const tableRow = document.createElement('tr');
      const keyCell = document.createElement('td');
      const valueCell = document.createElement('td');

      keyCell.textContent = keyMapping[key] || key; // Use the mapped label if available, otherwise use the original key

      // Check if the value is a number and display only 4 decimal places if it is
      if (!isNaN(bitcoinData[key]) && parseFloat(bitcoinData[key])) {
        const formattedNumber = parseFloat(bitcoinData[key]).toFixed(4);
        valueCell.textContent = Number(formattedNumber).toLocaleString('en');
      } else {
        valueCell.textContent = bitcoinData[key];
      }

      tableRow.appendChild(keyCell);
      tableRow.appendChild(valueCell);
      tableBody.appendChild(tableRow);
    }
  } catch (error) {
    console.error('Error fetching Bitcoin data:', error);
  }
}

// Fetch Bitcoin hash rate
async function fetchBitcoinHashRate() {
  try {
    const response = await fetch('https://blockchain.info/q/hashrate');
    const hashRate = await response.text();
    document.getElementById('hash-rate').textContent = parseFloat(hashRate / 1e9).toFixed(2);
  } catch (error) {
    console.error('Error fetching Bitcoin hash rate:', error);
  }
}

// Fetch Lightning Network statistics and populate the table
function fetchLightningStats() {
  fetch('https://mempool.space/api/v1/lightning/statistics/latest')
    .then(response => response.json())
    .then(data => {
      const lightningStatsTable = document.getElementById('lightning-stats-table');
      lightningStatsTable.innerHTML = '';

      const keysToDisplay = ['channel_count', 'node_count', 'total_capacity'];
      const keyLabels = {
        'channel_count': 'Channel Count #️⃣',
        'node_count': 'Node Count 🖥️',
        'total_capacity': 'Total Capacity 👥',
      };

      for (const key of keysToDisplay) {
        const newRow = lightningStatsTable.insertRow(-1);
        const cell1 = newRow.insertCell(0);
        const cell2 = newRow.insertCell(1);
        cell1.textContent = keyLabels[key] || key;

        if (key === 'total_capacity') {
          const capacityInBtc = data.latest[key] / 100000000;
          const formattedCapacity = parseFloat(capacityInBtc).toLocaleString() + ' BTC';
          cell2.textContent = formattedCapacity;
        } else {
          cell2.textContent = data.latest[key];
        }
      }
    })
    .catch(error => console.error('Error fetching Lightning Network statistics:', error));
}



fetchBitcoinPrice();
fetchBitcoinFeeRates();
fetchLatestBlocks();
fetchBitcoinData();
fetchBitcoinHashRate();
fetchLightningStats();

setInterval(fetchBitcoinPrice, 2000); // Update the price every 2 seconds (2,000 ms)
setInterval(fetchBitcoinFeeRates, 10000); // Update the fee rates every 10 seconds (10,000 ms)
setInterval(fetchLatestBlocks, 60000); // Update the latest blocks every 60 seconds (60,000 ms)
setInterval(fetchBitcoinHashRate, 60000); // Update the hash rate every 60 seconds (60,000 ms)
setInterval(fetchLightningStats, 120000); // Update the Lightning Stats every 2 minutes
