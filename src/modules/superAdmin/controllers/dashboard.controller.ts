import { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";

export const dashboardPage = (req: Request, res: Response) => {
    res.render("superAdmin/dashboard");
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const data = await dashboardService.getDashboardStats();

        res.json(data);
    } catch (err: any) {
        console.error(err.message);
        
        res.status(500).json({ error: "Failed to load dashboard" });
    }
};
