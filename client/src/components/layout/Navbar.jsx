import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Code2, User as UserIcon, LogOut, Sun, Moon, TerminalSquare } from 'lucide-react';
import clsx from 'clsx';

const Navbar = () => {
  const { user, logout, loginAsGuest } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="navbar bg-white/70 dark:bg-black/70 backdrop-blur-2xl backdrop-saturate-[180%] sticky top-0 z-50 border-b border-base-content/10 px-4 sm:px-8 transition-colors duration-300">
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.jpg" alt="PrimeCode Logo" className="w-9 h-9 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-xl font-bold tracking-tight">
            Prime<span className="text-primary">Code</span>
          </span>
        </Link>
      </div>
      
      <div className="flex-none gap-4">
        {/* Navigation Links */}
        <div className="hidden sm:flex gap-2">
          <Link to="/problems" className="btn btn-ghost btn-sm text-base-content/80 hover:text-primary">Problems</Link>
          <Link to="/" className="btn btn-ghost btn-sm text-base-content/80 hover:text-primary">Home</Link>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn btn-circle btn-ghost btn-sm"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
        </button>

        {/* User Menu or Login Button */}
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle border border-base-content/20 hover:border-primary transition-colors flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold text-primary leading-none mt-1">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </label>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl glass-panel menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-content/10">
              <li>
                <Link to="/profile" className="hover:text-primary">
                  <UserIcon size={16} /> Profile
                </Link>
              </li>
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="hover:text-secondary">
                    <TerminalSquare size={16} /> Admin Dashboard
                  </Link>
                </li>
              )}
              <div className="divider my-0"></div>
              <li className="text-error">
                <button onClick={handleLogout} className="hover:bg-error/10 hover:text-error">
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={handleGuestLogin} className="btn btn-ghost btn-sm hidden sm:inline-flex">Guest</button>
            <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm bg-gradient-to-r from-emerald-500 to-emerald-600 border-none text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/50">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
