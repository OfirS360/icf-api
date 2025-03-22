const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const passport = require("passport");
const SteamStrategy = require("passport-steam").Strategy;
const session = require("express-session");
const jwt = require("jsonwebtoken");

const STEAM_API_KEY = "3E37434837BF21352A799F672E4062F1";

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: "https://icf.xitsraz.me",
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    credentials: true
}));
app.use(express.json())
app.use(session({
    secret: "3E37434837BF21352A799F672E4062F1",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "none"
}}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

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

passport.use(new SteamStrategy({
    returnURL: "https://icf.xitsraz.me/User_Area/homepage",
    realm: "https://icf.xitsraz.me/",
    apiKey: STEAM_API_KEY
}, (identifier, profile, done) => {
    profile.identifier = identifier;
    return done(null, profile);
}));


app.get("/", (req, res) => {
    res.send("API is running...");
});

app.get("/auth/steam", passport.authenticate("steam"));

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
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
    const {SteamId} = req.body;

    const query = "SELECT * FROM `Users` WHERE (`SteamId` = ?)"
    const values = [SteamId]


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

app.post("/ItemFormSend", (req, res) => {
    req.setTimeout(15000, () => {
        res.status(504).send({ error: 'Gateway Timeout' });
    });

    const {Title, Description, ItemId, Weight, Space, Limit, Team, Category, Pakal, Type, Image, AtchType, WeaponType, Caliber} = req.body;

    const query = "INSERT INTO `Items` (`ItemId`, `Title`, `Description`, `Weight`, `Pakal`, `Category`, `Limit`, `Space`, `Team`, `Type`, `Image`, `AtchType`, `WeaponType`, `Caliber`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [ItemId, Title, Description, Weight, Pakal, Category, Limit, Space, Team, Type, Image, AtchType, WeaponType, Caliber];

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

app.post("/EventFormSend", (req, res) => {
    req.setTimeout(15000, () => {
        res.status(504).send({ error: 'Gateway Timeout' });
    });

    const {Title, Description, Date, Creator, Time, Type, Team} = req.body;

    let Hitpakdut = JSON.stringify({
        "Mavreg": [],
        "Mechine": [],
        "Akrav": [],
        "Tiltan": [],
        "Lavie": [],
        "NotComing": []
    })

    if (Type === "משימה" || Type === "אימון")
    {
        Hitpakdut = JSON.stringify({
            "Coming": [],
            "NotComing": []
        }) 
    }

    if (Type === "אימון צוותי") {
        Hitpakdut = JSON.stringify({
            [Team]: [],
            "NotComing": []
        })
    }


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

                let HitpakdutKeys = Object.keys(JsonHitpakdut)

                JsonHitpakdut.NotComing = JsonHitpakdut.NotComing.filter(id => id !== SteamId);

                if (HitpakdutKeys[0] === "Coming") {
                    JsonHitpakdut.Coming = JsonHitpakdut.Coming.filter(id => id !== SteamId);
                }
                else {
                    JsonHitpakdut[Team] = JsonHitpakdut[Team].filter(id => id !== SteamId);
                }

                

                if (IsComing) {
                    if (HitpakdutKeys[0] === "Coming") {
                        JsonHitpakdut.Coming.push(SteamId);
                    }
                    else {
                        JsonHitpakdut[Team].push(SteamId);
                    }
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

app.get("/GetAllItems", (req, res) => {

    const query = "SELECT * FROM `Items`;"

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
