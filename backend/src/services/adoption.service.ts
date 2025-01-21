import mongoose from 'mongoose';
import logger from './logger.js';

interface AdoptionType {
  date: Date;
  totalSeats: number;
  totalActive: number;
  totalInactive: number;
  seats: mongoose.Schema.Types.ObjectId[];
}

export class AdoptionService {
  constructor() {
  }

  async createAdoption(adoptionData: Partial<AdoptionType>): Promise<AdoptionType> {
    const adoptionModel = mongoose.model<AdoptionType>('Adoption');
    // console.log('adoptionData', adoptionData)
    try {
      const adoption = new adoptionModel(adoptionData);
      return await adoption.save();
    } catch (error) {
      logger.error('Error creating adoption:', error);
      throw error;
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
        .find({}, { totalActive:1 })
        .sort({ date: -1 });
    } catch (error) {
      logger.error('Error fetching all adoptions:', error);
      throw error;
    }
  }
}

export default new AdoptionService();