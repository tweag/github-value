export interface Survey {
  id: number;
  daytime: Date;
  userId: number;
  usedCopilot: boolean;
  percentTimeSaved: number;
  reason: string;
  timeUsedFor: string;
}