const express = require('express');
const mysql = require('mysql2/promise');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: ['http://192.168.18.71:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'https://meethelp.sg', 'http://meethelp.sg'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.static(__dirname));

// MySQL Connection Pool
let poolConfig;
if (process.env.MYSQL_URL || process.env.DATABASE_URL) {
    const dbUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
    poolConfig = dbUrl;
} else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'instrevi',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    };
}

const pool = mysql.createPool(poolConfig);

// Initialize Database Table
async function initDatabase() {
    try {
        const connection = await pool.getConnection();
        
        // Create users table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(100),
                last_name VARCHAR(100),
                nickname VARCHAR(100),
                profile_picture LONGTEXT,
                date_of_birth DATE,
                is_anonymous BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Create reviews table if it doesn't exist
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                review_type ENUM('items', 'food', 'service', 'unboxing') NOT NULL,
                image_data LONGTEXT,
                item_description VARCHAR(255),
                food_description VARCHAR(255),
                brand VARCHAR(255),
                shop_name VARCHAR(255),
                shop_address VARCHAR(255),
                review_description TEXT,
                rating INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        
        // Check and add missing columns for existing tables
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'users'
        `);
        
        const existingColumns = columns.map(col => col.COLUMN_NAME);
        
        const requiredColumns = {
            'first_name': 'VARCHAR(100)',
            'last_name': 'VARCHAR(100)',
            'nickname': 'VARCHAR(100)',
            'profile_picture': 'LONGTEXT',
            'date_of_birth': 'DATE',
            'is_anonymous': 'BOOLEAN DEFAULT FALSE'
        };
        
        for (const [colName, colType] of Object.entries(requiredColumns)) {
            if (!existingColumns.includes(colName)) {
                try {
                    await connection.query(`ALTER TABLE users ADD COLUMN ${colName} ${colType}`);
                    console.log(`Added column: ${colName}`);
                } catch (err) {
                    console.error(`Error adding column ${colName}:`, err.message);
                }
            }
        }
        
        connection.release();
        console.log('MySQL connected and table initialized');
    } catch (error) {
        console.error('MySQL connection error:', error);
    }
}

initDatabase();

// Login Route
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = rows[0];

        // Compare passwords
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );

        // Return user profile data along with token
        res.status(200).json({
            message: 'Login successful',
            token: token,
            userId: user.id,
            profile: {
                firstName: user.first_name,
                lastName: user.last_name,
                nickname: user.nickname,
                email: user.email,
                dateOfBirth: user.date_of_birth,
                profilePicture: user.profile_picture,
                isAnonymous: user.is_anonymous
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Register Route
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, confirmPassword } = req.body;

        // Validation
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }[existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create new user
        const [result] = await pool.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        const userId = result.insertId;

        // Generate JWT token
        const token = jwt.sign(
            { userId: userId, email: email },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token: token,
            userId: userId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Profile Route
app.get('/api/profile', async (req, res) => {
    try {
        const email = req.query.email;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const [rows] = await pool.query(
            'SELECT id, email, first_name, last_name, nickname, date_of_birth, profile_picture, is_anonymous FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        res.status(200).json({
            profile: {
                firstName: user.first_name,
                lastName: user.last_name,
                nickname: user.nickname,
                email: user.email,
                dateOfBirth: user.date_of_birth,
                profilePicture: user.profile_picture,
                isAnonymous: user.is_anonymous
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Users Route (for suggestions)
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, email, first_name, nickname, profile_picture, is_anonymous, created_at FROM users ORDER BY created_at DESC LIMIT 5'
        );
        
        res.status(200).json({ users: users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Profile Route
app.put('/api/updateProfile', async (req, res) => {
    try {
        const { firstName, lastName, nickname, email, dateOfBirth, password, profilePicture, isAnonymous } = req.body;
        
        console.log('Update profile request for:', email);
        console.log('Has profile picture:', !!profilePicture, profilePicture ? `(${profilePicture.length} chars)` : '');
        
        // Build update query dynamically
        let updateFields = [];
        let values = [];
        
        if (firstName !== undefined) {
            updateFields.push('first_name = ?');
            values.push(firstName);
        }
        if (lastName !== undefined) {
            updateFields.push('last_name = ?');
            values.push(lastName);
        }
        if (nickname !== undefined) {
            updateFields.push('nickname = ?');
            values.push(nickname);
        }
        if (dateOfBirth !== undefined) {
            updateFields.push('date_of_birth = ?');
            values.push(dateOfBirth);
        }
        if (profilePicture !== undefined) {
            updateFields.push('profile_picture = ?');
            values.push(profilePicture);
            console.log('Adding profile picture to update');
        }
        if (isAnonymous !== undefined) {
            updateFields.push('is_anonymous = ?');
            values.push(isAnonymous);
        }
        if (password) {
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(password, salt);
            updateFields.push('password = ?');
            values.push(hashedPassword);
        }
        
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        values.push(email);
        
        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE email = ?`;
        console.log('Executing query:', query);
        console.log('Update fields:', updateFields.join(', '));
        
        const [result] = await pool.query(query, values);
        
        console.log('Update result:', result);
        
        res.status(200).json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit Review
app.post('/api/reviews', async (req, res) => {
    try {
        const { userId, type, image, itemDescription, foodDescription, brand, shopName, shopAddress, reviewDescription, rating } = req.body;
        
        if (!userId || !type || !image) {
            return res.status(400).json({ message: 'User ID, review type, and image are required' });
        }
        
        const [result] = await pool.query(
            `INSERT INTO reviews (user_id, review_type, image_data, item_description, food_description, brand, shop_name, shop_address, review_description, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, image, itemDescription || null, foodDescription || null, brand || null, shopName || null, shopAddress || null, reviewDescription || null, rating || null]
        );
        
        res.status(201).json({ 
            success: true, 
            message: 'Review submitted successfully',
            reviewId: result.insertId
        });
    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get All Reviews
app.get('/api/reviews', async (req, res) => {
    try {
        const [reviews] = await pool.query(
            `SELECT r.*, u.email, u.first_name, u.last_name, u.nickname, u.profile_picture, u.is_anonymous
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC`
        );
        
        res.json(reviews);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
