import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle2, Circle, Clock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    category: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchProblems();
    fetchCategories();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      let url = `/problems?limit=1000&`;
      if (filters.search) url += `search=${filters.search}&`;
      if (filters.difficulty) url += `difficulty=${filters.difficulty}&`;
      if (filters.category) url += `category=${filters.category}&`;
      
      const res = await api.get(url);
      setProblems(res.data.problems);
    } catch (error) {
      console.error('Failed to fetch problems', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/problems/categories');
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  const isSolved = (problemId) => {
    if (!user || !user.solvedProblems) return false;
    return user.solvedProblems.some(sp => sp.problem._id === problemId || sp.problem === problemId);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Basic':  return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'Easy':   return 'text-success bg-success/10 border-success/20';
      case 'Medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'Hard':   return 'text-error bg-error/10 border-error/20';
      default: return 'text-base-content bg-base-200';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Problem Set</h1>
          <p className="text-base-content/70 mt-1">Master {problems.length} algorithms and data structure problems.</p>
        </div>
        
        {/* Progress Stats */}
        {user && (
          <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-xl">
            <div className="text-sm">
              <span className="text-base-content/70">Solved: </span>
              <span className="font-bold text-primary">{user.solvedProblems?.length || 0}</span>
            </div>
            <div className="w-px h-6 bg-base-content/20"></div>
            <div className="text-sm">
              <span className="text-base-content/70">Streak: </span>
              <span className="font-bold text-orange-500 flex items-center gap-1 inline-flex">
                🔥 {user.streak || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" size={18} />
          <input 
            type="text" 
            placeholder="Search questions, tags..." 
            className="input input-bordered w-full pl-10 bg-base-200/50"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="select select-bordered bg-base-200/50 w-full md:w-auto"
            value={filters.difficulty}
            onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
          >
            <option value="">All Difficulties</option>
            <option value="Basic">Basic</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select 
            className="select select-bordered bg-base-200/50 w-full md:w-auto"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option value="">All Topics</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problem List */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-base-content/10">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200/50 text-base-content border-b border-base-content/10">
                <th className="w-12 text-center">Status</th>
                <th>Title</th>
                <th className="hidden md:table-cell">Acceptance</th>
                <th>Difficulty</th>
                <th className="hidden sm:table-cell">Category</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-base-content/60">
                    No problems found matching your criteria.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => (
                  <tr key={problem._id} className="hover:bg-base-200/30 transition-colors group cursor-pointer" onClick={() => window.location.href=`/problems/${problem.slug}`}>
                    <td className="text-center">
                      {isSolved(problem._id) ? (
                        <CheckCircle2 className="text-success mx-auto" size={20} />
                      ) : (
                        <Circle className="text-base-content/20 group-hover:text-base-content/40 mx-auto" size={20} />
                      )}
                    </td>
                    <td>
                      <Link to={`/problems/${problem.slug}`} className="font-medium hover:text-primary transition-colors">
                        {problem.title}
                      </Link>
                    </td>
                    <td className="hidden md:table-cell text-base-content/70">
                      {problem.acceptance}%
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell">
                      <span className="badge badge-ghost badge-sm">{problem.category}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Problems;
