import { Settings } from '../models/settings.model';

class SettingsService {
  // Get all settings ⚙️
  async getAllSettings() {
    return await Settings.findAll();
  }

  // Get settings by name 🆔
  async getSettingsByName(name: string) {
    const rsp = await Settings.findOne({ where: { name } });
    if (!rsp) {
      throw new Error('Settings not found');
    }
    return rsp.dataValues.value;
  }

  // Update settings ✏️
  async updateSetting(name: string, data: any) {
    const [updated] = await Settings.update(data, {
      where: { name }
    });
    if (updated) {
      return await Settings.findOne({ where: { name } });
    }
    throw new Error('Settings not found');
  }

  async updateSettings(obj: any) {
    Object.entries(obj).forEach(([name, value]) => {
      this.updateSetting(name, { value });
    });
  }

  async updateOrCreateSettings(obj: { [key: string]: string }) {
    Object.entries(obj).forEach(([name, value]) => {
      this.updateOrCreateSetting(name, value);
    });
  }

  async updateOrCreateSetting(name: string, value: string) {
    try {
      await Settings.upsert({ name, value });
      return await Settings.findOne({ where: { name } });
    } catch (error) {
      // 😱 Handle any unexpected errors 😱
      throw error;
    }
  }

  // Delete settings 🗑️
  async deleteSettings(name: string) {
    const deleted = await Settings.destroy({
      where: { name }
    });
    if (deleted) {
      return 'Settings deleted';
    }
    throw new Error('Settings not found');
  }
}

export default new SettingsService();