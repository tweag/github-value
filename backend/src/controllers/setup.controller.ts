import { Request, Response } from 'express';
import setup, { SetupStatus } from '../services/setup.js';
import { dbConnect } from 'database.js';

class SetupController {

  async databaseConnect(req: Request, res: Response) {
    try {
      await dbConnect();
      res.json({ message: 'Connected to the database' });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async registrationComplete(req: Request, res: Response) {
    try {
      const { code } = req.query;

      const data = await setup.createFromManifest(code as string);

      res.redirect(`${data.html_url}/installations/new`);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async installComplete(req: Request, res: Response) {
    try {
      const { installation_id } = req.query;
      setup.addToEnv({ GITHUB_APP_INSTALLATION_ID: installation_id as string });
      await setup.createAppFromEnv();
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

  async addExistingApp(req: Request, res: Response) {
    try {
      const { appId, privateKey, webhookSecret } = req.body;

      if (!appId || !privateKey || !webhookSecret) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      await setup.findFirstInstallation(appId, privateKey, webhookSecret);
      await setup.createAppFromEnv();

      res.json({ installUrl: setup.installUrl });
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

  setupStatus(req: Request, res: Response) {
    try {
         const requestedFields = req.query.fields ? (req.query.fields as string).split(',') : [];
         const fullStatus = setup.getSetupStatus();
         if (!requestedFields.length) {
             return res.json(fullStatus);
         }
         const filteredStatus: SetupStatus = {};
         requestedFields.forEach(field => {
          if (field === 'isSetup') {
            filteredStatus.isSetup = fullStatus.isSetup;
          }
          if (field === 'dbInitialized') {
            filteredStatus.dbInitialized = fullStatus.dbInitialized;
          }
          if (field === 'dbsInitialized') {
            filteredStatus.dbsInitialized = fullStatus.dbsInitialized;
          }
          if (field === 'installation') {
            filteredStatus.installation = fullStatus.installation;
          }
         });
         return res.json(filteredStatus);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  getInstall(req: Request, res: Response) {
    try {
      if (!setup.installation) {
        throw new Error('No installation found');
      }
      res.json(setup.installation);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new SetupController();