import { Request, Response } from 'express';
import { Team, Member } from '../models/teams.model';

class TeamsController {
  async getAllTeams(req: Request, res: Response): Promise<void> {
    try {
      const teams = await Team.findAll({
        include: [
          {
            model: Member,
            as: 'members',
            through: {
              attributes: []
            },
            attributes: ['login', 'avatar_url']
          },
          {
            model: Team,
            as: 'children',
            include: [{
              model: Member,
              as: 'members',
              through: {
                attributes: []
              },
              attributes: ['login', 'avatar_url']
            }],
            attributes: ['name', 'slug', 'description', 'html_url']
          }
        ],
        attributes: ['name', 'slug', 'description', 'html_url'],
        order: [
          ['name', 'ASC'],
          [{ model: Member, as: 'members' }, 'login', 'ASC']
        ]
      });
  
      res.json(teams);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  }
}

export default new TeamsController();