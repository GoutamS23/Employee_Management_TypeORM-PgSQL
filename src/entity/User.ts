import { Column,PrimaryGeneratedColumn,Entity, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { CheckIn } from "./CheckIn";
import { CheckOut } from "./CheckOut";
import { Leave } from "./Leaves";



@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id:number

    @Column()
    firstName:string

    @Column()
    lastName:string


    @Column({unique:true})
    email:string

    @Column()
    password:string

    @OneToMany(()=>CheckIn,(checkin)=>checkin.user,{cascade:true})
    checkIn:CheckIn[]

    @OneToMany(()=>CheckOut,(checkout)=>checkout.user,{cascade:true})
    checkOut:CheckOut[]

    @OneToMany(()=>Leave,(leave)=>leave.user,{cascade:true})
    leave:Leave[]


    @Column({type:"int",default:0})
    leavesTaken:number


    @Column({type:"int", nullable: false, default: 5 })
    totalLeavesPerMonth: number;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;

}