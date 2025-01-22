import { Request, Response } from 'express';
import SeatsService from '../services/copilot.seats.service.js';
import adoptionService from '../services/adoption.service.js';

class AdoptionController {
  async getAdoptions(req: Request, res: Response): Promise<void> {
    const { enterprise, org, team, since, until, seats } = req.query as { [key: string]: string | undefined };;
    try {
      const adoptions = await adoptionService.getAllAdoptions2({
        filter: {
          org,
          ...enterprise ? {enterprise: 'enterprise'} : undefined,
          team,
          ...since ? { date: { $gte: new Date(since) } } : undefined,
          ...until ? { date: { $lte: new Date(until) } } : undefined,
        },
        projection: {
          ...seats === '1' ? {} : { seats: 0 },
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