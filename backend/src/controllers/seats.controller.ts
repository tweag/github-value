import { Request, Response } from 'express';
import SeatsService from '../services/copilot.seats.service.js';

class SeatsController {
  async getAllSeats(req: Request, res: Response): Promise<void> {
    try {
      const seats = await SeatsService.getAllSeats();
      res.status(200).json(seats);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSeat(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const idNumber = Number(id);
    try {
      const seat = isNaN(idNumber) ? await SeatsService.getAssigneeByLogin(id) : await SeatsService.getAssignee(idNumber);
      res.status(200).json(seat);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getActivity(req: Request, res: Response): Promise<void> {
    const { daysInactive, precision } = req.query;
    const _daysInactive = Number(daysInactive);
    if (!daysInactive || isNaN(_daysInactive)) {
      res.status(400).json({ error: 'daysInactive query parameter is required' });
      return;
    }
    try {
      const activityDays = await SeatsService.getAssigneesActivity(_daysInactive, precision as 'hour' | 'day' | 'minute');
      res.status(200).json(activityDays);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getActivityTotals(req: Request, res: Response): Promise<void> {
    try {
      const totals = await SeatsService.getAssigneesActivityTotals();
      console.log('totals', totals);
      res.status(200).json(totals);
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
    }
  }

  async getActivityHighcharts(req: Request, res: Response): Promise<void> {
    try {
      const { daysInactive } = req.query;
      const _daysInactive = Number(daysInactive);
      if (!daysInactive || isNaN(_daysInactive)) {
        res.status(400).json({ error: 'daysInactive query parameter is required' });
        return;
      }
      const activityDays = await SeatsService.getAssigneesActivity(_daysInactive);
      const activeData = Object.entries(activityDays).reduce((acc, [date, data]) => {
        acc.push([new Date(date).getTime(), data.totalActive]);
        return acc;
      }, [] as [number, number][]);
      res.status(200).json(activeData);
    } catch (error) {
      res.status(500).json(error);
    }
  }

}

export default new SeatsController();