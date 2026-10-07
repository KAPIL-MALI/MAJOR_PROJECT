import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const total = await Problem.countDocuments({});
    const withSolution = await Problem.countDocuments({ solution: { $exists: true, $ne: '' } });
    console.log(`Total problems in DB: ${total}`);
    console.log(`Problems with solutions in DB: ${withSolution}`);
    
    if (total > withSolution) {
      console.log('\nList of problems missing solutions:');
      const missing = await Problem.find({ $or: [{ solution: { $exists: false } }, { solution: '' }] }, 'title slug');
      missing.forEach((p, idx) => {
        console.log(`${idx + 1}. ${p.title} (${p.slug})`);
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
