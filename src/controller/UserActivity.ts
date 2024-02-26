import { Request, Response } from "express";
import { CheckIn } from "../entity/CheckIn";
import { User } from "../entity/User";
import { AppDataSource } from "../config/DataSource";
import { CheckOut } from "../entity/CheckOut";
import { Between, MoreThanOrEqual } from "typeorm";


export const checkInUser = async (req: Request, res: Response) => {
    try {
        const currentUser = req.user;


        const checkInRepo = await AppDataSource.getRepository(CheckIn);

        const newCheckIn=new CheckIn();
        newCheckIn.user=currentUser;

        await checkInRepo.save(newCheckIn);

        res.status(200).json({
            message:"checkedIn successfully"
        })


} catch (err) {
    console.error('Error during check-in:', err);
    res.status(500).json({ error: 'Internal server error' });
}
};




export const checkOutUser = async (req: Request, res: Response) => {
    try {

        const currentUser = req.user

        const checkOutRepo = await AppDataSource.getRepository(CheckOut)
        const userRepo = await AppDataSource.getRepository(User)

        const currentDate = new Date();
        const startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0); // Set to the beginning of the day
        const endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999); // Set to the end of the day

        const user = await userRepo.findOne(
            {
                where: {
                    id: currentUser.id,
                    checkIn: {
                        timestamp: Between(startDate, endDate)
                    }
                },
                relations: { checkIn: true }
            }
        )



        if (!user) {
            console.error('user not checked in today');
            return res.status(404).json({ error: 'user not checked in today' });
        }

        const newCheckOut = new CheckOut();
        newCheckOut.user = currentUser;

        await checkOutRepo.save(newCheckOut);

        res.status(200).json({
            success: true,
            message: "user checked out successfully"
        })




    } catch (err) {
        console.error('Error during checkout:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}
