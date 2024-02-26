import { Request, Response } from "express";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import { AppDataSource } from "../config/DataSource";

import { User } from "../entity/User";
import jwt from 'jsonwebtoken'

dotenv.config();


// signup
export const signup = async (req: Request, res: Response) => {
    try {

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(403).send({
                success: false,
                message: "All fields are required",
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).send({
                success: false,
                message: "Password and Confirm Password do not match. Please try again",
            });
        }

        const userRepo = await AppDataSource.getRepository(User)

        const existingUser = await userRepo.findOne(
            {
                where: { email: email }
            });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User();
        newUser.firstName = firstName,
            newUser.lastName = lastName,
            newUser.email = email,
            newUser.password = hashedPassword


        await userRepo.save(newUser)

        return res.status(200).json({
            success: true,
            newUser,
            message: "User registered successfully",
        });



    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        });
    }
}



// LOGIN
export const login = async (req: Request, res: Response) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).send({
                success: false,
                message: "All fields are required",
            });
        }

        const userRepo = await AppDataSource.getRepository(User);

        const user = await userRepo.findOne(
            {
                where: { email: email }
            }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: `User is not Registered with Us Please SignUp to Continue`,
            });
        }

        const payload = {
            email: user.email,
            id: user.id
        }

        if (await bcrypt.compare(password, user.password)) {
            const jwtSecret = process.env.JWT_SECRET;

            if (!jwtSecret) {
                return res.status(500).json({
                    success: false,
                    message: 'JWT secret is not defined',
                });
            }

            const token = jwt.sign(
                payload,
                jwtSecret,
                {
                    expiresIn: '2h'
                }
            );



            const options = {
                expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie('token', token, options).status(200).json({
                success: true,
                token,
                user,
                message: "user login successfully"
            })

        } else {
            res.status(403).json({
                success: false,
                message: "password incorrect."
            })
        }



    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again.",
        });
    }
}
