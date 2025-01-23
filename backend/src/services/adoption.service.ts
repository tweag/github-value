//Austen’s version
import mongoose from 'mongoose';
import logger from './logger.js';
import { SeatEntry } from './copilot.seats.service.js';

type AdoptionType = any;

export class AdoptionService {
  constructor() {
  }

  async createAdoption(adoptionData: any): Promise<AdoptionType> {
    const adoptionModel = mongoose.model('Adoption');
    try {
      // Use `findOneAndUpdate` with `upsert` to avoid duplicates
      const result = await adoptionModel.findOneAndUpdate(
        { date: adoptionData.date }, // Match by unique key (e.g., `date`)
        { $set: adoptionData },      // Update the fields with new data
        { upsert: true, new: true }  // Insert if not found, return the updated document
      );
      return result;
    } catch (error: any) {
      if (error.code === 11000) {
        // Handle duplicate key error explicitly
        logger.error('Duplicate key error creating adoption:', error);
        throw new Error('An adoption with the same date already exists.');
      }
      logger.error('Error creating adoption:', error);
      throw error; // Rethrow other errors
    }
  }
  

  async getAdoptionByDate(date: Date): Promise<AdoptionType | null> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    try {
      return await adoptionModel
        .findOne({ date })
        .populate('seats');
    } catch (error) {
      logger.error('Error fetching adoption:', error);
      throw error;
    }
  }

  async updateAdoption(date: Date, updateData: Partial<AdoptionType>): Promise<AdoptionType | null> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    try {
      return await adoptionModel
        .findOneAndUpdate({ date }, updateData, { new: true })
        .populate('seats');
    } catch (error) {
      logger.error('Error updating adoption:', error);
      throw error;
    }
  }

  async deleteAdoption(date: Date): Promise<boolean> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    try {
      const result = await adoptionModel.deleteOne({ date });
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Error deleting adoption:', error);
      throw error;
    }
  }

  async getAllAdoptions(): Promise<AdoptionType[]> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    try {
      return await adoptionModel
        .find({}, { _id: 0, __v: 0, seats: 0 })
        .sort({ date: -1 });
    } catch (error) {
      logger.error('Error fetching all adoptions:', error);
      throw error;
    }
  }

  async getAllAdoptions2(options: {
    filter?: {
      org?: string,
      enterprise?: string,
      team?: string,
    },
    projection?: any
  }): Promise<AdoptionType[]> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    try {
      return await adoptionModel
        .find(
          options.filter || {},
          options.projection || { _id: 0, __v: 0 }
        )
        .populate('seats')
        .sort({ date: -1 });
    } catch (error) {
      logger.error('Error fetching all adoptions:', error);
      throw error;
    }
  }

  calculateAdoptionTotals(queryAt: Date, data: SeatEntry[], daysInactive = 30) {
    return data.reduce((acc, activity) => {
      if (!activity.last_activity_at) {
        acc.totalInactive++;
        return acc;
      }
      const fromTime = (new Date(activity.last_activity_at)).getTime() || 0;
      const toTime = queryAt.getTime();
      const diff = Math.floor((toTime - fromTime) / 86400000);
      const dateIndex = new Date(queryAt);
      dateIndex.setUTCMinutes(0, 0, 0);
      if (activity.last_activity_at && activity.last_activity_editor) {
        if (diff > daysInactive) {
          acc.totalActive++;
        } else {
          acc.totalInactive++;
        }
      }
      return acc;
    }, {
      totalSeats: data.length,
      totalActive: 0,
      totalInactive: 0,
    });
  }
}

export default new AdoptionService();
