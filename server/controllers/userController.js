import User from '../models/User.js';
import Submission from '../models/Submission.js';

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('solvedProblems.problem', 'title slug difficulty category');
    
    const totalSubmissions = await Submission.countDocuments({ user: req.user._id });
    const acceptedSubmissions = await Submission.countDocuments({ 
      user: req.user._id, 
      status: 'Accepted' 
    });

    // Calculate rank: count users with more solved problems + 1
    const userSolvedCount = user.solvedProblems ? user.solvedProblems.length : 0;
    const usersAhead = await User.countDocuments({
      _id: { $ne: user._id },
      $expr: { $gt: [{ $size: '$solvedProblems' }, userSolvedCount] }
    });
    const rank = usersAhead + 1;

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        streak: user.streak,
        solvedProblems: user.solvedProblems,
        totalSubmissions,
        acceptedSubmissions,
        rank,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find()
      .select('name avatar solvedProblems streak')
      .sort({ 'solvedProblems': -1 })
      .limit(50);

    const leaderboard = users
      .map(u => ({
        id: u._id,
        name: u.name,
        avatar: u.avatar,
        solved: u.solvedProblems.length,
        streak: u.streak
      }))
      .sort((a, b) => b.solved - a.solved);

    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get platform stats
export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const { default: Problem } = await import('../models/Problem.js');
    const totalProblems = await Problem.countDocuments();

    res.json({
      success: true,
      stats: { totalUsers, totalSubmissions, totalProblems }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
