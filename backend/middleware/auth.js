import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY );
        req.user = payload; // Attach payload to request
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}