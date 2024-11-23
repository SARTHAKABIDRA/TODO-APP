const express = require("express");
const cors = require("cors");
const mysql = require('mysql');
require('dotenv').config();

const app = express();

// Middleware setup
const corsOption = {
    origin: "http://localhost:3000"
};
app.use(cors(corsOption));
app.use(express.json());

// Database configuration
const DB = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'sarthak1234',
    database: process.env.DB_NAME || 'task',
});

// Database connection
DB.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        throw err;
    }
    console.log('MySQL Database connected successfully');
});

// Routes
// Welcome route
app.get('/', (req, res) => {
    res.send('<h1 style="text-align: center;">Welcome to the Task List API!</h1>');
});

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const results = await new Promise((resolve, reject) => {
            DB.query('SELECT * FROM task', (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: 'No tasks found!',
                data: results
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved from database successfully!',
            data: results
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Error retrieving tasks',
            error: err.message
        });
    }
});

// Create new task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    DB.query('INSERT INTO task (title, description) VALUES (?, ?)', 
        [title, description], 
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Error creating task',
                    error: err.message
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Task added successfully!',
                data: {
                    id: results.insertId,
                    title,
                    description
                }
            });
    });
});

// Update task
app.put('/tasks/:id', (req, res) => {
    const { title, description } = req.body;
    const { id } = req.params;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: 'Title and description are required'
        });
    }

    DB.query('UPDATE task SET title = ?, description = ? WHERE id = ?', 
        [title, description, id], 
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    success: false,
                    message: 'Error updating task',
                    error: err.message
                });
            }

            if (!results.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: 'Task not found!',
                    data: results
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Task updated successfully!',
                data: {
                    id,
                    title,
                    description
                }
            });
    });
});

// Delete task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;

    DB.query('DELETE FROM task WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                success: false,
                message: 'Error deleting task',
                error: err.message
            });
        }

        if (!results.affectedRows) {
            return res.status(404).json({
                success: false,
                message: 'Task not found!',
                data: results
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task deleted successfully!'
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle server shutdown
process.on('SIGTERM', () => {
    DB.end();
    process.exit(0);
});