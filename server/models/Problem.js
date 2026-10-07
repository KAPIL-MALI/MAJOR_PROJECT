import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Basic', 'Easy', 'Medium', 'Hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [{
    type: String
  }],
  starterCode: {
    javascript: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' }
  },
  driverCode: {
    javascript: { type: String, default: '' },
    cpp: { type: String, default: '' },
    java: { type: String, default: '' }
  },
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false }
  }],
  solution: {
    type: String,
    default: ''
  },
  solutionExplanation: {
    type: String,
    default: ''
  },
  pattern: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  acceptance: {
    type: Number,
    default: 0
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptedSubmissions: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-generate slug from title before validation
problemSchema.pre('validate', function(next) {
  if (this.title && (this.isModified('title') || this.isNew) && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  // Calculate acceptance rate
  if (this.totalSubmissions > 0) {
    this.acceptance = Math.round((this.acceptedSubmissions / this.totalSubmissions) * 100);
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
