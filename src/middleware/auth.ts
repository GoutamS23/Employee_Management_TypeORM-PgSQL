import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../entity/User';

dotenv.config();

declare global {
    namespace Express {
        interface Request {
            user?: any; // Define the user property type
        }
    }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.token || req.body.token || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        // Verify the token
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            return res.status(500).json({
                success: false,
                message: 'JWT secret is not defined',
            });
        }
        
        try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded;
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid',
            });
        }
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Something went wrong while validating the token',
        });
    }
};


export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.user.email !== 'admin@gmail.com') {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only',
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}