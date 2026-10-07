// Chatbot controller - Gemini AI integration
// Falls back to a smart keyword-based response system if API key is not configured

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

function initGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (key && key !== 'your_gemini_api_key_here' && !genAI) {
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }
  return model;
}

export const chat = async (req, res) => {
  try {
    const { message, context, history, problemTitle, difficulty, tags, language, userCode } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const geminiModel = initGemini();

    if (!geminiModel) {
      // Smart fallback: provide helpful coding responses without API
      const response = getSmartFallbackResponse(message, context, history);
      return res.json({ success: true, reply: response });
    }

    // Build problem context block for the system prompt
    const problemContextParts = [];
    if (problemTitle) problemContextParts.push(`Problem: "${problemTitle}"`);
    if (difficulty) problemContextParts.push(`Difficulty: ${difficulty}`);
    if (tags) problemContextParts.push(`Tags: ${Array.isArray(tags) ? tags.join(', ') : tags}`);
    if (language) problemContextParts.push(`Language: ${language}`);
    if (userCode) problemContextParts.push(`User's current code:\n\`\`\`${language || ''}\n${userCode}\n\`\`\``);
    const problemBlock = problemContextParts.length
      ? `\n\nThe user is currently working on a coding problem. Here is the context:\n${problemContextParts.join('\n')}`
      : '';

    // Build the chat with conversation history for context
    const systemPrompt = `You are PrimeCode AI Assistant, a helpful coding tutor on a LeetCode-style platform.
You help users with DSA problems, explain concepts, and give hints without directly giving away full solutions.
${context ? `Current context: ${context}` : ''}${problemBlock}
Keep responses concise (under 300 words), well-formatted with markdown, and helpful.
Use code examples when relevant. Use emojis sparingly for friendliness.
When the user asks to explain, debug, or optimize their code, refer to the code provided in the context above.`;

    // Build conversation history for multi-turn chat
    const chatHistory = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          chatHistory.push({ role: 'user', parts: [{ text: msg.content }] });
        } else if (msg.role === 'assistant' || msg.role === 'model') {
          chatHistory.push({ role: 'model', parts: [{ text: msg.content }] });
        }
      }
    }

    // Gemini requires history to start with a 'user' message — strip leading 'model' entries
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.shift();
    }

    const chat = geminiModel.startChat({
      history: chatHistory,
      systemInstruction: { parts: [{ text: systemPrompt }] },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chatbot error:', error.message || error);
    // Even on error, try to give a useful fallback
    const { message: userMsg, context, history } = req.body;
    const fallback = getSmartFallbackResponse(userMsg || '', context, history);
    res.json({ success: true, reply: fallback });
  }
};

// ─── Smart Fallback Response System ───────────────────────────────────────────
// Matches multiple keywords and picks the most relevant response.
// Returns varied answers based on what the user actually asked about.

