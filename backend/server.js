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
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Fetch all students from the database
app.get('/students', async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                supervisor: true,
            },
        });  // Fetch all students from DB
        
        const formattedStudents = students.map(student => ({
            ...student,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        }))

        res.json(formattedStudents); // Send back the formatted student data as JSON
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).send('Error fetching students');
    }
});

app.get('/students/:id', async (req, res) => {
    const studentId = parseInt(req.params.id, 10);

    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { supervisor: true }
        });

         const formattedStudent = {
            ...student,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        };

        if (!student) return res.status(404).send('Student not found');
        res.json(formattedStudent);
    } catch(err) {
        console.error(err)
        res.status(500).send('Error fetching student details')
    }
})

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); // Add leading zero if day is a single digit
    const month = String(d.getMonth() + 1).padStart(2, '0'); // getMonth() returns 0-based month, so add 1
    const year = d.getFullYear();

    return `${day}.${month}.${year}`; // Return in DD.MM.YYYY format
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/src/table.html`);
});