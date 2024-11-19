import { Request, Response } from 'express';
import SettingsService from '../services/settings.service.js';

class SettingsController {
  async getAllSettings(req: Request, res: Response) {
    try {
      const settings = await SettingsService.getAllSettings();
      const settingsRsp = Object.fromEntries(settings.map(setting => [setting.dataValues.name, setting.dataValues.value]));
      res.json(settingsRsp);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getSettingsByName(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const settings = await SettingsService.getSettingsByName(name);
      if (settings) {
        res.json(settings);
      } else {
        res.status(404).json({ error: 'Settings not found' });
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async createSettings(req: Request, res: Response) {
    try {
      const newSettings = await SettingsService.updateSettings(req.body);
      res.status(201).json(newSettings);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateSettings(req: Request, res: Response) {
    try {
      await SettingsService.updateSettings(req.body);
      res.status(200).end();
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async deleteSettings(req: Request, res: Response) {
    try {
      const { name } = req.params;
      await SettingsService.deleteSettings(name);
      res.status(200).end();
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getDeveloperTotal(req: Request, res: Response) {
    try {
      const developerTotal = await SettingsService.getDeveloperTotal();
      res.status(200).json(developerTotal);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateDeveloperTotal(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedDeveloperTotal = await SettingsService.updateDeveloperTotal(value);
      res.status(200).json(updatedDeveloperTotal);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getAdopterCount(req: Request, res: Response) {
    try {
      const adopterCount = await SettingsService.getAdopterCount();
      res.status(200).json(adopterCount);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updateAdopterCount(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedAdopterCount = await SettingsService.updateAdopterCount(value);
      res.status(200).json(updatedAdopterCount);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPerLicenseCost(req: Request, res: Response) {
    try {
      const perLicenseCost = await SettingsService.getPerLicenseCost();
      res.status(200).json(perLicenseCost);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updatePerLicenseCost(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedPerLicenseCost = await SettingsService.updatePerLicenseCost(value);
      res.status(200).json(updatedPerLicenseCost);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPerDevCostPerYear(req: Request, res: Response) {
    try {
      const perDevCostPerYear = await SettingsService.getPerDevCostPerYear();
      res.status(200).json(perDevCostPerYear);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updatePerDevCostPerYear(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedPerDevCostPerYear = await SettingsService.updatePerDevCostPerYear(value);
      res.status(200).json(updatedPerDevCostPerYear);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPerDevHoursPerYear(req: Request, res: Response) {
    try {
      const perDevHoursPerYear = await SettingsService.getPerDevHoursPerYear();
      res.status(200).json(perDevHoursPerYear);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updatePerDevHoursPerYear(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedPerDevHoursPerYear = await SettingsService.updatePerDevHoursPerYear(value);
      res.status(200).json(updatedPerDevHoursPerYear);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getPercentofHoursCoding(req: Request, res: Response) {
    try {
      const percentofHoursCoding = await SettingsService.getPercentofHoursCoding();
      res.status(200).json(percentofHoursCoding);
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async updatePercentofHoursCoding(req: Request, res: Response) {
    try {
      const { value } = req.body;
      const updatedPercentofHoursCoding = await SettingsService.updatePercentofHoursCoding(value);
      res.status(200).json(updatedPercentofHoursCoding);
    } catch (error) {
      res.status(500).json(error);
    }
  }
}

export default new SettingsController();