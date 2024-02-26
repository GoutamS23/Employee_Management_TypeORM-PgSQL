import { Entity,PrimaryGeneratedColumn,Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity()
export class CheckIn {
    @PrimaryGeneratedColumn()
    id:number

    @ManyToOne(()=>User,(user)=>user.checkIn)
    user:User

    @CreateDateColumn({ type: "timestamp" })
    timestamp:Date


}