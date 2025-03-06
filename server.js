const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

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

    const query = "INSERT INTO `RegistrationForm` (full_name, age, arma_experience, arma_hours, previous_clans, clan_issues, join_reason, military_experience, weekly_hours, friday_availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
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

app.get("/GetCurrentMonthEvents", (req, res) => {
    const Year = req.query.Year;
    const Month = req.query.Month;

    const query = "SELECT * FROM `Events` WHERE YEAR(`Date`) = ? AND MONTH(`Date`) = ?;"
    const values = [Year, Month]

    db.query(query, values, (err, results) => {
        if (err) {
            res.status(500).send(err)
            return
        }
        else {
            if (results.length > 0) {
                res.json({results: results})
            }
            else {
                res.json({ results: [] })
            }  
        }
    })
})

app.get("/GetCurrentDayEvent", (req, res) => {
    const Year = req.query.Year;
    const Month = req.query.Month;
    const Day = req.query.Day;

    const query = "SELECT * FROM `Events` WHERE YEAR(`Date`) = ? AND MONTH(`Date`) = ? AND DAY(`Date`) = ?;"
    const values = [Year, Month, Day]

    db.query(query, values, (err, results) => {
        if (err) {
            res.status(500).send(err)
            return
        }
        else {
            if (results.length > 0) {
                res.json({results: results})
            }
            else {
                res.json({ results: [] })
            }  
        }
    })
})

app.get("/GetCloseEvents", (req, res) => {
    const now = new Date();
    const Year = now.getFullYear();
    const Month = String(now.getMonth() + 1).padStart(2, '0');
    const Day = String(now.getDate()).padStart(2, '0');

    currectdate = `${Year}-${Month}-${Day}`
    const query = "SELECT * FROM `Events` WHERE `Date` > ?;"

    db.query(query, [currectdate], (err, results) => {
        if (err) {
            res.status(500).send(err)
            return
        }
        else {
            if (results.length > 0) {
                res.json({results: results})
            }
            else {
                res.json({ results: [] })
            }  
        }
    })
})

const STEAM_API_KEY = "3E37434837BF21352A799F672E4062F1";

app.get("/getSteamUser/:steamId", async (req, res) => {
    const steamId = req.params.steamId;
    const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "שגיאה בקבלת הנתונים מ-Steam" });
    }
}); 

app.listen(3000, () => {
    console.log(`Server is running`);
});
