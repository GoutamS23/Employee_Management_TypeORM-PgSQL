import { Request, Response } from "express";
import { User } from "../entity/User";
import { Leave,LeaveStatus } from "../entity/Leaves";
import { AppDataSource } from "../config/DataSource";


export const applyLeave=async(req:Request,res:Response)=>{
    try{

        const currentUser = req.user;
        const { startDate, endDate, reason } = req.body;

         // Parse startDate and endDate as Date objects
         const parsedStartDate = new Date(startDate);
         const parsedEndDate = new Date(endDate);
 
         // Check if parsing was successful
         if (Number.isNaN(parsedStartDate.getTime()) || Number.isNaN(parsedEndDate.getTime())) {
             return res.status(400).json({ error: 'Invalid start date or end date format' });
         }

         // Calculate leave duration
         const leaveDays = Math.ceil((parsedEndDate.getTime() - parsedStartDate.getTime()) / (1000 * 60 * 60 * 24));

         const userRepo=await AppDataSource.getRepository(User)
         const leaveRepo=await AppDataSource.getRepository(Leave)

        //  const user=await userRepo.findOne(
        //     {
        //         where:{id:currentUser.id}
        //     }
        //  )

        const user = await AppDataSource
            .getRepository(User)
            .createQueryBuilder("user")
            .where("user.id = :id", { id: currentUser.id })
            .getOne()

         if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if there are enough leaves available
        if (user.totalLeavesPerMonth - user.leavesTaken < leaveDays) {
            return res.status(400).json({ error: 'Not enough leaves available' });
        }

        const newLeave=new Leave()
        newLeave.user=currentUser
        newLeave.startDate=new Date(startDate)
        newLeave.endDate = new Date(endDate);
        newLeave.reason = reason;

        await leaveRepo.save(newLeave);

        res.status(201).json({ message: 'Leave added successfully!', data: newLeave });

        user.leavesTaken += leaveDays;

        await userRepo.save(user)

        // using query builder
        
        // await AppDataSource.createQueryBuilder()
        //                     .update(User)
        //                     .set({leavesTaken:leaveDays})
        //                     .where("id=:id",{id:currentUser.id})
        //                     .execute()


    }catch(err) {
        console.error('Error during leave creation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export const leaveHistory = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;
        const leaveRepository = AppDataSource.getRepository(Leave);

        const leaveHistory = await leaveRepository.find({
            where: { id: currentUser.id },
        });

        res.status(200).json({ leaveHistory });
    } catch (err) {
        console.error('Error retrieving leave history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const approveLeave = async (req: Request, res: Response) => {
    try {
        const { leaveId } = req.params;
        const leaveRepo = AppDataSource.getRepository(Leave);

        await leaveRepo.update(leaveId, { status: LeaveStatus.APPROVED });

        res.status(200).json({ message: 'Leave approved successfully.' });
    } catch (err) {
        console.error('Error approving leave:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};



export const rejectLeave = async (req: Request, res: Response) => {
    try{
        const { leaveId } = req.params;

        const leaveRepo=AppDataSource.getRepository(Leave);

        const leave = await leaveRepo.findOne(
            {
                relations: { user:true },
                where: { id: leaveId }
            }
        )
        // console.log(leave);

        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        await leaveRepo.update(leaveId, { status: LeaveStatus.REJECTED });

        if (leave.status !== LeaveStatus.REJECTED) {
            const userRepo=await AppDataSource.getRepository(User)
            
            const user = await userRepo.findOne(
                {
                    relations: { leave:{user:true} },
                    where: { id: leave.user.id }
        
        
                }
            )

            

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            

            const leaveDuration = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 60 * 60 * 24));
            const updatedLeave=user.leavesTaken -= leaveDuration;
            
            console.log("this is user",user.id);
            console.log("this is updated user leave",updatedLeave);

            await userRepo.update(user.id,{leavesTaken:updatedLeave})
        }

        res.status(200).json({ message: 'Leave rejected successfully.' });
    }catch(err){
        console.error('Error rejecting leave:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const allLeaves = async (req: Request, res: Response) => {
    try {
        const leaveRepo = AppDataSource.getRepository(Leave);

        const allLeaves = await leaveRepo.find(
            { 
                relations:{
                    user:true
                } 
            });

        res.status(200).json({ allLeaves });
    } catch (err) {
        console.error('Error retrieving leave history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};