const topicResponses = [
  {
    keywords: ['two sum', 'twosum', '2sum', 'pair sum'],
    response: `🎯 **Two Sum Problem Tips:**

The classic Two Sum can be solved in **O(n)** using a hash map:

\`\`\`python
def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
\`\`\`

**Key insight:** For each number, check if its complement (target - num) was already seen.

Want me to explain variations like 3Sum or Two Sum II (sorted array)?`
  },
  {
    keywords: ['binary search', 'bisect'],
    response: `🔍 **Binary Search Pattern:**

\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
\`\`\`

**When to use:** Sorted array, or any problem where you can eliminate half the search space.

**Common variations:**
- Find first/last occurrence → adjust the condition
- Search in rotated array → check which half is sorted
- Search answer space → binary search on the answer`
  },
  {
    keywords: ['linked list', 'linkedlist'],
    response: `🔗 **Linked List Techniques:**

1. **Two Pointers (Fast/Slow):**
   - Detect cycle → Floyd's algorithm
   - Find middle → slow moves 1, fast moves 2
   - Find kth from end → offset by k

2. **Reversal:**
\`\`\`python
def reverse(head):
    prev, curr = None, head
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev
\`\`\`

3. **Dummy Node:** Use a dummy head to simplify edge cases like deleting the first node.`
  },
  {
    keywords: ['recursion', 'recursive', 'backtracking', 'backtrack'],
    response: `🔄 **Recursion & Backtracking:**

**Template for backtracking:**
\`\`\`python
def backtrack(candidates, path, result):
    if is_valid(path):
        result.append(path[:])
        return
    for choice in candidates:
        path.append(choice)        # Make choice
        backtrack(candidates, path, result)  # Explore
        path.pop()                 # Undo choice
\`\`\`

**Common problems:**
- Permutations, Combinations, Subsets
- N-Queens, Sudoku Solver
- Word Search, Letter Combinations

**Key:** Think about what choices you have at each step, and when to stop (base case).`
  },
  {
    keywords: ['sliding window', 'window', 'subarray'],
    response: `🪟 **Sliding Window Pattern:**

\`\`\`python
def sliding_window(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]
        max_sum = max(max_sum, window_sum)
    return max_sum
\`\`\`

**Two types:**
1. **Fixed size** — Window length is given (e.g., max sum subarray of size k)
2. **Variable size** — Expand/shrink based on condition (e.g., longest substring without repeating chars)

**Variable window template:**
- Expand the right pointer
- While constraint is violated, shrink from left
- Update the answer`
  },
  {
    keywords: ['hash', 'hashmap', 'hash map', 'dictionary', 'hashtable'],
    response: `📦 **Hash Map Patterns:**

Hash maps give **O(1)** average lookup — incredibly powerful!

**Common patterns:**
1. **Frequency counting** — Count occurrences of elements
2. **Two Sum pattern** — Store complement for O(n) pair finding
3. **Grouping** — Group anagrams, group by key
4. **Caching/Memoization** — Store computed results

\`\`\`python
from collections import Counter
freq = Counter([1, 2, 2, 3, 3, 3])
# freq = {1: 1, 2: 2, 3: 3}
\`\`\`

**When to use:** Whenever you need fast lookups, duplicate detection, or counting.`
  },
  {
    keywords: ['tree', 'binary tree', 'bst', 'traversal', 'inorder', 'preorder', 'postorder'],
    response: `🌳 **Tree Traversal Patterns:**

\`\`\`python
def inorder(root):    # Left → Root → Right (sorted for BST)
    if not root: return []
    return inorder(root.left) + [root.val] + inorder(root.right)

def preorder(root):   # Root → Left → Right
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)

def levelorder(root): # BFS
    queue = [root]
    while queue:
        node = queue.pop(0)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
\`\`\`

**Tips:**
- Most tree problems → recursive DFS
- Level-by-level → BFS with queue
- BST property → inorder gives sorted order`
  },
  {
    keywords: ['graph', 'adjacency', 'bfs', 'dfs', 'shortest path', 'topological'],
    response: `🗺️ **Graph Algorithms Cheat Sheet:**

| Problem | Algorithm | Time |
|---------|-----------|------|
| Traversal | BFS / DFS | O(V+E) |
| Shortest (unweighted) | BFS | O(V+E) |
| Shortest (weighted) | Dijkstra | O(E log V) |
| Cycle detection | DFS + colors | O(V+E) |
| Topological sort | Kahn's (BFS) | O(V+E) |
| Connected components | Union-Find | O(α(n)) |

**BFS template:**
\`\`\`python
from collections import deque
def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\``
  },
  {
    keywords: ['dynamic', 'dp', 'memoization', 'tabulation'],
    response: `🧩 **Dynamic Programming Framework:**

**Step-by-step approach:**
1. **Define subproblem:** What's the state? (e.g., dp[i] = answer for first i elements)
2. **Recurrence:** How do states relate? (e.g., dp[i] = dp[i-1] + dp[i-2])
3. **Base case:** Smallest subproblem (e.g., dp[0] = 0, dp[1] = 1)
4. **Order:** Bottom-up (iterative) or top-down (recursive + memo)

\`\`\`python
# Fibonacci - Bottom Up
def fib(n):
    dp = [0, 1]
    for i in range(2, n + 1):
        dp.append(dp[i-1] + dp[i-2])
    return dp[n]
\`\`\`

**Common DP patterns:** Knapsack, LCS, LIS, Matrix Chain, Coin Change`
  },
  {
    keywords: ['time complexity', 'big o', 'complexity', 'space complexity', 'analyze'],
    response: `⏱️ **Complexity Analysis Guide:**

| Complexity | Name | Example |
|------------|------|---------|
| O(1) | Constant | Hash lookup, array access |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop, linear scan |
| O(n log n) | Linearithmic | Merge sort, heap sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Subsets, recursive fib |
| O(n!) | Factorial | Permutations |

**Quick rules:**
- Single loop → O(n)
- Nested loops → O(n²)
- Halving each step → O(log n)
- Recursive with 2 branches → O(2ⁿ)

**Space:** Count extra memory used (stack frames count for recursion!)`
  },
  {
    keywords: ['stack', 'queue', 'monotonic', 'parentheses', 'bracket'],
    response: `📚 **Stack & Queue Patterns:**

**Monotonic Stack** (Next Greater Element):
\`\`\`python
def next_greater(nums):
    result = [-1] * len(nums)
    stack = []
    for i, num in enumerate(nums):
        while stack and nums[stack[-1]] < num:
            result[stack.pop()] = num
        stack.append(i)
    return result
\`\`\`

**Valid Parentheses:**
\`\`\`python
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in pairs.values():
            stack.append(c)
        elif not stack or stack.pop() != pairs[c]:
            return False
    return len(stack) == 0
\`\`\`

**Use stack for:** matching, nesting, undo operations`
  },
  {
    keywords: ['sort', 'sorting', 'merge sort', 'quick sort', 'bubble'],
    response: `🔄 **Sorting Algorithms Comparison:**

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |

**Pro tip:** For interviews, know merge sort and quick sort inside out. Most languages use a hybrid (Timsort).`
  },
  {
    keywords: ['string', 'substring', 'palindrome', 'anagram'],
    response: `📝 **String Problem Patterns:**

1. **Palindrome check:**
\`\`\`python
def is_palindrome(s):
    return s == s[::-1]
\`\`\`

2. **Anagram check:** Sort both or compare frequency maps
3. **Longest palindromic substring:** Expand around center — O(n²)
4. **Substring search:** Sliding window + hash map

**Common techniques:**
- Two pointers from both ends
- Sliding window for substring problems
- Hash map for character frequency
- Trie for prefix matching

**KMP algorithm** for pattern matching in O(n+m)`
  },
  {
    keywords: ['heap', 'priority queue', 'top k', 'kth largest', 'kth smallest'],
    response: `⛰️ **Heap / Priority Queue:**

\`\`\`python
import heapq

# Min heap (default in Python)
heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
smallest = heapq.heappop(heap)  # 1

# Top K largest → use min heap of size K
def top_k(nums, k):
    return heapq.nlargest(k, nums)

# Kth largest → min heap of size k
def kth_largest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for num in nums[k:]:
        if num > heap[0]:
            heapq.heapreplace(heap, num)
    return heap[0]
\`\`\`

**Use heaps for:** Top K, K-way merge, Running median, Dijkstra's algorithm`
  },
  {
    keywords: ['greedy', 'interval', 'scheduling'],
    response: `🏃 **Greedy Algorithm Patterns:**

**When to use greedy:** When local optimal choice leads to global optimal.

**Classic problems:**
1. **Activity Selection / Interval Scheduling:**
\`\`\`python
def max_meetings(intervals):
    intervals.sort(key=lambda x: x[1])  # Sort by end time
    count, end = 0, float('-inf')
    for start, finish in intervals:
        if start >= end:
            count += 1
            end = finish
    return count
\`\`\`

2. **Fractional Knapsack** — Take highest value/weight ratio first
3. **Huffman Coding** — Always merge two smallest frequencies
4. **Jump Game** — Track the farthest reachable index

**Greedy vs DP:** If greedy doesn't work (can't prove optimality), try DP!`
  },
  {
    keywords: ['bit', 'bitwise', 'xor', 'and', 'or', 'manipulation'],
    response: `🔢 **Bit Manipulation Tricks:**

\`\`\`python
# Check if n is power of 2
n & (n - 1) == 0

# Count set bits
bin(n).count('1')

# Get ith bit
(n >> i) & 1

# Set ith bit
n | (1 << i)

# Clear ith bit
n & ~(1 << i)

# XOR properties:
# a ^ a = 0  (cancel out)
# a ^ 0 = a  (identity)
# Find single number: XOR all elements
\`\`\`

**Classic problems:**
- Single Number → XOR all elements
- Power of 2 → n & (n-1) == 0
- Subsets → iterate 0 to 2^n-1`
  },
  {
    keywords: ['hint', 'help', 'stuck', 'approach', 'how to', 'solve', 'solution', 'answer', 'code'],
    response: `💡 **Problem-Solving Framework:**

1. **Understand:** Read carefully, note constraints, identify input/output
2. **Examples:** Trace through examples by hand
3. **Brute force:** What's the simplest (even slow) solution?
4. **Optimize:** Can you trade space for time? (hash map, sorting, etc.)
5. **Pattern match:** Does it resemble a known problem type?

**Common patterns to try:**
- Sorted input? → **Binary search** or **Two pointers**
- Subarray/substring? → **Sliding window**
- Counting/pairs? → **Hash map**
- Optimal substructure? → **DP**
- Tree/graph? → **DFS/BFS**
- Top/Kth? → **Heap**

What specific problem are you working on? I can give a more targeted hint!`
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'sup', 'yo'],
    response: `👋 Hey there! I'm **PrimeCode AI Assistant**.

I can help you with:
- 💡 **Problem hints** — describe what you're stuck on
- 📊 **Complexity analysis** — analyze your solution's Big O
- 🧠 **DSA concepts** — arrays, trees, graphs, DP, and more
- 🐛 **Debugging tips** — common mistakes and edge cases
- 📝 **Code patterns** — templates for common problem types

Just ask me anything about coding or algorithms! 🚀`
  },
  {
    keywords: ['thank', 'thanks', 'awesome', 'great', 'cool', 'nice'],
    response: `😊 You're welcome! Happy to help. Keep coding and feel free to ask if you get stuck on anything else! 🚀`
  },
  {
    keywords: ['what can you do', 'features', 'what are you', 'who are you', 'about'],
    response: `🤖 I'm **PrimeCode AI** — your coding companion!

**What I can help with:**
| Category | Examples |
|----------|---------|
| 💡 Hints | Problem-solving approach, algorithm selection |
| 📊 Analysis | Time/space complexity breakdown |
| 🧠 Concepts | Data structures, algorithms, patterns |
| 📝 Templates | Code templates for common patterns |
| 🐛 Debugging | Edge cases, common pitfalls |

**Topics I cover:** Arrays, Strings, Linked Lists, Trees, Graphs, DP, Greedy, Backtracking, Binary Search, Bit Manipulation, and more!

Just type your question and I'll do my best to help! 💪`
  },
];

