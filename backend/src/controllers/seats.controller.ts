import { Request, Response } from 'express';
import { CopilotSeat, CopilotAssignee, CopilotAssigningTeam } from '../models/copilot.seats';

class SeatsController {
   async getAllSeats(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await CopilotSeat.findAll({
        include: [
          { model: CopilotAssignee, as: 'assignee' },
          { model: CopilotAssigningTeam, as: 'assigning_team' }
        ]
      });
      res.status(200).json(metrics);    } catch (error) {
      console.log(error);
      res.status(500).json(error);    }
  }

  async getSeatByLogin(req: Request, res: Response): Promise<void> {
    try {
      const { login } = req.params;
      const assignee = await CopilotAssignee.findOne({
        where: { login }
      });
      if (!assignee) {
        res.status(404).json({ error: 'Assignee not found' });        return;
      }
      const metrics = await CopilotSeat.findOne({
        where: { assigneeId: assignee?.dataValues.id },
        include: [
          { model: CopilotAssignee, as: 'assignee' },
          { model: CopilotAssigningTeam, as: 'assigning_team' }
        ]
      });
      if (metrics) {
        res.status(200).json(metrics);      } else {
        res.status(404).json({ error: 'Metrics not found' });      }
    } catch (error) {
      res.status(500).json(error);    }
  }

   async getSeatActivityByLogin(req: Request, res: Response): Promise<void> {
    try {
      const { login } = req.params;
      const metrics = await CopilotSeat.findAndCountAll({
        where: { login },
        include: [
          { model: CopilotAssignee, as: 'assignee' },
          { model: CopilotAssigningTeam, as: 'assigning_team' }
        ]
      });
      if (metrics) {
        res.status(200).json(metrics);      } else {
        res.status(404).json({ error: 'Metrics not found' });      }
    } catch (error) {
      res.status(500).json(error);    }
  }

}

export default new SeatsController();