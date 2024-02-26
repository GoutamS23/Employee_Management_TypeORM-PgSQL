import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import "reflect-metadata"

import { User } from "./entity/User";
import { AppDataSource } from "./config/DataSource";
import routes from './routes/routes'
import cookieParser from 'cookie-parser'
import { CheckIn } from "./entity/CheckIn";
import { Leave } from "./entity/Leaves";
import { MoreThanOrEqual } from "typeorm";
import { auth } from "./middleware/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


// middlewares
app.use(express.json());
app.use(cookieParser());


// routes
app.use('/api/v1/auth', routes);


// database
AppDataSource.initialize().then(
    () => {
        console.log('database connected.')
        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    }
).catch(
    (err) => {
        console.log("DB connection failed", err);
    }
)




