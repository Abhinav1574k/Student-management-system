const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Database
const db = new sqlite3.Database("./students.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create students table
db.run(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        course TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (err) => {
    if (err) {
        console.error("Table creation failed:", err.message);
    } else {
        console.log("Students table ready.");
    }
});

// GET all students
app.get("/api/students", (req, res) => {
    db.all(
        "SELECT * FROM students ORDER BY id DESC",
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});

// GET student by ID
app.get("/api/students/:id", (req, res) => {
    db.get(
        "SELECT * FROM students WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json(row);
        }
    );
});

// CREATE student
app.post("/api/students", (req, res) => {
    const { name, email, course } = req.body;

    if (!name || !email || !course) {
        return res.status(400).json({
            error: "Name, email and course are required"
        });
    }

    const sql = `
        INSERT INTO students (name, email, course)
        VALUES (?, ?, ?)
    `;

    db.run(sql, [name, email, course], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({
                    error: "Email already exists"
                });
            }

            return res.status(500).json({
                error: err.message
            });
        }

        res.status(201).json({
            id: this.lastID,
            name,
            email,
            course
        });
    });
});

// UPDATE student
app.put("/api/students/:id", (req, res) => {
    const { name, email, course } = req.body;
    const { id } = req.params;

    if (!name || !email || !course) {
        return res.status(400).json({
            error: "Name, email and course are required"
        });
    }

    const sql = `
        UPDATE students
        SET name = ?, email = ?, course = ?
        WHERE id = ?
    `;

    db.run(sql, [name, email, course, id], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                return res.status(409).json({
                    error: "Email already exists"
                });
            }

            return res.status(500).json({
                error: err.message
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                error: "Student not found"
            });
        }

        res.json({
            id: Number(id),
            name,
            email,
            course
        });
    });
});

// DELETE student
app.delete("/api/students/:id", (req, res) => {
    db.run(
        "DELETE FROM students WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Student deleted successfully"
            });
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});