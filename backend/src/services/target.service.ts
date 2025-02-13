import mongoose from 'mongoose';

interface Target {
  current: number;
  target: number;
  max: number;
}

interface Targets {
  org: {
    seats: Target;
    adoptedDevs: Target;
    monthlyDevsReportingTimeSavings: Target;
    percentOfSeatsReportingTimeSavings: Target;
    percentOfSeatsAdopted: Target;
    percentOfMaxAdopted: Target;
  };
  user: {
    dailySuggestions: Target;
    dailyAcceptances: Target;
    dailyChatTurns: Target;
    dailyDotComChats: Target;
    weeklyPRSummaries: Target;
    weeklyTimeSavedHrs: Target;
  };
  impact: {
    monthlyTimeSavingsHrs: Target;
    annualTimeSavingsAsDollars: Target;
    productivityOrThroughputBoostPercent: Target;
  };
}

class TargetValuesService {
  async getTargetValues() {
    try {
      const Targets = mongoose.model('Targets');
      const targets = await Targets.findOne();
      return targets;
    } catch (error) {
      throw new Error(`Error fetching target values: ${error}`);
    }
  }

  async updateTargetValues(data: Targets) {
    try {
      const Targets = mongoose.model('Targets');
      const targets = await Targets.findOneAndUpdate({}, data, { new: true, upsert: true });
      return targets;
    } catch (error) {
      throw new Error(`Error updating target values: ${error}`);
    }
  }

  async initialize() {
    try {
      const Targets = mongoose.model('Targets');
      const existingTargets = await Targets.findOne();
      if (!existingTargets) {
        const initialData: Targets = {
          org: {
            seats: { current: 0, target: 0, max: 0 },
            adoptedDevs: { current: 0, target: 0, max: 0 },
            monthlyDevsReportingTimeSavings: { current: 0, target: 0, max: 0 },
            percentOfSeatsReportingTimeSavings: { current: 0, target: 0, max: 0 },
            percentOfSeatsAdopted: { current: 0, target: 0, max: 0 },
            percentOfMaxAdopted: { current: 0, target: 0, max: 0 },
          },
          user: {
            dailySuggestions: { current: 0, target: 0, max: 0 },
            dailyAcceptances: { current: 0, target: 0, max: 0 },
            dailyChatTurns: { current: 0, target: 0, max: 0 },
            dailyDotComChats: { current: 0, target: 0, max: 0 },
            weeklyPRSummaries: { current: 0, target: 0, max: 0 },
            weeklyTimeSavedHrs: { current: 0, target: 0, max: 0 },
          },
          impact: {
            monthlyTimeSavingsHrs: { current: 0, target: 0, max: 0 },
            annualTimeSavingsAsDollars: { current: 0, target: 0, max: 0 },
            productivityOrThroughputBoostPercent: { current: 0, target: 0, max: 100 },
          },
        };
        await Targets.create(initialData);
      }
    } catch (error) {
      throw new Error(`Error initializing target values: ${error}`);
    }
  }
}

export default new TargetValuesService();