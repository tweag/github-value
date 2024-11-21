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
      const baseUrl = await this.getSettingsByName('baseUrl');
      if (!baseUrl) throw new Error('Base URL is not set');
      this.baseUrl = baseUrl;
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
    try {
      if (!await this.getSettingsByName('developerTotal')) throw new Error('Developer total is not set');
    } catch {
      this.updateSetting('developerTotal', '100');
    }
    try {
      if (!await this.getSettingsByName('adopterCount')) throw new Error('Adopter count is not set');
    } catch {
      this.updateSetting('adopterCount', '10');
    }
    try {
      if (!await this.getSettingsByName('perLicenseCost')) throw new Error('Per license cost is not set');
    } catch {
      this.updateSetting('perLicenseCost', '20');
    }
    try {
      if (!await this.getSettingsByName('perDevCostPerYear')) throw new Error('Per developer cost per year is not set');
    } catch {
      this.updateSetting('perDevCostPerYear', '150000');
    }
    try {
      if (!await this.getSettingsByName('perDevHoursPerYear')) throw new Error('Per developer hours per year is not set');
    } catch {
      this.updateSetting('perDevHoursPerYear', '2080');
    }
    try {
      if (!await this.getSettingsByName('percentofHoursCoding')) throw new Error('Percent of hours coding is not set');
    } catch {
      this.updateSetting('percentofHoursCoding', '60');
    }
  }

  async getAllSettings() {
    return await Settings.findAll();
  }

  async getSettingsByName(name: string): Promise<string | undefined> {
    const rsp = await Settings.findOne({ where: { name } });
    if (!rsp) {
      return undefined;
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
      setup.addToEnv({ GITHUB_WEBHOOK_SECRET: value });
      try {
        await setup.createAppFromEnv();
      } catch {
        console.warn('failed to create app from env')
      }
    }
    if (name === 'baseUrl') {
      this.baseUrl = value;
    }
    if (name === 'metricsCronExpression') QueryService.getInstance()?.updateCronJob(value);
    return await Settings.findOne({ where: { name } });
  }

  async updateSettings(obj: { [key: string]: string }) {
    Object.entries(obj).forEach(([name, value]) => {
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

  async getDeveloperTotal() {
    return await this.getSettingsByName('developerTotal');
  }

  async updateDeveloperTotal(value: string) {
    return await this.updateSetting('developerTotal', value);
  }

  async getAdopterCount() {
    return await this.getSettingsByName('adopterCount');
  }

  async updateAdopterCount(value: string) {
    return await this.updateSetting('adopterCount', value);
  }

  async getPerLicenseCost() {
    return await this.getSettingsByName('perLicenseCost');
  }

  async updatePerLicenseCost(value: string) {
    return await this.updateSetting('perLicenseCost', value);
  }

  async getPerDevCostPerYear() {
    return await this.getSettingsByName('perDevCostPerYear');
  }

  async updatePerDevCostPerYear(value: string) {
    return await this.updateSetting('perDevCostPerYear', value);
  }

  async getPerDevHoursPerYear() {
    return await this.getSettingsByName('perDevHoursPerYear');
  }

  async updatePerDevHoursPerYear(value: string) {
    return await this.updateSetting('perDevHoursPerYear', value);
  }

  async getPercentofHoursCoding() {
    return await this.getSettingsByName('percentofHoursCoding');
  }

  async updatePercentofHoursCoding(value: string) {
    return await this.updateSetting('percentofHoursCoding', value);
  }
}

export default new SettingsService();