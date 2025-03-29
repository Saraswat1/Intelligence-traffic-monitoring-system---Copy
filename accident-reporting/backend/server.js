const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const FILE_PATH = 'accidents.json';

// Function to read existing accidents
const readAccidents = () => {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH);
    return JSON.parse(data);
};

// Save accident data
app.post('/saveAccident', (req, res) => {
    const newAccident = req.body;
    console.log("Received Data:", newAccident);

    let accidents = readAccidents();
    accidents.push(newAccident);

    fs.writeFileSync(FILE_PATH, JSON.stringify(accidents, null, 2));
    res.json({ message: "Accident saved successfully!,Ambulance will come sortly", data: newAccident });
});

// Fetch all saved accidents
app.get('/getAccidents', (req, res) => {
    res.json(readAccidents());
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
