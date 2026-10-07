import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, FileCode, CheckCircle2, Server, Edit, Trash2, Plus } from 'lucide-react';
import ProblemForm from '../components/admin/ProblemForm';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, problemsRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/problems?limit=1000') // Fetch all problems for admin
      ]);
      setStats(statsRes.data.stats);
      setProblems(problemsRes.data.problems);
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (slug) => {
    try {
      // Fetch full problem details (including testcases, starter code, etc.)
      const res = await api.get(`/problems/${slug}`);
      setEditingProblem(res.data.problem);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to fetch problem details', error);
      alert('Failed to load problem details.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      try {
        await api.delete(`/problems/${id}`);
        setProblems(problems.filter(p => p._id !== id));
        // Update stats
        if (stats) setStats({ ...stats, totalProblems: stats.totalProblems - 1 });
      } catch (error) {
        console.error('Failed to delete problem', error);
        alert(error.response?.data?.message || 'Failed to delete problem');
      }
    }
  };

  const handleSaveProblem = (savedProblem) => {
    setShowModal(false);
    setEditingProblem(null);
    fetchData(); // Refresh data to get updated lists and stats
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Server className="text-primary" size={32} />
        Admin Dashboard
      </h1>

      {loading && !problems.length ? (
        <div className="flex justify-center p-12"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-primary/20 text-primary rounded-xl">
                <Users size={32} />
              </div>
              <div>
                <p className="text-base-content/60 text-sm">Total Users</p>
                <h3 className="text-3xl font-bold">{stats?.totalUsers || 0}</h3>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-secondary/20 text-secondary rounded-xl">
                <FileCode size={32} />
              </div>
              <div>
                <p className="text-base-content/60 text-sm">Total Problems</p>
                <h3 className="text-3xl font-bold">{stats?.totalProblems || 0}</h3>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
              <div className="p-4 bg-success/20 text-success rounded-xl">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <p className="text-base-content/60 text-sm">Total Submissions</p>
                <h3 className="text-3xl font-bold">{stats?.totalSubmissions || 0}</h3>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-base-content/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><FileCode size={24} className="text-primary"/> Manage Problems</h2>
              <button 
                onClick={() => { setEditingProblem(null); setShowModal(true); }}
                className="btn btn-primary shadow-lg shadow-primary/20 gap-2"
              >
                <Plus size={18} /> Add New Problem
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="bg-base-200/50 text-base-content">
                    <th>Title</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-base-content/50">No problems found. Create one!</td>
                    </tr>
                  ) : (
                    problems.map((prob) => (
                      <tr key={prob._id}>
                        <td className="font-medium">{prob.title}</td>
                        <td>{prob.category}</td>
                        <td>
                          <span className={`badge badge-sm ${
                            prob.difficulty === 'Basic' ? 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' :
                            prob.difficulty === 'Easy' ? 'badge-success' : 
                            prob.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                          } badge-outline`}>
                            {prob.difficulty}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(prob.slug)}
                              className="btn btn-sm btn-ghost text-info hover:bg-info/10 btn-square"
                              title="Edit Problem"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(prob._id)}
                              className="btn btn-sm btn-ghost text-error hover:bg-error/10 btn-square"
                              title="Delete Problem"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Form Modal */}
      {showModal && (
        <ProblemForm 
          problem={editingProblem} 
          onClose={() => { setShowModal(false); setEditingProblem(null); }} 
          onSave={handleSaveProblem} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
