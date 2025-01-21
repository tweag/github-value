import CounterType from 'models/counter.model.js';
import mongoose from 'mongoose';

class SequenceService {
  async getNextSequenceValue(sequenceName: string): Promise<number> {
    const Counter = mongoose.model('Counter');
    const sequenceCount : CounterType = await Counter.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return sequenceCount.seq;
  }
}

export default new SequenceService();
