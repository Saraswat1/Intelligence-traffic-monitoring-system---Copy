const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const filePath = "./regis_db.json";

// GET all vehicles
app.get("/vehicles", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error reading the database" });
  }
});

// REGISTER a new vehicle
app.post("/register", (req, res) => {
  try {
    const newVehicle = req.body;

    // Read current data
    let data = JSON.parse(fs.readFileSync(filePath));

    // Check if the vehicle already exists
    if (data.some((v) => v.vehicleNumber === newVehicle.vehicleNumber)) {
      return res.status(400).json({ message: "❌ Vehicle already registered!" });
    }

    // Add new vehicle
    data.push(newVehicle);

    // Write back to JSON file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.json({ message: "✅ Vehicle Registered Successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error writing to the database" });
  }
});

// Start the server
const PORT = 5004;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
