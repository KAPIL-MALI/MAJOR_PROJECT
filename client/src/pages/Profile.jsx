import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Code2, CheckCircle2, XCircle, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import ActivityHeatmap from '../components/ActivityHeatmap';
import BadgesPanel from '../components/BadgesPanel';

const Profile = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/submissions/my');
        setSubmissions(res.data.submissions);
      } catch (error) {
        console.error('Failed to fetch profile data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfileData();
  }, [user]);

  if (!user) return null;

  const basicSolved  = user.solvedProblems?.filter(sp => sp.problem?.difficulty === 'Basic').length  || 0;
  const easySolved   = user.solvedProblems?.filter(sp => sp.problem?.difficulty === 'Easy').length   || 0;
  const mediumSolved = user.solvedProblems?.filter(sp => sp.problem?.difficulty === 'Medium').length || 0;
  const hardSolved   = user.solvedProblems?.filter(sp => sp.problem?.difficulty === 'Hard').length   || 0;
  const totalSolved  = user.solvedProblems?.length || 0;
  const streak       = user.streak || 0;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-6xl space-y-6">

      {/* ① User card + Streak — full width banner */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {/* Top gradient strip */}
        <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-accent" />

        <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-6 p-6">

          {/* Avatar */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center text-3xl font-bold text-white
                            shadow-lg shadow-primary/30 ring-2 ring-primary/40">
              {user.avatar
                ? <img src={user.avatar} className="w-full h-full object-cover rounded-2xl" alt="avatar" />
                : user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold leading-tight">{user.name}</h2>
              <p className="text-xs text-base-content/50 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-base-content/10 self-stretch" />

          {/* Stats row */}
          <div className="flex flex-1 flex-wrap items-center justify-around gap-4">

            {/* Streak */}
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500
                                flex items-center justify-center shadow-lg shadow-orange-500/30
                                ring-2 ring-orange-400/50">
                  <span className="text-2xl">🔥</span>
                </div>
                {streak > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-400
                                   text-[10px] font-black text-white flex items-center justify-center">
                    {streak > 99 ? '99+' : streak}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-orange-400">{streak} day{streak !== 1 ? 's' : ''}</span>
              <span className="text-[10px] text-base-content/40 uppercase tracking-wider">Streak</span>
            </div>

            {/* Rank */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30
                              flex items-center justify-center ring-2 ring-primary/30">
                <span className="text-lg font-black font-mono text-primary">#{user.rank || '?'}</span>
              </div>
              <span className="text-sm font-bold font-mono">{user.rank ? user.rank.toLocaleString() : '—'}</span>
              <span className="text-[10px] text-base-content/40 uppercase tracking-wider">Rank</span>
            </div>

            {/* Total solved */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success/30 to-emerald-600/30
                              flex items-center justify-center ring-2 ring-success/30">
                <span className="text-xl font-black text-success">{totalSolved}</span>
              </div>
              <span className="text-sm font-bold text-success">{totalSolved} solved</span>
              <span className="text-[10px] text-base-content/40 uppercase tracking-wider">Problems</span>
            </div>

            {/* Basic / Easy / Medium / Hard pills */}
            <div className="flex flex-col gap-2">
              {[
                { label: 'Basic',  count: basicSolved,  color: 'text-white',    bg: 'bg-white/10    border-white/20'    },
                { label: 'Easy',   count: easySolved,   color: 'text-success',  bg: 'bg-success/10  border-success/20'  },
                { label: 'Medium', count: mediumSolved, color: 'text-warning',  bg: 'bg-warning/10  border-warning/20'  },
                { label: 'Hard',   count: hardSolved,   color: 'text-error',    bg: 'bg-error/10    border-error/20'    },
              ].map(({ label, count, color, bg }) => (
                <div key={label}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${bg} ${color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {label}: <span className="font-mono font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ② Problem Stats + Recent Submissions — two columns */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Problem Solving Stats */}
        <div className="w-full lg:w-1/3">
          <div className="glass-panel p-6 rounded-2xl h-full">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Code2 size={20} className="text-primary" />
              Problem Solving Stats
            </h3>

            <div className="space-y-4">
              {/* Basic */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white font-medium">Basic</span>
                  <span className="font-mono">{basicSolved} <span className="text-base-content/40">/ 11</span></span>
                </div>
                <progress className="progress w-full bg-white/20" value={basicSolved} max="11" style={{ color: 'white' }} />
              </div>
              {/* Easy */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-success font-medium">Easy</span>
                  <span className="font-mono">{easySolved} <span className="text-base-content/40">/ 32</span></span>
                </div>
                <progress className="progress progress-success w-full bg-success/20" value={easySolved} max="32" />
              </div>
              {/* Medium */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-warning font-medium">Medium</span>
                  <span className="font-mono">{mediumSolved} <span className="text-base-content/40">/ 44</span></span>
                </div>
                <progress className="progress progress-warning w-full bg-warning/20" value={mediumSolved} max="44" />
              </div>
              {/* Hard */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-error font-medium">Hard</span>
                  <span className="font-mono">{hardSolved} <span className="text-base-content/40">/ 14</span></span>
                </div>
                <progress className="progress progress-error w-full bg-error/20" value={hardSolved} max="14" />
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <div
                className="radial-progress text-primary font-bold text-xl"
                style={{ '--value': Math.min(100, (totalSolved / 101) * 100), '--size': '6rem', '--thickness': '0.5rem' }}
                role="progressbar"
              >
                {totalSolved}
                <div className="text-xs text-base-content/50 font-normal absolute mt-8">Solved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div className="w-full lg:w-2/3">
          <div className="glass-panel p-6 rounded-2xl h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity size={24} className="text-secondary" />
                Recent Submissions
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner text-primary" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-10 text-base-content/50">
                  <p>No submissions yet. Go solve some problems!</p>
                  <Link to="/problems" className="btn btn-primary mt-4">Explore Problems</Link>
                </div>
              ) : (
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200/50 border-b border-base-content/10">
                      <th>Time Submitted</th>
                      <th>Problem</th>
                      <th>Status</th>
                      <th>Runtime</th>
                      <th>Language</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub._id} className="hover:bg-base-200/30 transition-colors">
                        <td className="text-sm text-base-content/70">
                          {new Date(sub.createdAt).toLocaleDateString()}{' '}
                          {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <Link
                            to={`/problems/${sub.problem?.slug}`}
                            className="font-medium hover:text-primary transition-colors"
                          >
                            {sub.problem?.title || 'Unknown Problem'}
                          </Link>
                        </td>
                        <td>
                          <span className={`font-semibold flex items-center gap-1
                            ${sub.status === 'Accepted' ? 'text-success' : 'text-error'}`}>
                            {sub.status === 'Accepted' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                            {sub.status === 'Accepted' ? 'Correct Answer' : sub.status}
                          </span>
                        </td>
                        <td className="font-mono text-sm">{sub.runtime}</td>
                        <td><span className="badge badge-sm badge-ghost">{sub.language}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ③ Activity Heatmap — full width */}
      <ActivityHeatmap submissions={submissions} />

      {/* ④ Badges — full width */}
      <BadgesPanel totalSolved={totalSolved} />

    </div>
  );
};

export default Profile;
