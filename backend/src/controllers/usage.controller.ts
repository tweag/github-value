import { Request, Response } from 'express';
import { UsageType } from 'models/usage.model.js';
import mongoose from 'mongoose';

class UsageController {
  async getUsage(req: Request, res: Response): Promise<void> {
    const Usage = mongoose.model('Usage');
    try {
      const query: mongoose.FilterQuery<UsageType> = {};
      if (req.query.org) {
        query.org = req.query.org as string;
      }

      const metrics = await Usage.find({
        ...req.query.org ? { org: req.query.org } : {},
      }).populate('breakdown');
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new UsageController();