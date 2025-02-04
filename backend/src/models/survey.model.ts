type SurveyType = {
  id?: number;
  org: string;
  repo: string;
  prNumber: number;
  status: 'pending' | 'completed';
  hits: number;
  userId: string;
  usedCopilot: boolean;
  percentTimeSaved: number;
  timeUsedFor: string;
  reason: string;
  kudos?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export { SurveyType };