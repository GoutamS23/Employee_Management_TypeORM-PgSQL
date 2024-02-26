import { DataSource } from "typeorm";
import dotenv from 'dotenv'


dotenv.config();


const host=process.env.HOST

// datasource
export const AppDataSource=new DataSource({
    type:"postgres",
    host:host,
    port:5432,
    username:"postgres",
    password:"goutam23",
    database:"Employee_Management_DB",
    entities: ["src/entity/*.ts"],
    synchronize:true,
    logging:true,

})