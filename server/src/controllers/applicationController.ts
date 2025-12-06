import { Request, Response } from "express";
import Application from "../models/Application";

export const getApplications = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const applications = await Application.find({ userId }).sort({
      appliedDate: -1,
      createdAt: -1,
    });
    res.json(applications);
  } catch (error) {
    console.error("Get Applications Error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
