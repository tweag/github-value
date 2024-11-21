import { Request, Response } from 'express';
import TargetValuesService from '../services/target-values.service.js';

class TargetValuesController {
  async getTargetValues(req: Request, res: Response): Promise<void> {
    try {
      const targetValues = await TargetValuesService.getTargetValues();
      res.status(200).json(targetValues);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateTargetValues(req: Request, res: Response): Promise<void> {
    try {
      const updatedTargetValues = await TargetValuesService.updateTargetValues(req.body);
      res.status(200).json(updatedTargetValues);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new TargetValuesController();
