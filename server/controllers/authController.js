import User from '../models/User.js';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Register
export const register = async (req, res) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create(validated);
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body);
    
    const user = await User.findOne({ email: validated.email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = user.generateToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        solvedProblems: user.solvedProblems,
        streak: user.streak
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('solvedProblems.problem', 'title slug difficulty');

    // Calculate rank: count users with more solved problems + 1
    const userSolvedCount = user.solvedProblems ? user.solvedProblems.length : 0;
    const usersAhead = await User.countDocuments({
      _id: { $ne: user._id },
      $expr: { $gt: [{ $size: '$solvedProblems' }, userSolvedCount] }
    });
    const rank = usersAhead + 1;

    const userObj = user.toObject();
    userObj.rank = rank;

    res.json({ success: true, user: userObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
