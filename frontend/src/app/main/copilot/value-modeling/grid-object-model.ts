
import { TargetsDetailType, TargetsType } from '../../../services/api/targets.service';

export function initializeGridObject(): TargetsType {
  const defaultMetricState: TargetsDetailType = {
    seats: 0,
    adoptedDevs: 0,
    monthlyDevsReportingTimeSavings: 0,
    percentSeatsReportingTimeSavings: 0,
    percentSeatsAdopted: 0,
    percentMaxAdopted: 0,
    dailySuggestions: 0,
    dailyChatTurns: 0,
    weeklyPRSummaries: 0,
    weeklyTimeSaved: 0,
    monthlyTimeSavings: 0,
    annualTimeSavingsDollars: 0,
    productivityBoost: 0,
  };

  return {
    current: { ...defaultMetricState },
    target: { ...defaultMetricState },
    max: { ...defaultMetricState }
  };
}