import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { refreshTokenHandler } from '../services/tokenService.js';

dotenv.config(); // Load environment variables

// Token authorization middleware
export async function auth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    // If no token exists, return 401
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload; // Attach payload to request
        next();
    } catch (err) {
        // If token is expired, try to refresh
        if (err.name === "TokenExpiredError") {
            try {

                // Generate new accessToken and refreshToken
                const result = await refreshTokenHandler(req, res);
                
                // If generation fails, return 401
                if (!result || !result.newAccessToken) {
                    return res.status(401).json({ message: "Unauthorized" });
                }

                // Send new access token back to frontend
                res.setHeader("x-access-token", result.newAccessToken);

                // Attach new payload to req
                const newPayload = jwt.verify(result.newAccessToken, process.env.SECRET_KEY)
                req.user = newPayload;

                next();
                return;
            } catch {
                return res.status(401).json({ message: "Unauthorized" });
            }
        }
        return res.status(401).json({ message: 'Unauthorized' });
    }
}