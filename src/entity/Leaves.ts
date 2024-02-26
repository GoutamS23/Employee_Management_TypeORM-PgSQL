import { Entity, ObjectId, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";


export enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
}

@Entity()
export class Leave {
    @PrimaryGeneratedColumn()
    id:string

    @ManyToOne(()=>User,(user)=>user.leave)
    user:User

    @Column({nullable:false})
    reason:String

    @Column({type: Date})
    startDate:Date

    @Column({type:Date})
    endDate:Date

    @Column({
        type: "enum",
        enum: LeaveStatus,
        default: LeaveStatus.PENDING
    })
    status: LeaveStatus

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}