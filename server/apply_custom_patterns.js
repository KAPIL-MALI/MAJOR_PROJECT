import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from './models/Problem.js';

dotenv.config();

const patterns = {
  'invert-binary-tree': `🧠 **Pattern: Tree Recursion**\nThe key idea is: Swap the left and right children of the current node, then recursively do the same for all children.\n**Takeaway:** Bottom-up or Top-down recursion easily mirrors a tree. O(N) time.`,
  'climbing-stairs': `🧠 **Pattern: Dynamic Programming (Fibonacci)**\nThe key idea is: To reach step \`N\`, you either came from \`N-1\` or \`N-2\`. Thus, \`dp[N] = dp[N-1] + dp[N-2]\`.\n**Takeaway:** Base cases and memoization turn O(2^N) recursion into O(N).`,
  'house-robber': `🧠 **Pattern: Dynamic Programming (Take/Skip)**\nThe key idea is: At house \`i\`, you either rob it (\`nums[i] + dp[i-2]\`) or skip it (\`dp[i-1]\`).\n**Takeaway:** \`dp[i] = max(dp[i-1], dp[i-2] + nums[i])\`.`,
  'coin-change': `🧠 **Pattern: DP (Unbounded Knapsack)**\nThe key idea is: \`dp[amount] = min(dp[amount - coin] + 1)\` for all coins.\n**Takeaway:** Build up solutions from 0 to \`amount\`.`,
  'longest-common-subsequence': `🧠 **Pattern: 2D Dynamic Programming**\nThe key idea is: If chars match, \`dp[i][j] = dp[i-1][j-1] + 1\`. Else, \`max(dp[i-1][j], dp[i][j-1])\`.\n**Takeaway:** Use a 2D matrix to track comparisons of two strings.`,
  'number-of-islands': `🧠 **Pattern: Graph Traversal (DFS/BFS Matrix)**\nThe key idea is: Iterate the grid. On '1', trigger a DFS to sink the island (turn connected '1's to '0's). Count triggers.\n**Takeaway:** In-place modification prevents needing a visited matrix.`,
  'group-anagrams': `🧠 **Pattern: Hash Map + String Sorting**\nThe key idea is: Two anagrams, when sorted, result in the exact same string.\n**Takeaway:** Use the sorted string as a Hash Map key, and append original strings to its list.`,
  'container-with-most-water': `🧠 **Pattern: Two Pointers**\nThe key idea is: Start pointers at both ends. Area = \`width * min(height[L], height[R])\`. Move the pointer pointing to the shorter line inward.\n**Takeaway:** Moving the taller line can't increase area because width decreases.`,
  '3sum': `🧠 **Pattern: Sorting + Two Pointers**\nThe key idea is: Sort the array. Iterate \`i\`, then use Two Sum II (Two Pointers) on the remainder \`i+1\` to \`n-1\`.\n**Takeaway:** Sorting prevents duplicates and allows O(N) pair finding.`,
  'minimum-window-substring': `🧠 **Pattern: Sliding Window + Frequency Map**\nThe key idea is: Expand \`right\` until you have all chars. Then shrink \`left\` while you still have all chars to minimize length.\n**Takeaway:** Track required chars versus matched chars.`,
  'subsets': `🧠 **Pattern: Backtracking**\nThe key idea is: At each element, you have a choice: include it in the subset, or exclude it.\n**Takeaway:** Recursion builds combinations incrementally.`,
  'permutations': `🧠 **Pattern: Backtracking (All Paths)**\nThe key idea is: Swap elements or use a \`visited\` array to build all possible orderings of size N.\n**Takeaway:** Backtrack by undoing the choice after the recursive call.`,
  'jump-game': `🧠 **Pattern: Greedy Algorithm**\nThe key idea is: Track the \`maxReach\` you can get to. If at any index, \`i > maxReach\`, you're stuck.\n**Takeaway:** You don't need DP if a greedy choice (furthest jump) always works.`,
  'merge-intervals': `🧠 **Pattern: Sorting Intervals**\nThe key idea is: Sort by start time. If the next interval's start <= current's end, merge them.\n**Takeaway:** Always sort intervals first before trying to process overlaps.`,
  'palindrome-number': `🧠 **Pattern: Math / Digit Extraction**\nThe key idea is: Reverse the second half of the number mathematically (using \`% 10\` and \`/ 10\`) and compare with the first half.\n**Takeaway:** No need to convert to strings.`,
  'fizz-buzz': `🧠 **Pattern: Math / Simulation**\nThe key idea is: Iterate 1 to N, check divisibility by 3, 5, and 15 using the modulo \`%\` operator.\n**Takeaway:** Check \`i % 15 == 0\` first!`,
  'single-number': `🧠 **Pattern: Bit Manipulation (XOR)**\nThe key idea is: \`A XOR A = 0\`, and \`A XOR 0 = A\`. XORing all numbers leaves only the one that appears once.\n**Takeaway:** XOR is incredibly fast and uses O(1) space.`,
  'median-of-two-sorted-arrays': `🧠 **Pattern: Binary Search on Partitions**\nThe key idea is: Binary search the smaller array to find a partition where all left elements <= right elements.\n**Takeaway:** We don't need to merge arrays; we just need to find the exact midpoint.`,
  'trapping-rain-water': `🧠 **Pattern: Two Pointers / Precomputation**\nThe key idea is: Water at \`i\` is \`min(max_left, max_right) - height[i]\`. Two pointers compute this on the fly.\n**Takeaway:** Track max from left and max from right simultaneously.`,
  'merge-k-sorted-lists': `🧠 **Pattern: Min-Heap / Priority Queue**\nThe key idea is: Push the head of all K lists into a Min-Heap. Pop the minimum, and push its \`next\` node.\n**Takeaway:** Min-Heaps are perfect for K-way merging.`,
  'rotate-array': `🧠 **Pattern: Array Reversal Math**\nThe key idea is: Reverse the entire array, then reverse the first K elements, then reverse the rest.\n**Takeaway:** In-place O(1) space rotation using three reversals.`,
  'move-zeroes': `🧠 **Pattern: Fast / Slow Pointers**\nThe key idea is: Keep a \`lastNonZeroFoundAt\` pointer. Swap non-zeros to this index and increment it.\n**Takeaway:** Pointers moving at different speeds can partition arrays.`,
  'search-in-rotated-sorted-array': `🧠 **Pattern: Modified Binary Search**\nThe key idea is: Even if rotated, one half of the array is ALWAYS sorted. Check which half is sorted, and see if \`target\` falls in it.\n**Takeaway:** Binary search works on locally sorted sub-arrays.`,
  'validate-binary-search-tree': `🧠 **Pattern: Tree Traversal (Min/Max Bounds)**\nThe key idea is: Pass down \`min\` and \`max\` valid limits. Left child must be < root, right child must be > root.\n**Takeaway:** A node's value is constrained by ALL its ancestors, not just its parent.`,
  'word-search': `🧠 **Pattern: DFS + Backtracking (Matrix)**\nThe key idea is: Start DFS from every cell matching the first letter. Mark cells as visited during the path, and unmark them upon backtracking.\n**Takeaway:** In-place visited marking saves space.`,
  'lru-cache': `🧠 **Pattern: Doubly Linked List + Hash Map**\nThe key idea is: Map provides O(1) access. Doubly Linked List provides O(1) insertion/deletion to track recent usage.\n**Takeaway:** Combine data structures to get the best of both worlds.`,
  'longest-palindromic-substring': `🧠 **Pattern: Expand Around Center**\nThe key idea is: For each char (and pair of chars), expand outwards as long as it's a palindrome.\n**Takeaway:** O(N^2) expansion is often cleaner and faster than 2D DP.`,
  'majority-element': `🧠 **Pattern: Boyer-Moore Voting Algorithm**\nThe key idea is: Maintain a \`candidate\` and \`count\`. If \`count == 0\`, pick a new candidate. Same? \`count++\`. Different? \`count--\`.\n**Takeaway:** The majority element will always survive the cancellations.`,
  'missing-number': `🧠 **Pattern: Gauss Formula / Bitwise XOR**\nThe key idea is: Sum of 0..N is \`N*(N+1)/2\`. Subtract the actual sum to find the missing one.\n**Takeaway:** Math formulas can replace Hash Sets for O(1) space.`,
  'kth-largest-element-in-an-array': `🧠 **Pattern: Min-Heap / Quickselect**\nThe key idea is: Maintain a Min-Heap of size K. The root is the Kth largest.\n**Takeaway:** Heaps naturally filter out the top K elements.`,
  'implement-trie-prefix-tree': `🧠 **Pattern: Trie (Prefix Tree)**\nThe key idea is: Each node holds an array/map of children chars and a boolean \`isEndOfWord\`.\n**Takeaway:** O(L) time prefix matching where L is word length.`,
  'course-schedule': `🧠 **Pattern: Topological Sort / Cycle Detection**\nThe key idea is: Courses are a Directed Graph. If there's a cycle, you can't finish. Use Kahn's Algorithm (In-degree).\n**Takeaway:** Prerequisites = Directed Edges.`,
  'min-stack': `🧠 **Pattern: Two Stacks**\nThe key idea is: Use a main stack for values, and a second stack to track the minimum value at each depth.\n**Takeaway:** Space tradeoff (O(N)) for O(1) minimum retrieval.`,
  'longest-increasing-subsequence': `🧠 **Pattern: 1D Dynamic Programming**\nThe key idea is: \`dp[i]\` = max length ending at \`i\`. Compare \`nums[i]\` with all \`nums[j]\` before it.\n**Takeaway:** O(N^2) DP. (Can be optimized to O(N log N) using Binary Search).`,
  'serialize-and-deserialize-binary-tree': `🧠 **Pattern: Pre-order Traversal (Stringification)**\nThe key idea is: Use DFS/BFS and mark null nodes explicitly (e.g., with '#') so the tree can be reconstructed unambiguously.\n**Takeaway:** Null markers are required to rebuild a tree's exact shape.`,
  'find-minimum-in-rotated-sorted-array': `🧠 **Pattern: Binary Search (Pivot)**\nThe key idea is: If \`nums[mid] > nums[right]\`, the minimum is in the right half. Otherwise, it's in the left.\n**Takeaway:** Binary search can find inflection points.`,
  'word-break': `🧠 **Pattern: Dynamic Programming (Substrings)**\nThe key idea is: \`dp[i]\` = can we break the string up to index \`i\`? Check if \`dp[j]\` is true and \`s[j..i]\` is in the dictionary.\n**Takeaway:** String partitioning maps perfectly to 1D DP.`
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    let count = 0;
    
    for (const [slug, pattern] of Object.entries(patterns)) {
      await Problem.updateOne({ slug }, { pattern });
      count++;
    }
    
    console.log('Successfully updated ' + count + ' problems with question-specific optimal solutions!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

run();
