import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from '@prisma/client';
import { auth } from './middleware/auth.js';
import nodemailer from "nodemailer";
import cookieParser from 'cookie-parser';

import { generateAccessToken, generateRefreshToken } from "./services/tokenService.js"

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(cookieParser());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (password.length < 6) {
        res.status(400).json({ message: "Password must be at least 6 characters" })
    }

    // HARD CODED CREDENTIALS FOR NOW
    if ((username === "bistromd" || username === "parland") && password === "password") {
        const token = generateAccessToken({ username });
        const refreshToken = await generateRefreshToken({ username });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // TRUE -> ONLY GETS SENT OVER HTTPS!! <------
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({ accessToken: token, username});
    }

    res.status(400).json({ message: 'Invalid username or password' });
});

app.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
        res.clearCookie("refreshToken");
    }

    res.json({ message: "Logged out successfully" })
})

// Fetch all students from the database
app.get('/students', auth, async (req, res) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                supervisor: true,
            },
        });  // Fetch all students from DB

        // Format the timestamps for lastContact and updated
        const formattedStudents = students.map(student => ({
            ...student,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        }))

        res.json(formattedStudents); // Send back the formatted student data as JSON
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: 'Error fetching students' });
    }
});

// Fetch a specific user by ID
app.get('/students/:id', auth, async (req, res) => {
    const studentId = parseInt(req.params.id, 10); // Get the ID from the URL parameters

    try { // Find the student with a specific ID
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { supervisor: true }
        });

        // If not student found, return code 404
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Format the timestamps for lastContact and updated
        const formattedStudent = {
            ...student,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        };

        res.json(formattedStudent);
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Error fetching student details' })
    }
})

// Fetch all teachers
app.get('/teachers', auth, async (req, res) => {
    try {
        const teachers = await prisma.supervisor.findMany();  // Fetch all teachers from DB
        res.json(teachers); // Send back the teacher data as JSON
    } catch (err) {
        console.error('Error fetching teachers:', err);
        res.status(500).json({ error: 'Error fetching teachers' });
    }
})

// Add a new student
app.post('/students', auth, async (req, res) => {
    const data = req.body;

    // Should never happen since frontend prevents sumbissions without firstname and lastname
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
        return res.status(400).json({ error: "First and last names are required" });
    }

    try { // Create a new student object fitting the prisma schema
        const student = await prisma.student.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                alias: data.alias,
                studyProgram: data.studyProgram,
                studyPeriod: data.studyPeriod,
                studiesBegin: data.studiesBegin,
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
            },
            include: { supervisor: true } // Include supervisor so frontend gets full info
        });

        res.status(201).json(student);

    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

// Edit an existing user
app.put('/students/:id', auth, async (req, res) => {
    const { id } = req.params;
    const studentId = parseInt(id);
    const data = req.body;

    // Find the student being edited, if not found, return code 404
    const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
    if (!studentExists) return res.status(404).json({ error: "Student not found" });

    // Should never happen since frontend prevents sumbissions without firstname and lastname
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
        return res.status(400).json({ error: "First and last names are required" });
    }

    try { // Update the student object fitting the prisma schema
        const student = await prisma.student.update({
            where: { id: studentId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                alias: data.alias,
                studyProgram: data.studyProgram,
                studyPeriod: data.studyPeriod,
                studiesBegin: data.studiesBegin,
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

        // Format the timestamps for lastContact and updated
        const formattedStudent = {
            ...updatedStudent,
            lastContact: formatDate(student.lastContact),
            updated: formatDate(student.updated)
        };

        res.json(formattedStudent);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// Delete a user
app.delete('/student/:id', auth, async (req, res) => {
    try {
        const { id } = req.params; // get the student ID from the URL
        const studentId = parseInt(id);

        // If the student is not found, return code 404
        const studentExists = await prisma.student.findUnique({ where: { id: studentId } });
        if (!studentExists) return res.status(404).json({ error: "Student not found" });

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

// Get the users that have been inactive for 3 months
async function getInactiveStudents() {
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    // Fetch all supervisors
    const supervisors = await prisma.supervisor.findMany();

    const results = [];

    for (const sup of supervisors) {
        // Fetch students supervised by this supervisor
        const students = await prisma.student.findMany({
            where: { supervisorId: sup.id },
        });

        // Filter inactive students
        const inactiveStudents = students.filter(s => new Date(s.updated) < threeMonthsAgo);

        results.push({
            supervisor: sup,
            inactiveStudents,
        });
    }

    console.log(results)

    return results;
}

// Create and send the email to relevant supervisors email
async function sendInactiveStudentsEmail() {
    const data = await getInactiveStudents();

    // Setup transporter
    const transporter = nodemailer.createTransport({
        host: 'smtp.arcada.fi',
        port: 587,
        secure: false,
        auth: { user: 'EMAIL', pass: 'PASSWORD' } // MAIL USERNAME & PASSWORD
    });

    for (const { supervisor, inactiveStudents } of data) {
        // Skip if no inactive students
        if (!inactiveStudents.length) continue;

        const studentList = inactiveStudents
            .map(s => `- ${s.firstName} ${s.lastName} (${s.alias})`)
            .join('\n');

        const mailOptions = {
            from: `"Student Tracker" <EMAIL HERE>`, // EMAIL HERE
            to: supervisor.email,
            subject: 'Weekly Inactive Students Report',
            text: `Hi ${supervisor.firstName},\n\nThe following students have been inactive for more than 3 months:\n\n${studentList}\n\nRemember to follow up with them.\n\nRegards,\nStudent Tracker System`
        };

        await transporter.sendMail(mailOptions);
    }

    console.log('Weekly inactive student emails sent to all supervisors.');
}

// This can be set via cronjob to send once a week? 
//await sendInactiveStudentsEmail();

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/login.html`);
});