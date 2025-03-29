const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow requests from frontend

const FILE_PATH = "C:\\Intelligence-traffic-monitoring-system\\src\\components\\registrationForm\\users_data.json";


// API to save form data to JSON file
app.post("/saveUser", (req, res) => {
    const newUser = req.body;

    // Read existing data from JSON file
    fs.readFile(FILE_PATH, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Error reading file" });
        }

        const users = JSON.parse(data) || [];

        // Add new user data
        users.push(newUser);

        // Write updated data back to JSON file
        fs.writeFile(FILE_PATH, JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: "Error writing file" });
            }
            res.status(200).json({ message: "User saved successfully" });
        });
    });
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
