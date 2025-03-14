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


const db = mysql.createPool({
    host: "95.217.11.99",
    port: "3307",
    user: "icfweb",
    password: "123456icf",
    database: "test",
    connectTimeout: 10000
});


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.post("/RegisterFormSend", (req, res) => {
    const {FullName, Age, ArmaExperience, ArmaHours, PreviousClans, ClanIssues, JoinReason, MilitaryExperience, WeeklyHours, FridayAvailable, Avilability } = req.body;

    const query = "INSERT INTO `RegistrationForm` (full_name, age, arma_experience, arma_hours, previous_clans, clan_issues, join_reason, military_experience, weekly_hours, friday_availability) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [FullName, Age, ArmaExperience, ArmaHours, PreviousClans, ClanIssues, JoinReason, MilitaryExperience, WeeklyHours, FridayAvailable, Avilability];

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }
        connection.query(query, values, (err, results) => {
            connection.release()

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
    })
    
});

app.post("/Login", (req, res) => {
    const {SteamId, Password} = req.body;

    const query = "SELECT * FROM `Users` WHERE (`SteamId` = ? AND `Password` = ?)"
    const values = [SteamId, Password]


    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }
        connection.query(query, values, (err, results) => {
            connection.release()

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
    })
    
});

app.post("/EventFormSend", (req, res) => {
    const {Title, Description, Date, Creator, Time, Type} = req.body;
    const Hitpakdut = JSON.stringify({
        "Mavreg": [],
        "Mechine": [],
        "Akrav": [],
        "Tiltan": [],
        "Lavie": [],
        "NotComing": []
    }) 

    const query = "INSERT INTO `Events` (Title, Description, Date, Creator, Time, EventType, Hitpakdut) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const values = [Title, Description, Date, Creator, Time, Type, Hitpakdut];

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }
        connection.query(query, values, (err, results) => {
            connection.release()

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
    })

    
});

app.post("/UpdateHitpakdut", (req, res) => {
    req.setTimeout(10000, () => {
        res.status(504).send({ error: 'Gateway Timeout' });
    });

    const { Team, IsComing, Id, SteamId } = req.body;

    const query = "SELECT `Hitpakdut` FROM `Events` WHERE `Id` = ?";
    const values = [Id];

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }

        connection.query(query, values, (err, results) => {
            if (err) {
                connection.release();
                console.error('Error executing SELECT query:', err);
                res.status(500).send(err);
                return;
            }

            if (results.length > 0) {
                let JsonHitpakdut = JSON.parse(results[0].Hitpakdut);

                JsonHitpakdut.NotComing = JsonHitpakdut.NotComing.filter(id => id !== SteamId);
                JsonHitpakdut[Team] = JsonHitpakdut[Team].filter(id => id !== SteamId);

                if (IsComing) {
                    JsonHitpakdut[Team].push(SteamId);
                } else {
                    JsonHitpakdut.NotComing.push(SteamId);
                }

                res.json({ results: JsonHitpakdut });

                const query2 = "UPDATE `Events` SET `Hitpakdut` = ? WHERE `Id` = ?";
                const values2 = [JSON.stringify(JsonHitpakdut), Id];

                db.getConnection((err, connection2) => {
                    if (err) {
                        connection.release();
                        console.error('Error getting DB connection for update:', err);
                        res.status(500).send(err);
                        return;
                    }

                    connection2.query(query2, values2, (err, results2) => {
                        connection2.release();

                        if (err) {
                            console.error('Error executing UPDATE query:', err);
                            res.status(500).send(err);
                            return;
                        }
                    });
                });
            } else {
                res.json({ results: [] });
            }

            connection.release();
        });
    });
});


app.get("/GetEventHitpakdut", (req, res) => {
    let EventId = req.query.EventId

    const query = "SELECT `Hitpakdut` FROM `Events` WHERE Id = ?;"

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }

        db.query(query, EventId, (err, results) => {
            connection.release();

            if (err) {
                res.status(500).send(err)
                console.error("Database connection failed:", err);
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
    
})

app.get("/GetAllEvents", (req, res) => {

    const query = "SELECT * FROM `Events`;"

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }

        connection.query(query, (err, results) => {
            connection.release();

            if (err) {
                res.status(500).send(err)
                console.error("Database connection failed:", err);
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
})


app.get("/GetCloseEvents", (req, res) => {
    const now = new Date();
    const Year = now.getFullYear();
    const Month = String(now.getMonth() + 1).padStart(2, '0');
    const Day = String(now.getDate()).padStart(2, '0');

    const currentDate = `${Year}-${Month}-${Day}`
    const query = "SELECT * FROM `Events` WHERE `Date` > ?;"

    db.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting DB connection:', err);
            res.status(500).send(err);
            return;
        }

        connection.query(query, [currentDate], (err, results) => {
            connection.release();

            if (err) {
                console.error('Database query error:', err);
                res.status(500).send(err);
                return;
            }

            if (results.length > 0) {
                res.json({ results: results });
            } else {
                res.json({ results: [] });
            }
        });
    });
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
