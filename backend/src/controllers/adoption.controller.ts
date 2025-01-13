import { Request, Response } from 'express';
import SeatsService from '../services/copilot.seats.service.js';
import adoptionService from '../services/adoption.service.js';

class AdoptionController {
  async getAdoptions(req: Request, res: Response): Promise<void> {
    const org = req.query.org?.toString()
    const { daysInactive, precision } = req.query;
    const _daysInactive = Number(daysInactive);
    if (!daysInactive || isNaN(_daysInactive)) {
      res.status(400).json({ error: 'daysInactive query parameter is required' });
      return;
    }
    try {
      const adoptions = await adoptionService.getAllAdoptions();
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