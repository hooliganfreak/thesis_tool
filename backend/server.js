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

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const formattedStudent = {
            ...student,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        };

        res.json(formattedStudent);
    } catch (err) {
        console.error(err)
        res.status(500).send('Error fetching student details')
    }
})

app.get('/teachers', async (req, res) => {
    try {
        const teachers = await prisma.supervisor.findMany();  // Fetch all teachers from DB
        res.json(teachers); // Send back the teacher data as JSON
    } catch (err) {
        console.error('Error fetching teachers:', err);
        res.status(500).send('Error fetching teachers');
    }
})

app.post('/students', async (req, res) => {
    const data = req.body;

    try {
        const student = await prisma.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                alias: data.alias,
                studyProgram: data.studyProgram,
                studyPeriod: data.studyPeriod,
                status: data.status,
                credits: data.credits,
                subjectCredits: data.subjectCredits,
                breadthCredits: data.breadthCredits,
                internshipCredits: data.internshipCredits,
                methodologyCredits: data.methodologyCredits,
                gpa: data.gpa,
                commentShort: data.commentShort,
                commentLong: data.commentLong,
                lastContact: data.lastContact ? new Date(data.lastContact) : new Date(),
                supervisor: { connect: { id: data.supervisorId } },
                updated: new Date()
            }
        });

        // Return the full updated list
        const students = await prisma.student.findMany({
            include: { supervisor: true }
        });

        res.json(students);

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).send('Failed to create student');
    }
});

app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    try {
        const student = await prisma.student.update({
            where: { id: Number(id) },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                alias: data.alias,
                studyProgram: data.studyProgram,
                studyPeriod: data.studyPeriod,
                status: data.status,
                credits: data.credits,
                subjectCredits: data.subjectCredits,
                breadthCredits: data.breadthCredits,
                internshipCredits: data.internshipCredits,
                methodologyCredits: data.methodologyCredits,
                gpa: data.gpa,
                commentShort: data.commentShort,
                commentLong: data.commentLong,
                lastContact: data.lastContact ? new Date(data.lastContact) : new Date(),
                supervisor: { connect: { id: data.supervisorId } },
                updated: new Date()
            }
        });

         // Fetch the updated record including supervisor
        const updatedStudent = await prisma.student.findUnique({
            where: { id: student.id },
            include: { supervisor: true }
        });

        const formattedStudent = {
            ...updatedStudent,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        };

        if (!student) return res.status(404).send('Student not found');
        res.json(formattedStudent);

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).send('Failed to update student');
    }
});

app.delete('/student/:id', async (req, res) => {
    try {
        const { id } = req.params; // get the student ID from the URL
        const studentId = parseInt(id);

        // Delete the student from the database
        const deletedStudent = await prisma.student.delete({
            where: { id: studentId },
        });

        res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

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