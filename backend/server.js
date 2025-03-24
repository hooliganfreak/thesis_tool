const express = require('express');
const path = require('path');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

const app = express();
const prisma = new PrismaClient();
const port = 3000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public/src')));

// Fetch all students from the database
app.get('/students', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                thesis: { // Include the Thesis table
                    include: { 
                        comments: true,
                        supervisor: true }, // Include comments inside theses (is this table even necessary? theses already includes comment_internal/comments_to_student)
                }
            },
        });
        res.json(students); // Send back the student data as JSON, including related data
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Error fetching students');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});