import mongoose from 'mongoose';

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

  async updateTargetValues(data: {
    current: {
      seats: string;
      adoptedDevs: string;
      monthlyDevsReportingTimeSavings: string;
      percentSeatsReportingTimeSavings: string;
      percentSeatsAdopted: string;
      percentMaxAdopted: string;
      dailySuggestions: string;
      dailyChatTurns: string;
      weeklyPRSummaries: string;
      weeklyTimeSaved: string;
      monthlyTimeSavings: string;
      annualTimeSavingsDollars: string;
      productivityBoost: string;
    };
    target: {
      seats: string;
      adoptedDevs: string;
      monthlyDevsReportingTimeSavings: string;
      percentSeatsReportingTimeSavings: string;
      percentSeatsAdopted: string;
      percentMaxAdopted: string;
      dailySuggestions: string;
      dailyChatTurns: string;
      weeklyPRSummaries: string;
      weeklyTimeSaved: string;
      monthlyTimeSavings: string;
      annualTimeSavingsDollars: string;
      productivityBoost: string;
    };
    max: {
      seats: string;
      adoptedDevs: string;
      monthlyDevsReportingTimeSavings: string;
      percentSeatsReportingTimeSavings: string;
      percentSeatsAdopted: string;
      percentMaxAdopted: string;
      dailySuggestions: string;
      dailyChatTurns: string;
      weeklyPRSummaries: string;
      weeklyTimeSaved: string;
      monthlyTimeSavings: string;
      annualTimeSavingsDollars: string;
      productivityBoost: string;
    };
  }) {
    try {
      const Targets = mongoose.model('Targets');
      const targets = await Targets.findOneAndUpdate({}, data, { new: true, upsert: true });
      return targets;
    } catch (error) {
      throw new Error(`Error updating target values: ${error}`);
    }
  }
}

export default new TargetValuesService();