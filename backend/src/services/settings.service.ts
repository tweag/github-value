import { Settings } from '../models/settings.model.js';
import { QueryService } from './query.service.js';
import setup from './setup.js';
import SmeeService from './smee.js';
import SeatsService from '../services/copilot.seats.service.js';

class SettingsService {
  public baseUrl = process.env.BASE_URL || 'http://localhost';

  constructor() {
  }

  async initializeSettings() {
    try {
      this.baseUrl = await this.getSettingsByName('baseUrl')
    } catch {
      this.updateSetting('baseUrl', this.baseUrl);
    }
    try {
      await this.getSettingsByName('webhookProxyUrl')
    } catch {
      this.updateSetting('webhookProxyUrl', SmeeService.getWebhookProxyUrl());
    }
    try {
      const webhookSecret = await this.getSettingsByName('webhookSecret')
      if (webhookSecret !== process.env.GITHUB_WEBHOOK_SECRET) throw new Error('Webhook secret does not match environment variable');
    } catch {
      this.updateSetting('webhookSecret', process.env.GITHUB_WEBHOOK_SECRET || '');
    }
    try {
      if (!await this.getSettingsByName('devCostPerYear')) throw new Error('Developer cost per year is not set');
    } catch {
      this.updateSetting('devCostPerYear', '100000');
    }
    try {
      if (!await this.getSettingsByName('developerCount')) throw new Error('Developer count is not set');
    } catch {
      this.updateSetting('developerCount', (await SeatsService.getAllSeats()).length.toString());
    }
    try {
      if (!await this.getSettingsByName('hoursPerYear')) throw new Error('Hours per year is not set');
    } catch {
      this.updateSetting('hoursPerYear', '2080');
    }
    try {
      if (!await this.getSettingsByName('percentTimeSaved')) throw new Error('Percent time saved is not set');
    } catch {
      this.updateSetting('percentTimeSaved', '20');
    }
    try {
      if (!await this.getSettingsByName('percentCoding')) throw new Error('Percent coding is not set');
    } catch {
      this.updateSetting('percentCoding', '20');
    }
    try {
      if (!await this.getSettingsByName('metricsCronExpression')) throw new Error('Metrics cron expression is not set');
    } catch {
      this.updateSetting('metricsCronExpression', '0 0 * * *');
    }
  }

  async getAllSettings() {
    return await Settings.findAll();
  }

  async getSettingsByName(name: string): Promise<string> {
    const rsp = await Settings.findOne({ where: { name } });
    if (!rsp) {
      throw new Error('Settings not found');
    }
    return rsp.dataValues.value;
  }

  async updateSetting(name: string, value: string) {
    if (value === await this.getSettingsByName(name)) return await Settings.findOne({ where: { name } });
    await Settings.upsert({ name, value });
    if (name === 'webhookProxyUrl') {
      setup.addToEnv({ WEBHOOK_PROXY_URL: value });
      await SmeeService.createSmeeWebhookProxy();
    }
    if (name === 'webhookSecret') {
      console.log('setting webhook secret', value)
      setup.addToEnv({ GITHUB_WEBHOOK_SECRET: value });
      console.log(name, value)
      await setup.createAppFromEnv();
    }
    if (name === 'metricsCronExpression') QueryService.getInstance()?.updateCronJob(value);
    return await Settings.findOne({ where: { name } });
  }

  async updateSettings(obj: { [key: string]: string }) {
    Object.entries(obj).forEach(([name, value]) => {
      console.log(name, value)
      this.updateSetting(name, value);
    });
  }

  async deleteSettings(name: string) {
    const deleted = await Settings.destroy({
      where: { name }
    });
    if (!deleted) {
      throw new Error('Settings not found');
    }
  }
}

export default new SettingsService();