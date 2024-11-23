const cors = require("cors")
const express = require("express")
const app = express()
const mysql = require('mysql');
// const redis = require ('redis');
const corsOption ={
    origin: "http://localhost:3000"

}
app.use(cors(corsOption));
// Set json for getting data from request body
app.use(express.json());

const DB = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: 'sarthak1234',
    database: 'task',
});

DB.connect((err) => {
   if(err){
    throw err
   }else{
    console.log('My DSql conmnmnectd')
   }
});

app.get('/',(req,res) => {
    res.send('<h1 style="text-align: center;">Welcome to the Task List API!</h1>')
})

app.get('/tasks', async (req, res) => {
    try{
        const results = await new Promise((resolve, reject) => {
            DB.query('SELECT * FROM task', (err, results) => {
                if(err) reject(err);
                resolve(results)
            })
        })
        console.log(results)
        if (!results.length) {
            return res.send({
                success: false,
                message: 'No tasks found!',
                data   : results
            });
        }
        return res.send({
            success: true,
            message: 'Tasks retrieved from database successfully!',
            data   : results
        });
    }catch(err){
        console.log(err)
    }
})

app.post('/tasks',(req,res) => {
    const {title , description} = req.body;

    DB.query('INSERT INTO task (title, description) VALUES (?, ?)', [title, description], (err, results) => {
        if(err)throw err; // Throw error if any

        console.log(results)
        // If no rows affected, then todo not inserted
        if (!results.affectedRows) {
            return res.send({
                success: false,
                message: 'Task not added!',
                data   : results
            });
        }

        return res.send({
            success: true,
            message: 'Task added successfully!',
            data   : {
                id: results.insertId,
                title,
                description
            }
        });
    })
})
// Update todo
app.put('/tasks/:id', (req, res) => {
    // Get data from request body
    const {title, description} = req.body;

    // Update todo in database
    DB.query('UPDATE task SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id], (err, results) => {
        if (err) throw err; // Throw error if any

        // If no rows affected, then todo not updated
        if (!results.affectedRows) {
            return res.send({
                success: false,
                message: 'Task not updated!',
                data   : results
            });
        }

        // Delete cached data from Redis
        // redisClie÷nt.del('todos')

        // Return response
        return res.send({
            success: true,
            message: 'Task updated successfully!',
            data   : {
                id: req.params.id,
                title,
                description
            }
        });
    });
});
app.delete('/tasks/:id', (req, res) => {
    DB.query('DELETE FROM task WHERE id = ?', [req.params.id], (err, results) => {
        if (err) throw err; // Throw error if any

        // If no rows affected, then todo not deleted
        if (!results.affectedRows) {
            return res.send({
                success: false,
                message: 'Task not deleted!',
                data   : results
            });
        }

        

        // Return response
        return res.send({
            success: true,
            message: 'Task deleted successfully!'
        });
    });
});
const port = 4000

app.listen(port, () => {
    console.log(`Port is runnning ${port}`)
})