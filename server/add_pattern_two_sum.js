import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const patternText = `🧠 **Pattern: Hash Map / Complement Pattern**

The key idea is:

For every element, check whether its required complement already exists.

If \`target = 9\` and current number is \`2\`:

\`complement = 9 - 2 = 7\`

So instead of checking every pair, you ask:

*"Have I already seen 7?"*

**What you learned from Two Sum**
- **Complement thinking** → target - current
- **Hash Map for fast lookup** → check existence in O(1) average time
- **Store previous elements** → avoid checking the same pairs repeatedly
- **Brute force → optimized approach**
  - Brute force: O(n²)
  - Hash Map: O(n)

🔥 **The reusable pattern**

When a problem asks you to find two elements satisfying some condition, think:

*"Can I calculate what I need from the current element and quickly check whether I have already seen it?"*

This pattern appears in many problems beyond Two Sum, such as 3Sum variations, subarray-sum problems, frequency problems, and pair-finding problems.

So your takeaway from Two Sum is:

> **Two Sum → Complement + Hash Map → "What do I need, and have I seen it before?"**`;

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const result = await Problem.findOneAndUpdate(
      { slug: 'two-sum' },
      { pattern: patternText },
      { new: true }
    );

    if (result) {
      console.log('Successfully updated Two Sum pattern!');
    } else {
      console.log('Could not find Two Sum problem.');
    }
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    mongoose.connection.close();
  }
}

migrate();
