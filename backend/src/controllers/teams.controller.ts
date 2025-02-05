import { Request, Response } from 'express';
import mongoose from 'mongoose';

// const TeamMember = mongoose.model('TeamMember');

class TeamsController {
  async getAllTeams(req: Request, res: Response): Promise<void> {
    const Team = mongoose.model('Team');
    const Member = mongoose.model('Member');
    try {
      const query = req.query.org ? { org: req.query.org } : {};
      const teams = await Team.find(query)
        .populate({
          path: 'members',
          select: 'login avatar_url',
          model: Member
        })
        .populate({
          path: 'children',
          select: 'name org slug description html_url',
          populate: {
            path: 'members',
            select: 'login avatar_url',
            model: Member
          }
        })
        .sort({ name: 'asc', 'members.login': 'asc' })
        .exec();

      res.json(teams);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAllMembers(req: Request, res: Response): Promise<void> {
    const Member = mongoose.model('Member');
    try {
      const members = await Member.find()
        .select('login org name url avatar_url')
        .populate({
          path: 'seat',
          select: '-_id -__v',
          options: { lean: true }
        })
        .sort({ login: 'asc' })
        .exec();

      res.json(members);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getMemberByLogin(req: Request, res: Response): Promise<void> {
    const Member = mongoose.model('Member');
    try {
      const { login } = req.params;
      const member = await Member.findOne({ login })
        .select('login name url avatar_url')
        .exec();

      if (member) {
        res.json(member);
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new TeamsController();