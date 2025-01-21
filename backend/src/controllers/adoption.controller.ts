import { Request, Response } from 'express';
import SeatsService from '../services/copilot.seats.service.js';
import adoptionService from '../services/adoption.service.js';

class AdoptionController {
  async getAdoptions(req: Request, res: Response): Promise<void> {
    const org = req.query.org?.toString();
    const enterprise = req.query.enterprise?.toString();
    const team = req.query.team?.toString();
    // const { daysInactive, precision } = req.query;
    try {
      const adoptions = await adoptionService.getAllAdoptions2({
        filter: {
          org,
          ...enterprise ? {enterprise: 'enterprise'} : undefined,
          team,
        },
        projection: {
          seats: 0,
          _id: 0,
          __v: 0,
        }
      });
      res.status(200).json(adoptions);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAdoptionTotals(req: Request, res: Response): Promise<void> {
    try {
      const totals = await SeatsService.getMembersActivityTotals(req.query);
      res.status(200).json(totals);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new AdoptionController();