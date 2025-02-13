import { Endpoints } from '@octokit/types';
import mongoose from 'mongoose';

type UsageType = {
  org: string;
  team?: string;
  day: string;
  totalSuggestionsCount: number;
  totalAcceptancesCount: number;
  totalLinesSuggested: number;
  totalLinesAccepted: number;
  totalActiveUsers: number;
  totalChatAcceptances: number;
  totalChatTurns: number;
  totalActiveChatUsers: number;
}

type UsageBreakdownType = {
  id?: number;
  usage_day: string;
  language: string;
  editor: string;
  suggestionsCount: number;
  acceptancesCount: number;
  linesSuggested: number;
  linesAccepted: number;
  activeUsers: number;
}

async function insertUsage(org: string, data: Endpoints["GET /orgs/{org}/copilot/usage"]["response"]["data"]) {
  for (const metrics of data) {
    const Usage = mongoose.model('Usage');
    
    await Usage.findOneAndUpdate(
      { day: metrics.day },
      { ...metrics },
      { upsert: true }
    );
  }
}

export { UsageType, UsageBreakdownType, insertUsage };