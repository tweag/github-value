import { describe, expect, test, beforeAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import {readFileSync} from 'fs';
import 'dotenv/config'

import Database from '../../database';

const org = null;

beforeAll(async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  const database = new Database(process.env.MONGODB_URI);
  await database.connect();
});

beforeEach(async () => {
  const Members = mongoose.model('Member');
  await Members.deleteMany({ org });
});

describe('team.service.spec.ts test', () => {
  test('should upsert members correctly', async () => {
    const members = JSON.parse(readFileSync('src/__tests__/__mock__/members.json', 'utf8'));
    const Members = mongoose.model('Member');

    // Use bulkWrite with updateOne operations
    const bulkOps = members.map((member: any) => ({
      updateOne: {
        filter: { org, id: member.id },
        update: member,
        upsert: true
      }
    }));

    await Members.bulkWrite(bulkOps, { ordered: false });

    const membersRsp = await Members.find({ org }).sort({ login: 1 });
    
    // Compare relevant fields
    expect(membersRsp.length).toEqual(members.length);
    expect(membersRsp[0]).toEqual(members[0]);
  });
});