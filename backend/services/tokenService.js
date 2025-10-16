import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import pkg from '@prisma/client';

dotenv.config(); // Load environment variables
const SECRET_KEY = process.env.SECRET_KEY;

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Function to refresh the access token
export async function refreshTokenHandler(req, res) {
    try {

        // Get the refreshToken from httpCookies
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return null;

        // Check if the refreshToken exists and hasnt expired in the DB
        const tokenEntry = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!tokenEntry || tokenEntry.expiresAt < new Date()) {
            return null;
        }

        // Generate new accessToken and refreshToken
        const newAccessToken = generateAccessToken({ username: tokenEntry.username });
        const newRefreshToken = await generateRefreshToken({ username: tokenEntry.username });
        
        // Delete old refresh token (rotation)
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });

        // Set new refresh token in cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return { newAccessToken };
    } catch {
        return {}
    }
}

// Short lived access token
export function generateAccessToken(user) {
    const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '10s' });
    return token;
}

// Long lived refresh token
export async function generateRefreshToken(user) {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Create a new DB entry (rotation)
    await prisma.refreshToken.create({
        data: {
            username: user.username,
            token: refreshToken,
            expiresAt
        }
    })

    return refreshToken;
}