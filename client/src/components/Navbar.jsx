import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut, Settings, Layers, Key, Shield, Menu, X, Plus, Link2,Minimize2} from "lucide-react"; // ⚡ Added Link2 for a clean logo replacement

export default function Navbar() {
  const { user, logout, workspaces, activeWorkspace, switchWorkspace } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setProfileOpen(false);
        setWorkspaceOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-white/75 dark:bg-slate-950/75 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 font-sans">
          <div className="flex items-center space-x-6">
            
           <Link to="/" className="flex items-center space-x-2 group">
  <Minimize2 className="h-7 w-7 text-teal-500 fill-teal-500/10 group-hover:scale-110 transition-transform duration-300" />
  <span className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400 dark:to-yellow-400 bg-clip-text text-transparent">
    shrink
  </span>
</Link>
            {user && (
              <div className="relative">
                <button
                  onClick={() => setWorkspaceOpen(!workspaceOpen)}
                  className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-teal-500" />
                  <span>{activeWorkspace ? activeWorkspace.name : "Personal Space"}</span>
                </button>
                {workspaceOpen && (
                  <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
                      Workspaces
                    </div>
                    <button
                      onClick={() => { switchWorkspace(null); setWorkspaceOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer ${!activeWorkspace ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      <span>Personal Space</span>
                    </button>
                    {workspaces.map((ws) => (
                      <button
                        key={ws._id}
                        onClick={() => { switchWorkspace(ws._id); setWorkspaceOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer ${activeWorkspace?._id === ws._id ? 'text-teal-600 dark:text-teal-400 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        <span>{ws.name}</span>
                      </button>
                    ))}
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={() => { setWorkspaceOpen(false); navigate("/dashboard?tab=workspaces"); }}
                      className="w-full text-left px-4 py-2 text-sm text-teal-600 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 font-medium cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Manage Teams</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-2 text-sm font-medium transition">
              Home
            </Link>
            
            {user && (
              <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 px-3 py-2 text-sm font-medium transition">
                Dashboard
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-teal-600" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 focus:outline-none cursor-pointer"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-teal-500 to-lime-500 flex items-center justify-center text-white font-semibold text-sm shadow shadow-teal-500/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === "admin" && (
                      <Link
                        to="/dashboard?tab=admin"
                        onClick={() => setProfileOpen(false)}
                        className="px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 font-medium"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <Link
                      to="/dashboard?tab=settings"
                      onClick={() => setProfileOpen(false)}
                      className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/dashboard?tab=api"
                      onClick={() => setProfileOpen(false)}
                      className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <Key className="h-4 w-4" />
                      <span>Developer APIs</span>
                    </Link>
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-slate-400" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-300 hover:text-teal-600 px-3 py-2 text-sm font-medium transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-teal-500 to-lime-500 hover:from-teal-600 hover:to-lime-600 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-teal-500/25 font-display"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-teal-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                Dashboard
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-900 my-2"></div>
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">
                Switch Workspace
              </div>
              <button
                onClick={() => { switchWorkspace(null); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              >
                Personal Space
              </button>
              {workspaces.map(ws => (
                <button
                  key={ws._id}
                  onClick={() => { switchWorkspace(ws._id); setMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
                >
                  {ws.name}
                </button>
              ))}
              <div className="border-t border-slate-100 dark:border-slate-900 my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-medium text-slate-700 dark:text-slate-300"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center bg-gradient-to-r from-teal-500 to-lime-500 text-white font-medium px-4 py-2.5 rounded-xl text-base shadow"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}