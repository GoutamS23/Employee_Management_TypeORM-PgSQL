import { Request, Response } from 'express';
import { User } from '../entity/User';
import { CheckIn } from '../entity/CheckIn';
import { CheckOut } from '../entity/CheckOut';
import { Leave, LeaveStatus } from '../entity/Leaves';
import moment from 'moment';
import { AppDataSource } from '../config/DataSource';
import { createQueryBuilder } from 'typeorm';
import { MoreThanOrEqual, LessThanOrEqual } from "typeorm";


export const generateTimesheet = async (req: Request, res: Response) => {
    try {
        const currentUserId = req.user.id

        const userRepo = AppDataSource.getRepository(User);
        const checkInRepo = AppDataSource.getRepository(CheckIn)
        const checkOutRepo = AppDataSource.getRepository(CheckOut)
        const leaveRepo = AppDataSource.getRepository(Leave)

        const user = await userRepo.findOne(
            {
                relations: { checkIn: true },
                where: { id: currentUserId }
            })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // const checkIns = await checkInRepo.find({
        //     relations: { user: true },
        //     where: { user: { id: currentUserId } }

        // });

        const checkIns = await checkInRepo
            .createQueryBuilder("checkIn")
            .innerJoinAndSelect("checkIn.user", "user")
            .where("user.id = :userId", { userId: currentUserId })
            .getMany();


        // const checkOuts = await checkOutRepo.find({
        //     relations: { user: true },
        //     where: { user: { id: currentUserId } }
        // })

        const checkOuts = await checkOutRepo
            .createQueryBuilder("checkOut")
            .innerJoinAndSelect("checkOut.user", "user")
            .where("user.id = :userId", { userId: currentUserId })
            .getMany()

        // const leaves = await leaveRepo.find({
        //     relations: { user: true },
        //     where:{ 
        //         user:{id:currentUserId.id},
        //         status:LeaveStatus.APPROVED
        //     }
        // })

        const leaves = await leaveRepo
            .createQueryBuilder("leave")
            .innerJoinAndSelect("leave.user", "user")
            .where("user.id = :userId", { userId: currentUserId })
            .andWhere("status = :leaveStatus", { leaveStatus: LeaveStatus.APPROVED })
            .getMany()

        const leaveReason = leaves.length > 0 ? leaves[0].reason : 'NULL';


        // console.log("c_id", currentUserId);

        // console.log("checkIns", checkIns);
        // console.log("checkOuts", checkOuts);

        console.log("leaves", leaves);



        let timesheetArray;

        if (checkIns.length === 0 && checkOuts.length === 0) {
            timesheetArray = [{
                checkIn: 'absent',
                checkout: 'absent',
                status: 'absent',
                workingHours: '',
                leaveReason
            }];
        } else {

            timesheetArray = checkIns.map((checkIn, index) => {
                const checkOut = checkOuts[index];

                if (!checkOut) {
                    return {
                        checkIn: checkIn.timestamp ? checkIn.timestamp.toString() : '',
                        checkout: '',
                        status: 'present',
                        workingHours: '',
                        leaveReason
                    };
                }

                const checkInTime = checkIn.timestamp ? checkIn.timestamp.toString() : '';
                const checkOutTime = checkOut.timestamp ? checkOut.timestamp.toString() : '';

                const status = checkIn && checkOut ? 'present' : 'absent';

                const diffMilliseconds = checkOut.timestamp.getTime() - checkIn.timestamp.getTime();
                const diffHours = diffMilliseconds / (1000 * 60 * 60);

                return {
                    checkIn: checkInTime,
                    checkout: checkOutTime,
                    status,
                    workingHours: diffHours.toFixed(2),
                    leaveReason: status === 'absent' ? leaveReason : 'NULL'
                };
            });
        }

        return res.status(200).json({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            timesheetArray
        });


    } catch (err) {
        console.error('Error generating timesheet:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}



export const generateTimesheetByDate = async (req: Request, res: Response) => {
    try {

        const currentUserId = req.user.id

        const { month, year } = req.body;


        if (!month || !year) {
            return res.status(400).json({ message: 'Month and year are required' });
        }

        // Construct start and end dates for the month
        const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf('month').toDate();
        const endDate = moment(startDate).endOf('month').toDate();

        if (startDate > new Date()) {
            return res.status(400).json({ message: 'Selected month is in the future' });
        }

        const userRepo = AppDataSource.getRepository(User);
        const checkInRepo = AppDataSource.getRepository(CheckIn)
        const checkOutRepo = AppDataSource.getRepository(CheckOut)
        const leaveRepo = AppDataSource.getRepository(Leave)

        const user = await userRepo.findOne({ where: { id: currentUserId } })

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        const checkIns = await checkInRepo
            .createQueryBuilder("checkIn")
            .innerJoinAndSelect("checkIn.user", "user")
            .where("user.id = :userId", { userId: currentUserId })
            .andWhere("checkIn.timestamp >= :startDate", { startDate })
            .getMany();

        

        const checkOuts = await checkOutRepo
            .createQueryBuilder("checkOut")
            .innerJoinAndSelect("checkOut.user", "user")
            .where("user.id = :userId", { userId: currentUserId })
            .andWhere("checkOut.timestamp >= :startDate", { startDate: startDate })
            .getMany();


            const leaves = await leaveRepo
            .createQueryBuilder("leave")
            .where("leave.id = :userId", { userId: currentUserId })
            .andWhere("leave.startDate >= :startDate", { startDate: startDate })
            .andWhere("leave.endDate <= :endDate", { endDate: endDate })
            .getMany();

            console.log(leaves);
        

        const leaveReason = leaves.length > 0 ? leaves[0].reason : 'NULL';

        let timesheetArray;

        if (checkIns.length === 0 && checkOuts.length === 0) {
            // User didn't check in and check out
            timesheetArray = [{
                checkIn: 'absent',
                checkout: 'absent',
                status: 'absent',
                workingHours: '',
                leaveReason
            }];
        } else {
            timesheetArray = checkIns.map((checkIn, index) => {
                const checkOut = checkOuts[index];

                if (!checkOut) {
                    return {
                        checkIn: checkIn.timestamp ? checkIn.timestamp.toISOString() : '',
                        checkout: '',
                        status: 'present',
                        workingHours: '',
                        leaveReason
                    };
                }

                const checkInTime = checkIn.timestamp ? checkIn.timestamp.toISOString() : '';
                const checkOutTime = checkOut.timestamp ? checkOut.timestamp.toISOString() : '';

                const status = checkIn && checkOut ? 'present' : 'absent';

                const diffMilliseconds = checkOut.timestamp.getTime() - checkIn.timestamp.getTime();
                const diffHours = diffMilliseconds / (1000 * 60 * 60);

                return {
                    checkIn: checkInTime,
                    checkout: checkOutTime,
                    status,
                    workingHours: diffHours.toFixed(2),
                    leaveReason: status === 'absent' ? leaveReason : 'NULL'
                };
            });
        }

        return res.status(200).json({
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            timesheetArray,
        });

    } catch (err) {
        console.error('Error generating timesheet:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}