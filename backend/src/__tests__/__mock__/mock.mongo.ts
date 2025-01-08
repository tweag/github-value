import { describe, expect, test, beforeAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';
import Database from '../../database.js';
import SettingsService, { SettingsType } from '../../services/settings.service.js';

const org = null;
const defaultSettings: SettingsType = {
  baseUrl: 'http://localhost',
  webhookProxyUrl: 'http://localhost/proxy',
  webhookSecret: 'secret',
  metricsCronExpression: '0 0 * * *',
  devCostPerYear: '100000',
  developerCount: '10',
  hoursPerYear: '2000',
  percentTimeSaved: '20',
  percentCoding: '50',
};

beforeAll(async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  const database = new Database(process.env.MONGODB_URI);
  await database.connect();
});

beforeEach(async () => {
  const Settings = mongoose.model('Settings');
  await Settings.deleteMany({});
});

describe('settings.service.spec.ts test', () => {
  test('should initialize settings correctly', async () => {
    const settingsService = new SettingsService(defaultSettings);
    const initializedSettings = await settingsService.initialize();

    expect(initializedSettings).toEqual(defaultSettings);
  });

  test('should update settings correctly', async () => {
    const settingsService = new SettingsService(defaultSettings);
    await settingsService.initialize();

    const newSettings = {
      baseUrl: 'http://new-url',
      webhookProxyUrl: 'http://new-url/proxy',
    };

    await settingsService.updateSettings(newSettings);

    const updatedSettings = await settingsService.getAllSettings();
    console.log(updatedSettings);
    const baseUrlSetting = updatedSettings.find((setting: SettingsType) => setting.name === 'baseUrl');
    expect(baseUrlSetting?.value).toEqual(newSettings.baseUrl);
    const webhookProxyUrlSetting = updatedSettings.find((setting: SettingsType) => setting.name === 'webhookProxyUrl');
    expect(webhookProxyUrlSetting?.value).toEqual(newSettings.webhookProxyUrl);
  });

  test('should delete settings correctly', async () => {
    const settingsService = new SettingsService(defaultSettings);
    await settingsService.initialize();

    await settingsService.deleteSettings('baseUrl');

    const settings = await settingsService.getAllSettings();
    expect(settings['baseUrl']).toBeUndefined();
  });
});
