const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
//const PORT = 5000;
const PORT = process.env.PORT || 5001;


app.use(cors());
app.use(bodyParser.json());

const FINES_FILE = "fines.json";

// Function to read fines from JSON file
const readFines = () => {
  try {
    const data = fs.readFileSync(FINES_FILE);
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist or is empty
  }
};

// Function to write fines to JSON file
const writeFines = (fines) => {
  fs.writeFileSync(FINES_FILE, JSON.stringify(fines, null, 2));
};

// API to store fine details
app.post("/store-fine", (req, res) => {
  const { name, vehicleNumber, fineAmount, selectedViolation, date } = req.body;

  if (!name || !vehicleNumber || !fineAmount || !selectedViolation || !date) {
    return res.status(400).json({ error: "Missing required fine details" });
  }

  const fines = readFines();
  fines.push({ name, vehicleNumber, fineAmount, selectedViolation, date });

  writeFines(fines);

  res.json({ message: "Fine record saved successfully!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
