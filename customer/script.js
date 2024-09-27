const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Setup middlewares
app.use(express.json());
app.use(cors());
dotenv.config();

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.EXPENSE_TRACKER // Include this if you are accessing a specific database
});

// Test connection
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL as id:', db.threadId);
});

// / Create the database if it doesn't exist
db.query('CREATE DATABASE IF NOT EXISTS ' + process.env.EXPENSE_TRACKER, (err) => {
  if (err) {
    console.error('Error creating database:', err.message);
    return;
  }
  console.log('db expense_tracker created/checked successfully.');
});

// Use the database
db.query('USE ' + process.env.EXPENSE_TRACKER, (err) => {
    if (err) {
      console.error('Error selecting database:', err.message);
      return;
    }
    console.log('expense_tracker is in use.');
  });
  
  
  // Create expenses table if it doesn't exist
const createExpensesTable = `
CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)`;
db.query(createExpensesTable, (err) => {
  if (err) {
    console.error('Error creating expenses table:', err.message);
    return;
  }
  console.log('Expenses table created/checked successfully.');
});


// User registration 
app.post('api/register', async (req, res) => {
    try{
   const users ='SELECT * FROM user WHERE email=>?'
   db.query(users, [req.body.email], (err,data) =>{
    //if email exists
    if(data.length >0)return res. status(400).json("user already exsists")
      //if no email exists
    // create anew user 
    const newUser='INSERT INTO users (email,username,password) VALUES(?)'
    value=[req.body.email,req.body.username , req.body.password]
      
    db.query(newUser,[value] ,(err,data) =>{
      if(err) return res.status(400).json("something went wrong")
  
        return res.status(200).json("user created succesfully")
    })
    
   })
    }
  catch(err) {
  res(500).json ("Internal Server Error")
  }
  })
  

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
  
        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json("Invalid email or password");
        }
  
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json("Invalid email or password");
        }
  
        res.status(200).json("Login successful");
    } catch (err) {
        res.status(500).json("Internal Server Error");
    }
  });


// Add Expense
app.post('/api/expenses/add', (req, res) => {
    const { user_id, amount, date, category } = req.body;
  
    if (!user_id || !amount || !date || !category) {
      return res.status(400).json("Please provide all expense details");
    }
  
    const newExpenseQuery = 'INSERT INTO expenses (user_id, amount, date, category) VALUES (?, ?, ?, ?)';
    const values = [user_id, amount, date, category];
  
    db.query(newExpenseQuery, values, (err, data) => {
      if (err) return res.status(500).json("Internal Server Error");
  
      return res.status(200).json("Expense added successfully");
    });
  });



// View Expenses
app.get('/api/expenses/view/:user_id', (req, res) => {
  const { user_id } = req.params;

  const viewExpensesQuery = 'SELECT * FROM expenses WHERE user_id = ?';
  db.query(viewExpensesQuery, [user_id], (err, data) => {
    if (err) return res.status(500).json("Internal Server Error");

    return res.status(200).json(data);
  });
});








// Running server
app.listen(5000, () => {
    console.log('Server is running on port 5000');
  });