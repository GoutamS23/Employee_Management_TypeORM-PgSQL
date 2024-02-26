import { Entity,PrimaryGeneratedColumn,Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";


@Entity()
export class CheckOut {
    @PrimaryGeneratedColumn()
    id:number

    @ManyToOne(()=>User,(user)=>user.checkOut)
    user:User

    @CreateDateColumn({ type: "timestamp" })
    timestamp:Date


}