function getSmartFallbackResponse(message, context, history) {
  if (!message) return "Could you rephrase that? I didn't catch your question.";
  
  const msg = message.toLowerCase();
  
  // Score each topic by how many keywords match
  let bestMatch = null;
  let bestScore = 0;
  
  for (const topic of topicResponses) {
    let score = 0;
    for (const keyword of topic.keywords) {
      // Use regex to match whole words only to prevent 'this' matching 'hi'
      const regex = new RegExp('\\b' + keyword + '\\b', 'i');
      if (regex.test(msg)) {
        // Longer keyword matches are more specific, weight them higher
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = topic;
    }
  }
  
  if (bestMatch && bestScore > 0) {
    return bestMatch.response;
  }

  // If no keyword matched, try to give a contextual response based on problem page
  if (context && context.includes('viewing problem')) {
    return `🤔 I see you're working on a problem! Here are some things I can help with:

- Type **"hint"** for a general problem-solving approach
- Ask about a specific **data structure** (e.g., "How do I use a hash map?")
- Ask about **time complexity** to understand Big O
- Describe what's **confusing** and I'll try to clarify

What aspect of this problem do you need help with?`;
  }

  // Generic varied response
  const varied = [
    `🤔 Interesting question! While I think about that, here's what I can help with right now:

- **DSA concepts** — Ask about arrays, trees, graphs, DP, etc.
- **Problem hints** — Tell me what you're stuck on
- **Code patterns** — I know templates for common problems
- **Complexity** — I can break down Big O analysis

Try asking about a specific topic!`,

    `💭 I'm not sure I understood that fully. Could you try asking about:

- A **specific algorithm** (e.g., "explain binary search")
- A **data structure** (e.g., "how do heaps work")
- A **problem type** (e.g., "sliding window problems")
- **Complexity analysis** (e.g., "what is O(n log n)")

I work best with specific coding and DSA questions! 🎯`,

    `🧩 Let me help you out! Here are some popular topics:

1. **Two Pointers** — great for sorted array problems
2. **Sliding Window** — subarray/substring problems
3. **Dynamic Programming** — optimal substructure problems
4. **Graph Traversal** — BFS and DFS patterns

Which topic interests you? Or describe the problem you're working on!`
  ];

  // Use message length as a simple hash to pick different responses
  const index = message.length % varied.length;
  return varied[index];
}
