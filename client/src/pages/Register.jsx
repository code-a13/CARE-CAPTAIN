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
      // We send the 'role' and all data to the backend
      const payload = {
        name,
        phone,
        password,
        role,
        // Send emergency contact ONLY if user, send hasVehicle ONLY if assistant
        ...(role === 'user' ? { emergencyContact } : { hasVehicle })
      };

      const { data } = await axios.post('http://localhost:5000/api/auth/register', payload);

      localStorage.setItem('carecaptain_token', data.token);
      localStorage.setItem('carecaptain_userId', data._id);
      localStorage.setItem('carecaptain_role', data.role); // Save role to browser
      
      // Redirect based on role (Caregivers don't book, they receive bookings!)
      if (data.role === 'assistant') {
        navigate('/caregiver-dashboard'); // We will build this later
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
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 border border-rose-100 my-8">
        
        {/* ROLE SELECTION TABS */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button 
            type="button"
            onClick={() => setRole('user')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center ${role === 'user' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UserCheck size={18} className="mr-2" /> Book Care
          </button>
          <button 
            type="button"
            onClick={() => setRole('assistant')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex justify-center items-center ${role === 'assistant' ? 'bg-white shadow-sm text-rose-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <HeartPulse size={18} className="mr-2" /> Provide Care
          </button>
        </div>
        
        <h1 className="text-2xl font-black text-center text-gray-800 mb-2">
          {role === 'user' ? 'Join as a User' : 'Join as a Caregiver'}
        </h1>
        <p className="text-center text-gray-500 font-medium mb-6 text-sm">
          {role === 'user' ? 'Find trusted help for your loved ones.' : 'Earn by assisting the elderly in your city.'}
        </p>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-center font-bold">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          {/* SHARED FIELDS (Both roles need these) */}
          <div>
            <label className="block text-gray-700 font-bold mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              placeholder="e.g. Rajendran M."
              value={name} onChange={(e) => setName(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Mobile Number</label>
            <input 
              type="tel" 
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              placeholder="10-digit mobile number"
              value={phone} onChange={(e) => setPhone(e.target.value)} required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl outline-none focus:border-rose-500"
              placeholder="Create a strong password"
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
            />
          </div>

          {/* CONDITIONAL FIELDS */}
          {role === 'user' ? (
            // Only show to Elderly Users
            <div>
              <label className="block text-gray-700 font-bold mb-1 flex items-center">
                 Emergency Contact <PhoneCall size={16} className="ml-2 text-rose-500" />
              </label>
              <input 
                type="tel" 
                className="w-full bg-rose-50 border border-rose-200 p-3 rounded-xl outline-none focus:border-rose-500"
                placeholder="Son/Daughter's Number"
                value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} required
              />
            </div>
          ) : (
            // Only show to Caregivers
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-blue-900 font-bold mb-2 flex items-center">
                 Do you have a vehicle? <Bike size={18} className="ml-2 text-blue-600" />
              </label>
              <p className="text-xs text-blue-700 mb-3">
                Caregivers with bikes (like a Splendor Plus BS4) can accept transport bookings and earn higher hourly rates.
              </p>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="vehicle" checked={hasVehicle === true} onChange={() => setHasVehicle(true)} className="w-5 h-5 accent-blue-600" />
                  <span className="font-medium text-gray-700">Yes, I have a vehicle</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="vehicle" checked={hasVehicle === false} onChange={() => setHasVehicle(false)} className="w-5 h-5 accent-blue-600" />
                  <span className="font-medium text-gray-700">No, just help</span>
                </label>
              </div>
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg py-4 rounded-xl shadow-md transition-transform active:scale-95 flex justify-center items-center mt-6 disabled:bg-rose-300"
          >
            {loading ? 'Processing...' : `Sign Up as ${role === 'user' ? 'User' : 'Caregiver'}`} <ArrowRight className="ml-2" />
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-600 font-bold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;