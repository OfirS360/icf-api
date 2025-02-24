const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://icf.xitsraz.me");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});


const db = mysql.createConnection({
    host: "95.217.11.99",
    port: "3307",
    user: "icfweb",
    password: "123456icf",
    database: "test",
});

db.connect(err => {
    if (err) {
        console.error("Error trying to connect SQL", err);
        return;
    }
    console.log("Connected to SQL");
});

app.get("/", (req, res) => {
    res.send("API is running...");
});

app.post("/RegisterFormSend", (req, res) => {
    const {FullName, Age, ArmaExperience, ArmaHours, PreviousClans, ClanIssues, JoinReason, MilitaryExperience, WeeklyHours, FridayAvailable, Avilability } = req.body;

    const query = "INSERT INTO `RegistrationForm` (`FullName`, `Age`, `ArmaExperience`, `ArmaHours`, `PreviousClans`, `ClanIssues`, `JoinReason`, `MilitaryExperience`, `WeeklyHours`, `FridayAvailable`, `Availability`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [FullName, Age, ArmaExperience, ArmaHours, PreviousClans, ClanIssues, JoinReason, MilitaryExperience, WeeklyHours, FridayAvailable, Avilability];

    console.log(values)
    console.log(req.body);

    db.query(query, values, (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            res.status(500).send(err);
        } else {
            res.json({
                message: "Form registered successfully",
                results: results
            });
        }
    });
});


app.post("/Login", (req, res) => {
    const {SteamId, Password} = req.body;

    const query = "SELECT * FROM `Users` WHERE (`SteamId` = ? AND `Password` = ?)"
    const values = [SteamId, Password]

    db.query(query, values, (err, results) => {
        if (err) {
            res.status(500).send(err)
            return
        }
        else {
            if (results.length > 0) {
                res.json({ success: true, results: results[0] })
            }
            else {
                res.json({ success: false })
            }
        }
    })
});


app.listen(3000, () => {
    console.log(`Server is running`);
});
