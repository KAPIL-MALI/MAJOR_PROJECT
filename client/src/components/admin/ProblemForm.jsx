import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import api from '../../utils/api';

const initialProblemState = {
  title: '',
  description: '',
  difficulty: 'Easy',
  category: '',
  tags: '',
  order: 0,
  examples: [{ input: '', output: '', explanation: '' }],
  constraints: [''],
  testCases: [{ input: '', expectedOutput: '', isHidden: false }],
  starterCode: { javascript: '', cpp: '', java: '' },
  solution: '',
  solutionExplanation: '',
  videoUrl: ''
};

const ProblemForm = ({ problem, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialProblemState);
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (problem) {
      setFormData({
        ...problem,
        tags: problem.tags ? problem.tags.join(', ') : '',
        examples: problem.examples?.length ? problem.examples : initialProblemState.examples,
        constraints: problem.constraints?.length ? problem.constraints : initialProblemState.constraints,
        testCases: problem.testCases?.length ? problem.testCases : initialProblemState.testCases,
        starterCode: problem.starterCode || initialProblemState.starterCode
      });
    }
  }, [problem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStarterCodeChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      starterCode: { ...prev.starterCode, [lang]: value }
    }));
  };

  // Array Handlers
  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]];
    if (field === null) {
      newArray[index] = value; // For constraints (array of strings is received)
    } else {
      newArray[index][field] = value; // For arrays of objects
    }
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addArrayItem = (arrayName, emptyItem) => {
    setFormData({ ...formData, [arrayName]: [...formData[arrayName], emptyItem] });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = formData[arrayName].filter((_, i) => i !== index);
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        constraints: formData.constraints.filter(Boolean)
      };

      let res;
      if (problem && problem._id) {
        res = await api.put(`/problems/${problem._id}`, payload);
      } else {
        res = await api.post('/problems', payload);
      }

      onSave(res.data.problem);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-base-100 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-base-content/10">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-base-content/10 bg-base-200/50">
          <h2 className="text-xl font-bold">{problem ? 'Edit Problem' : 'Create New Problem'}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 border-b border-base-content/10 bg-base-200/30">
          {['basic', 'details', 'testcases', 'code'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 capitalize transition-colors ${
                activeTab === tab ? 'border-primary text-primary bg-base-100' : 'border-transparent text-base-content/60 hover:bg-base-200'
              }`}
            >
              {tab === 'basic' ? 'Basic Info' : tab === 'details' ? 'Examples & Constraints' : tab === 'testcases' ? 'Test Cases' : 'Code Templates'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-base-100 custom-scrollbar">
          {error && <div className="alert alert-error mb-4 rounded-lg shadow-sm text-sm">{error}</div>}
          
          <form id="problem-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label"><span className="label-text font-semibold">Title *</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} required className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold">Category *</span></label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} required placeholder="e.g., Arrays, Strings" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold">Difficulty *</span></label>
                    <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="select select-bordered w-full bg-base-200/50 focus:bg-base-100">
                      <option value="Basic">Basic</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold">Tags (comma separated)</span></label>
                    <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., Array, Hash Table" className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold">YouTube Video URL</span></label>
                    <input type="url" name="videoUrl" value={formData.videoUrl || ''} onChange={handleChange} placeholder="e.g., https://www.youtube.com/watch?v=..." className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" />
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold">Order</span></label>
                    <input type="number" name="order" value={formData.order} onChange={handleChange} className="input input-bordered w-full bg-base-200/50 focus:bg-base-100" />
                  </div>
                </div>
                <div>
                  <label className="label"><span className="label-text font-semibold">Description (Markdown Supported) *</span></label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows={10} className="textarea textarea-bordered w-full bg-base-200/50 focus:bg-base-100 font-mono text-sm"></textarea>
                </div>
              </div>
            )}

            {/* DETAILS TAB (EXAMPLES & CONSTRAINTS) */}
            {activeTab === 'details' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Examples</h3>
                    <button type="button" onClick={() => addArrayItem('examples', { input: '', output: '', explanation: '' })} className="btn btn-sm btn-outline btn-primary gap-1"><Plus size={16}/> Add Example</button>
                  </div>
                  <div className="space-y-4">
                    {formData.examples.map((ex, idx) => (
                      <div key={idx} className="p-4 bg-base-200/30 rounded-xl border border-base-content/10 relative group">
                        <button type="button" onClick={() => removeArrayItem('examples', idx)} className="btn btn-sm btn-circle btn-ghost text-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                        <div className="grid grid-cols-2 gap-4 mb-2 pr-8">
                          <div>
                            <label className="text-xs font-semibold text-base-content/70">Input</label>
                            <input type="text" value={ex.input} onChange={(e) => handleArrayChange('examples', idx, 'input', e.target.value)} className="input input-sm input-bordered w-full font-mono text-sm" placeholder="nums = [1,2,3]" />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-base-content/70">Output</label>
                            <input type="text" value={ex.output} onChange={(e) => handleArrayChange('examples', idx, 'output', e.target.value)} className="input input-sm input-bordered w-full font-mono text-sm" placeholder="6" />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-base-content/70">Explanation (Optional)</label>
                          <input type="text" value={ex.explanation} onChange={(e) => handleArrayChange('examples', idx, 'explanation', e.target.value)} className="input input-sm input-bordered w-full text-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divider"></div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Constraints</h3>
                    <button type="button" onClick={() => addArrayItem('constraints', '')} className="btn btn-sm btn-outline btn-primary gap-1"><Plus size={16}/> Add Constraint</button>
                  </div>
                  <div className="space-y-2">
                    {formData.constraints.map((c, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input type="text" value={c} onChange={(e) => handleArrayChange('constraints', idx, null, e.target.value)} className="input input-sm input-bordered flex-1 font-mono text-sm" placeholder="1 <= nums.length <= 10^4" />
                        <button type="button" onClick={() => removeArrayItem('constraints', idx)} className="btn btn-sm btn-square btn-ghost text-error"><Trash2 size={16}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TEST CASES TAB */}
            {activeTab === 'testcases' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Execution Test Cases</h3>
                  <button type="button" onClick={() => addArrayItem('testCases', { input: '', expectedOutput: '', isHidden: false })} className="btn btn-sm btn-outline btn-primary gap-1"><Plus size={16}/> Add Test Case</button>
                </div>
                <div className="space-y-4">
                  {formData.testCases.map((tc, idx) => (
                    <div key={idx} className="p-4 bg-base-200/30 rounded-xl border border-base-content/10 relative group">
                      <button type="button" onClick={() => removeArrayItem('testCases', idx)} className="btn btn-sm btn-circle btn-ghost text-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                      <div className="grid grid-cols-2 gap-4 mb-2 pr-8">
                        <div>
                          <label className="text-xs font-semibold text-base-content/70">Input</label>
                          <textarea value={tc.input} onChange={(e) => handleArrayChange('testCases', idx, 'input', e.target.value)} rows={3} className="textarea textarea-bordered w-full font-mono text-sm p-2" placeholder="1 2 3"></textarea>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-base-content/70">Expected Output</label>
                          <textarea value={tc.expectedOutput} onChange={(e) => handleArrayChange('testCases', idx, 'expectedOutput', e.target.value)} rows={3} className="textarea textarea-bordered w-full font-mono text-sm p-2" placeholder="6"></textarea>
                        </div>
                      </div>
                      <label className="cursor-pointer label justify-start gap-2">
                        <input type="checkbox" checked={tc.isHidden} onChange={(e) => handleArrayChange('testCases', idx, 'isHidden', e.target.checked)} className="checkbox checkbox-sm" />
                        <span className="label-text">Hidden during submission?</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CODE TAB */}
            {activeTab === 'code' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="font-bold text-lg">Starter Code Templates</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label"><span className="label-text font-semibold text-blue-500">C++</span></label>
                    <textarea value={formData.starterCode.cpp} onChange={(e) => handleStarterCodeChange('cpp', e.target.value)} rows={5} className="textarea textarea-bordered w-full bg-base-200/50 font-mono text-sm" placeholder="class Solution {\npublic:\n    ...\n};"></textarea>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold text-yellow-500">JavaScript</span></label>
                    <textarea value={formData.starterCode.javascript} onChange={(e) => handleStarterCodeChange('javascript', e.target.value)} rows={5} className="textarea textarea-bordered w-full bg-base-200/50 font-mono text-sm" placeholder="/**\n * @param {number[]} nums\n * @return {number}\n */\nvar ..."></textarea>
                  </div>
                  <div>
                    <label className="label"><span className="label-text font-semibold text-orange-500">Java</span></label>
                    <textarea value={formData.starterCode.java} onChange={(e) => handleStarterCodeChange('java', e.target.value)} rows={5} className="textarea textarea-bordered w-full bg-base-200/50 font-mono text-sm" placeholder="class Solution {\n    public ...\n}"></textarea>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer is present here */}
        <div className="p-4 border-t border-base-content/10 bg-base-200/50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="submit" form="problem-form" disabled={loading} className="btn btn-primary shadow-lg shadow-primary/30">
            {loading ? <span className="loading loading-spinner loading-sm"></span> : <Save size={18} />}
            {problem ? 'Save Changes' : 'Create Problem'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemForm;
