import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const threeSumPattern = `🧠 **Pattern: Sorting + Two Pointers (The 3Sum Pattern)**

When faced with a problem that requires finding triplets (or combinations of elements) that satisfy a specific condition, the **Sorting + Two Pointers** pattern is often the most optimal approach. This pattern fundamentally transforms an $O(N^3)$ brute-force problem into a highly manageable $O(N^2)$ solution.

---

### The Core Challenge: Redundancy and Combinations

To understand why this pattern is so powerful, we must first look at the naive approach. 

If you want to find three numbers that sum to 0 in an array of size $N$, the most straightforward method is to use three nested loops:
- One loop for the first element ($i$).
- One loop for the second element ($j$).
- One loop for the third element ($k$).

This evaluates every possible triplet in the array. 

**The Bottleneck (Brute Force):**
- **Time Complexity:** $O(N^3)$. For an array of just 1,000 elements, this means evaluating 1,000,000,000 combinations. This is entirely too slow for modern constraints.
- **Duplicates:** How do you ensure you don't return \`[-1, 0, 1]\` and \`[0, 1, -1]\`? You would need to sort every triplet and store them in a Hash Set to filter duplicates, adding even more overhead.

---

### The Optimal Solution: Sorting + Two Sum II

The brilliant insight to solve this problem optimally involves two key steps: **Sorting** and **Reduction**.

#### Step 1: Why Sort?
You might think sorting adds unnecessary $O(N \\log N)$ time overhead. However, sorting is the crucial enabler for two things:
1. **It allows us to skip duplicates trivially:** If the array is sorted, identical elements sit next to each other (e.g., \`[-1, -1, 0, 1, 2]\`). If we process the first \`-1\`, we can completely skip the second \`-1\` to prevent duplicate triplets in our final answer.
2. **It unlocks the Two-Pointer technique:** A sorted array gives directional meaning to pointers. If a sum is too large, we move to a smaller number. If a sum is too small, we move to a larger number.

#### Step 2: Problem Reduction
Instead of finding three elements at once, we fix the first element, and reduce the problem to a standard **Two Sum II** problem.

If we want $A + B + C = 0$, and we lock in $A$ by iterating through the array, the problem simply becomes:
**Find $B + C = -A$ in the remainder of the array.**

Because the remainder of the array is already sorted, we can use the **Two Pointers** technique to find $B$ and $C$ in strictly $O(N)$ time.

---

### Execution and Mechanics (The Sliding Window of Two Pointers)

Here is how the execution plays out structurally:

1. **Iterate $i$ from 0 to $N-2$**: This $i$ represents our locked element $A$.
2. **Set up Pointers**: Initialize a \`left\` pointer at $i + 1$ (representing $B$) and a \`right\` pointer at the end of the array (representing $C$).
3. **Evaluate the Sum**: Calculate \`sum = nums[i] + nums[left] + nums[right]\`.
    - **Condition 1 (Match):** If \`sum == 0\`, we found a triplet! We record it, and advance BOTH pointers inwards. We must also use a \`while\` loop to skip any adjacent duplicate values for \`left\` and \`right\` to avoid duplicate triplets.
    - **Condition 2 (Too Small):** If \`sum < 0\`, our current combination is too negative. Because the array is sorted, the ONLY way to increase the sum is to increment the \`left\` pointer to a larger number.
    - **Condition 3 (Too Large):** If \`sum > 0\`, our current combination is too positive. Because the array is sorted, the ONLY way to decrease the sum is to decrement the \`right\` pointer to a smaller number.

### Analysis of the Optimization

- **Time Complexity**: The outer loop runs $N$ times. For every iteration of the outer loop, the inner two pointers scan the remaining elements exactly once, taking $O(N)$ time. $N \\times O(N) = O(N^2)$. The initial $O(N \\log N)$ sort is absorbed by the $O(N^2)$ dominance.
- **Space Complexity**: Generally $O(1)$ or $O(\\log N)$ depending on the sorting algorithm implementation under the hood (e.g., quicksort stack frames), plus the space needed for the output array.

### 🔥 The Reusable Takeaway

This pattern extends far beyond just 3Sum. Whenever a problem asks you to find multiple elements satisfying an algebraic condition (like **3Sum Closest**, **4Sum**, or **Valid Triangle Number**), your instinct should be:

> *"Can I sort the array to group duplicates, fix $K-2$ elements, and use a linear Two-Pointer scan to find the remaining pair?"*

By reducing dimensions (turning a 3D problem into a 2D problem), you fundamentally change the scale of algorithmic efficiency.`;

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const result = await Problem.findOneAndUpdate(
      { slug: '3sum' },
      { pattern: threeSumPattern },
      { new: true }
    );
    console.log('Successfully updated 3Sum with the massive theory pattern!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
