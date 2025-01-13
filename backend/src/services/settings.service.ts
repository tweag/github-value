import mongoose from 'mongoose';

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
          await this.updateSetting(name as keyof SettingsType, value);
        }
      }
    }
    return this.settings;
  }

  async getAllSettings() {
    try {
      const Setting = mongoose.model('Settings');
      return await Setting.find<{
        name: string;
        value: string;
      }>({});
    } catch (error) {
      console.error('Failed to get all settings:', error);
      throw error;
    }
  }

  async getSettingsByName(name: string): Promise<string | undefined> {
    try {
      const setting = await mongoose.model('Settings').findOne({ name });
      if (!setting) {
        return undefined;
      }
      return setting.value;
    } catch (error) {
      console.error('Failed to get setting by name:', error);
      return undefined;
    }
  }

  async updateSetting(name: keyof SettingsType, value: string) {
    try {
      const Setting = mongoose.model('Settings');
      const setting = await Setting.findOneAndUpdate(
        { name },
        { value },
        { 
          new: true,
          upsert: true,
        }
      );
      return setting.value;
    } catch (error) {
      console.error('Failed to update setting:', error);
      throw error;
    }
  }

  async updateSettings(obj: { [key: string]: string }) {
    await Promise.all(
      Object.entries(obj).map(([name, value]) => 
      this.updateSetting(name as keyof SettingsType, value)
      )
    );
  }

  async deleteSettings(name: string) {
    try {
      const Setting = mongoose.model('Settings');
      await Setting.findOneAndDelete({ name });
      // if (!result) {
      //   throw new Error('Settings not found');
      // }
    } catch (error) {
      console.error('Failed to delete setting:', error);
      throw error;
    }
  }
}

export default SettingsService;