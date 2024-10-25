import { Request, Response } from 'express';
import setup from '../services/setup';

class SetupController {
  async setup(req: Request, res: Response) {
    try {
      const { code } = req.query;

      const data = await setup.createAppFromCode(code as string);

      res.redirect(`${data.html_url}/installations/new`);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async install(req: Request, res: Response) {
    try {
      const { installation_id } = req.query;

      if (isNaN(Number(installation_id))) {
        throw new Error('installation_id must be a number');
      }
      const app = await setup.createAppFromInstallationId(Number(installation_id));
      
      res.redirect(process.env.WEB_URL || '/');
    } catch (error) {
      res.status(500).json(error);
    }
  }

  getManifest(req: Request, res: Response) {
    try {
      const manifest = setup.getManifest(`${req.protocol}://${req.hostname}`);
      res.json(manifest);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  isSetup(req: Request, res: Response) {
    try {
      res.json({ isSetup: setup.isSetup() });
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new SetupController();