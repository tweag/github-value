// mockSeatsGenerator.ts
import { addHours, addDays, addWeeks } from 'date-fns';
import { SeatsMockConfig } from '../types.js';

 class MockSeatsGenerator {
  private config: SeatsMockConfig;
  private activities: Map<string, Date>;
  private baseData: any;  // The template data structure
  private editors: string[];

  constructor(config: SeatsMockConfig, templateData: any) {
    this.config = config;
    this.baseData = templateData;
    this.activities = new Map();
    this.editors = config.editors;

    // Ensure seats exist in templateData
    if (!this.baseData.seats) {
      throw new Error("Template data must include a 'seats' property.");
    };

    // Initialize last activity times for all users
    this.baseData.seats.forEach((seat: any) => {
      const login = seat.assignee.login;
      const lastActivityAt : any = seat.last_activity_at;
      // Use lastActivityAt as needed
      this.activities.set(login, new Date(lastActivityAt));
    });
  }

  private getRandomEditor(): string {
    return this.editors[Math.floor(Math.random() * this.editors.length)];
  }

  private getNextActivityIncrement(login: string): number {
    const isHeavyUser = this.config.heavyUsers.includes(login);

    switch (this.config.usagePattern) {
      case 'heavy':
        return 4;  // 4 hours
      case 'heavy-but-siloed':
        return isHeavyUser ? 12 : 24;  // 12 hours or 24 hours
      case 'moderate':
        return 24;  // 24 hours
      case 'light':
        return 168;  // 7 days
    }
  }

  private updateActivity(login: string) {
    const currentActivity : Date = this.activities.get(login)!;
    const incrementHours = this.getNextActivityIncrement(login);
    const newActivity : Date = addHours(currentActivity, incrementHours);
    
    if (newActivity == currentActivity ){
      console.log(`No new activity for ${login}`, newActivity);
    }

    // Don't go beyond end date
    if (newActivity > this.config.endDate) {
      return this.config.endDate; 
    }

    
    return newActivity;
  }

   public generateMetrics() {
    const newData = JSON.parse(JSON.stringify(this.baseData));

    newData.seats = newData.seats.map((seat: any) => {
        const login = seat.assignee.login;
        seat.last_activity_editor = this.getRandomEditor();
        seat.specificUser = this.config.specificUser;
        
       // Update for next time
        seat.last_activity_at = this.updateActivity(login);
        return seat;
    });

    return newData;
  }
}

export { MockSeatsGenerator };