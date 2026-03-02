import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, ArrowRight, PhoneCall, Bike, UserCheck, HeartPulse } from 'lucide-react';

const Register = () => {
  // 1. The Role State (Crucial for RBAC)
  const [role, setRole] = useState('user'); // Default is elderly user

  // Shared States
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Conditional States
  const [emergencyContact, setEmergencyContact] = useState('');
  const [hasVehicle, setHasVehicle] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send the 'role' and all data to the backend
      const payload = {
        name,
        phone,
        password,
        role,
        // Send emergency contact ONLY if user, send hasVehicle ONLY if assistant
        ...(role === 'user' ? { emergencyContact } : { hasVehicle })
      };

      // VERCEL DEPLOYMENT FIX: Use Env Variable
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${API_URL}/api/auth/register`, payload);

      localStorage.setItem('carecaptain_token', data.token);
      localStorage.setItem('carecaptain_userId', data._id);
      localStorage.setItem('carecaptain_role', data.role); 
      
      // Redirect based on role
      if (data.role === 'assistant') {
        navigate('/caregiver-dashboard'); 
      } else {
        navigate('/book');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed! Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Matched the exact subtle gradient from Login */
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-8 border border-blue-100 my-8">
        
        {/* ROLE SELECTION TABS */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
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
            <HeartPulse size={18} className="mr-2" /> Provide Care
          </button>
        </div>
        
        <h1 className="text-2xl font-black text-center text-slate-800 mb-2">
          {role === 'user' ? 'Join as a User' : 'Join as a Caregiver'}
        </h1>
        <p className="text-center text-slate-500 font-medium mb-6 text-sm">
          {role === 'user' ? 'Find trusted help for your loved ones.' : 'Earn by assisting the elderly in your city.'}
        </p>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-center font-bold">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* SHARED FIELDS */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="e.g. Rajendran M."
              value={name} onChange={(e) => setName(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Mobile Number</label>
            <input 
              type="tel" 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="10-digit mobile number"
              value={phone} onChange={(e) => setPhone(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            />
          </div>

          {/* CONDITIONAL FIELDS */}
          {role === 'user' ? (
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center">
                 Emergency Contact <PhoneCall size={16} className="ml-2 text-blue-500" />
              </label>
              <input 
                type="tel" 
                className="w-full bg-blue-50 border border-blue-200 p-3 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="Son/Daughter's Number"
                value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required
              />
            </div>
          ) : (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <label className="block text-indigo-900 font-bold mb-2 flex items-center">
                 Do you have a vehicle? <Bike size={18} className="ml-2 text-indigo-600" />
              </label>
              {/* Excellent micro-copy mentioning the specific bike model here, makes it feel personalized for the caregiver! */}
              <p className="text-xs text-indigo-700 mb-3">
                Caregivers with bikes (like a Splendor Plus BS4) can accept transport bookings and earn higher hourly rates.
              </p>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="vehicle" checked={hasVehicle === true} onChange={() => setHasVehicle(true)} className="w-5 h-5 accent-indigo-600" />
                  <span className="font-medium text-slate-700">Yes, I have a vehicle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="vehicle" checked={hasVehicle === false} onChange={() => setHasVehicle(false)} className="w-5 h-5 accent-indigo-600" />
                  <span className="font-medium text-slate-700">No, just help</span>
                </label>
              </div>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 flex justify-center items-center mt-6 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Sign Up as ${role === 'user' ? 'User' : 'Caregiver'}`} <ArrowRight className="ml-2" />
          </button>
        </form>

        <p className="text-center mt-6 text-slate-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-blue-800 hover:underline transition-colors">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;