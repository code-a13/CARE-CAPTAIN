import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { HeartPulse, ArrowRight, UserCheck } from 'lucide-react';

const Login = () => {
  // 1. Add the Role State!
  const [role, setRole] = useState('user'); // Default to elderly user

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 2. Send the role to the backend!
      // REMEMBER: Use your deployed Vercel Env Variable here if pushing to production!
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${API_URL}/api/auth/login`, {
        phone,
        password,
        role // The smart backend needs this!
      });

      localStorage.setItem('carecaptain_token', data.token);
      localStorage.setItem('carecaptain_userId', data._id);
      localStorage.setItem('carecaptain_role', data.role); // Save role for later
      
      // 3. Smart Redirect: Caregivers go to dashboard, Users go to map!
      if (data.role === 'assistant') {
        navigate('/caregiver-dashboard');
      } else {
        navigate('/book');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed! Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Changed to a subtle Blue-to-Indigo gradient for a modern look */
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Softened the shadow and updated border to blue */}
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-blue-100">
        
        {/* ROLE SELECTION TABS */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center ${role === 'user' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserCheck size={18} className="mr-2" /> Book Care
          </button>
          <button 
            type="button"
            onClick={() => setRole('assistant')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center ${role === 'assistant' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <HeartPulse size={18} className="mr-2" /> Caregiver
          </button>
        </div>

        <h1 className="text-3xl font-black text-center text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-center text-slate-500 font-medium mb-8">
          {role === 'user' ? 'Login to book assistance.' : 'Login to view your duties.'}
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-center font-bold">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-700 font-bold mb-2">Phone Number</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center mt-6 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login Securely'} <ArrowRight className="ml-2" />
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 font-medium">
          New to CareCaptain?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;