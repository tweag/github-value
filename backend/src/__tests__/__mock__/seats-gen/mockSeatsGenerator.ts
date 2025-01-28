// mockSeatsGenerator.ts
import { addHours, addDays, addWeeks } from 'date-fns';
import { SeatsMockConfig } from '../types.js';
import { randomInt } from 'crypto';

 class MockSeatsGenerator {
  private config: SeatsMockConfig;
  private activities: Map<string, Date>;
  private baseData: any;  // The template data structure
  private editors: string[];

  constructor(config: SeatsMockConfig, templateData: any) {
    this.config = config;
    this.baseData = templateData;
    //this.activities = new Map();
    this.editors = config.editors;

    // Ensure seats exist in templateData
    if (!this.baseData.seats) {
      throw new Error("Template data must include a 'seats' property.");
    };
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
    return 24;  // Default to moderate
  }

  private updateActivity(login: string, lastActivity: Date): Date {
    const currentActivity : Date = lastActivity;
   
    const incrementHours = this.getNextActivityIncrement(login);
    
    const newActivity : Date = addHours(currentActivity, 100);

    // Don't go beyond end date
    if (newActivity > this.config.endDate) {
      return this.config.endDate; 
    }

    return newActivity;
  }

   public generateSeats() {
    const newSeatsTemplate = JSON.parse(JSON.stringify(this.baseData));
    const newSeatsResponse : any = newSeatsTemplate;
    newSeatsResponse.seats = newSeatsTemplate.seats.map((seat: any) => {
        const login = seat.assignee.login;
        seat.created_at = this.config.startDate;
        seat.updated_at = this.config.endDate;
        //seat.specificUser = this.config.specificUser;
        
        

        if (  Math.random() < (0.08 + Math.random() * .15 )) {
          seat.last_activity_editor = this.getRandomEditor();
         
          console.log('last_activity_at \n', seat.last_activity_at);
          console.log('config.startDate \n', this.config.startDate);
          seat.last_activity_at = this.config.endDate ;
          console.log('user \n', seat.assignee.login);
         }
      
        return seat;
      });
    return newSeatsResponse.seats;
  }
}

export { MockSeatsGenerator };