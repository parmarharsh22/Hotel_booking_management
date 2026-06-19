import { Request, Response } from "express";
import {
  dashboardService} from '../services/hotelAdmin.dashboard.services'
import {
  RevenuePeriod
} from "../models/dashboard.model";

export class DashboardController {

async renderDashboard(
    req: Request,
    res: Response
){
    res.render("admin/dashboard")}



 
  async getRevenueTrend(
    req: Request,
    res: Response
  ) {

    try {

    //   const hotelId = (req as any).hotelId as number;
const hotelId = 3;
      const period =
        (req.query.period as RevenuePeriod) || "daily";

      const result =
        await dashboardService.getRevenueTrend(
          hotelId,
          period
        );

      return res.status(200).json(result);

    } catch (error: any) {

      return res.status(400).json({
        message: error.message
      });

    }
  }


async getBookingStatusDistribution(
  req: Request,
  res: Response
) {

  try {

    // const hotelId =
    //   (req as any).hotelId as number;
const hotelId = 25;
    const result =
      await dashboardService
        .getBookingStatusDistribution(
          hotelId
        );

    return res.status(200).json(result);

  } catch (error: any) {

    return res.status(400).json({
      message: error.message
    });

  }
}






}
