import { Seat } from "../models/copilot.seats.model.js";
import { Survey } from "../models/survey.model.js";
import { Member } from "../models/teams.model.js";

export interface StatusType {
  github?: {
    isGood: boolean
  };
  pollingHistory?: {
    isGood: boolean;
    message: string;
    value?: any;
    progress?: string;
  };
  repos?: {
    value: number;
  };
  surveys?: StatusType;
}

class StatusService {
  constructor() {
    
  }

  async getStatus(): Promise<StatusType> {
    const status = {} as StatusType;

    const assignee = await Member.findOne();
    if (assignee) {
      const seats = await Seat.findAll({
        include: [{
          model: Member,
          as: 'assignee'
        }],
        where: {
          assignee_id: assignee.id
        },
        order: [['createdAt', 'DESC']],
      });
      const oldestSeat = seats.find(seat => seat.createdAt);
      const daysSince = oldestSeat ? Math.floor((new Date().getTime() - oldestSeat.createdAt.getTime()) / (1000 * 3600 * 24)) : undefined;
      status.pollingHistory = {
        isGood: true,
        message: `${oldestSeat?.createdAt}`,
        value: daysSince
      }
    }

    const surveys = await Survey.findAll({
      order: [['updatedAt', 'DESC']]
    });

    if (surveys) {
      // status.surveys = {
      //   message: `${surveys.length} surveys created`,
      //   value: surveys.length
      // }
    }

    return status;
  }
}

export default StatusService;