import { Request, Response } from 'express';
import { Assignee, getAssigneesActivity, AssigningTeam, Seat } from '../models/copilot.seats.model';

class SeatsController {
  async getAllSeats(req: Request, res: Response): Promise<void> {
    try {
      res.status(200).json(await Seat.findAll({
        include: [
          {
            model: Assignee,
            as: 'assignee',
            required: false
          },
          {
            model: AssigningTeam,
            as: 'assigning_team',
            required: false
          }
        ]
      }));
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getActivity(req: Request, res: Response): Promise<void> {
    try {      
      const activityDays = await getAssigneesActivity(1);
      res.status(200).json(activityDays);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getActivityHighcharts(req: Request, res: Response): Promise<void> {
    try {
      const activityDays = await getAssigneesActivity(1);
      const series = Object.entries(activityDays).reduce((acc, [date, data]) => {
        acc[0].data.push([new Date(date).getTime(), data.totalActive]);
        acc[1].data.push([new Date(date).getTime(), data.totalInactive]);
        return acc;
      }, [
        { name: 'Active', data: [] as [number, number][], type: 'line' },
        { name: 'Inactive', data: [] as [number, number][], type: 'line' }
      ]);
      res.status(200).json(series);
    } catch (error) {
      res.status(500).json(error);
    }
  }

}

export default new SeatsController();