export interface Survey {
  id: number;
  daytime: Date;
  userId: number;
  usedCopilot: boolean;
  pctTimesaved: number;
  timeUsedFor: string;
  timeSaved: string;
}