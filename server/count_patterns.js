import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const total = await Problem.countDocuments({});
    const withPattern = await Problem.countDocuments({ pattern: { $exists: true, $ne: '' } });
    console.log(`Database has ${total} problems in total.`);
    console.log(`${withPattern} problems have a pattern populated.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
