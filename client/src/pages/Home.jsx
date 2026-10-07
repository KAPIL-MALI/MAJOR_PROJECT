import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Brain, Zap, Trophy, ArrowRight, CheckCircle2, Bot } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Brain className="text-primary" size={32} />,
      title: "100+ Curated Problems",
      description: "From basic arrays to advanced dynamic programming and graphs. Hand-picked to prepare you for top tech interviews."
    },
    {
      icon: <Zap className="text-warning" size={32} />,
      title: "Real-time Execution",
      description: "Write, run, and submit code in JavaScript, C++, or Java. Get instant feedback on time and space complexity."
    },
    {
      icon: <Bot className="text-secondary" size={32} />,
      title: "AI-Powered Assistant",
      description: "Stuck on a problem? Our Gemini-powered AI tutor provides intelligent hints without giving away the solution."
    },
    {
      icon: <Trophy className="text-accent" size={32} />,
      title: "Track Progress",
      description: "Visualize your solving patterns, build streaks, and climb the global leaderboard as you master new algorithms."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center py-20 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] opacity-50 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] opacity-50 pointer-events-none"></div>

        <div className="container mx-auto px-4 z-10 text-center">

          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tighter animate-slide-up" style={{ animationDelay: '100ms' }}>
            Master Algorithms.<br />
            <span className="text-gradient">Ace the Interview.</span>
          </h1>
          
          <p className="text-xl md:text-2xl font-medium text-base-content/60 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
            The premium platform for developers to practice data structures and algorithms with an intelligent AI tutor by your side.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            {user ? (
              <Link to="/problems" className="btn btn-primary btn-lg px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                Continue Learning <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg px-8 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-all">
                  Get Started for Free <ArrowRight size={20} />
                </Link>
                <Link to="/problems" className="btn btn-outline btn-lg px-8 rounded-full hover:bg-base-200">
                  Explore Problems
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-base-200/50 border-t border-base-content/5 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">Why PrimeCode?</h2>
            <p className="text-xl font-medium text-base-content/60 max-w-2xl mx-auto">Everything you need to level up your coding skills in one beautiful, distraction-free environment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl flex flex-col items-start text-left h-full">
                <div className="p-3 bg-base-100 rounded-xl mb-4 shadow-sm border border-base-content/5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-base-content/70 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 lg:pr-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">A Premium Coding Experience</h2>
            <p className="text-base-content/60 text-xl font-medium mb-8">
              We've built an editor that feels like your local IDE. Multi-language support, custom themes, vim keybindings, and a sleek dark mode.
            </p>
            <ul className="space-y-4">
              {['Monaco Editor integration', 'Customizable themes (Dark/Light)', 'Instant execution & testing', 'Detailed error reporting'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-base-content/80 font-medium">
                  <CheckCircle2 className="text-success" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
            <div className="glass-panel rounded-2xl border border-base-content/10 shadow-2xl relative overflow-hidden bg-[#1e1e1e]">
              {/* Fake Editor Header */}
              <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
                <div className="mx-auto text-xs text-gray-400 font-mono">twoSum.js</div>
              </div>
              {/* Fake Editor Content */}
              <div className="p-4 font-mono text-sm overflow-hidden text-gray-300">
                <div className="flex"><span className="text-gray-500 mr-4 select-none">1</span><span className="text-pink-400">function</span> <span className="text-blue-400">twoSum</span>(nums, target) {'{'}</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">2</span>  <span className="text-pink-400">const</span> map = <span className="text-pink-400">new</span> <span className="text-green-400">Map</span>();</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">3</span>  <span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-orange-300">0</span>; i &lt; nums.<span className="text-blue-300">length</span>; i++) {'{'}</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">4</span>    <span className="text-pink-400">const</span> comp = target - nums[i];</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">5</span>    <span className="text-pink-400">if</span> (map.<span className="text-blue-300">has</span>(comp)) {'{'}</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">6</span>      <span className="text-pink-400">return</span> [map.<span className="text-blue-300">get</span>(comp), i];</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">7</span>    {'}'}</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">8</span>    map.<span className="text-blue-300">set</span>(nums[i], i);</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">9</span>  {'}'}</div>
                <div className="flex"><span className="text-gray-500 mr-4 select-none">10</span>{'}'}</div>
                <div className="flex animate-pulse mt-2"><span className="w-2 h-4 bg-gray-400 block"></span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
