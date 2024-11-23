import { Settings } from '../models/settings.model.js';

export interface SettingsType {
  baseUrl?: string,
  webhookProxyUrl?: string,
  webhookSecret?: string,
  metricsCronExpression: string,
  devCostPerYear: string,
  developerCount: string,
  hoursPerYear: string,
  percentTimeSaved: string,
  percentCoding: string,
}

class SettingsService {
  settings: SettingsType;

  constructor(
    private defaultSettings: SettingsType
  ) {
    this.settings = defaultSettings;
  }

  async initialize() {
    for (const [name, value] of Object.entries(this.defaultSettings)) {
      try {
        const setting = await this.getSettingsByName(name);
        if (setting) {
          this.settings[name as keyof SettingsType] = setting
        }
      } catch {
        if (value) {
          await this.updateSetting(name, value);
        }
      }
    }
    return this.settings;
  }

  async getAllSettings() {
    return await Settings.findAll();
  }

  async getSettingsByName(name: string): Promise<string | undefined> {
    try {
      const rsp = await Settings.findOne({ where: { name } });
      if (!rsp) {
        return undefined;
      }
      return rsp.dataValues.value;
    } catch {
      return undefined;
    }
  }

  async updateSetting(name: string, value: string) {
    if (value === await this.getSettingsByName(name)) return await Settings.findOne({ where: { name } });
    await Settings.upsert({ name, value });
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
}

export default SettingsService;