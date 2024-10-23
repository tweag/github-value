export interface Survey {
  id?: number;
  dateTime: Date;
  userId: number;
  usedCopilot: boolean;
  percentTimeSaved: number;
  owner: string,
  repo: string,
  prNumber: number,
  reason: string;
  timeUsedFor: string;
}