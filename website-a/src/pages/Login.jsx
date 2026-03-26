import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';

function redirectAfterLogin(role) {
  if (role === 'GOVERNMENT') return '/gov/dashboard';
  if (role === 'PANCHAYAT')  return '/panchayat/dashboard';
  if (role === 'NGO')        return '/ngo/dashboard';
  return '/gov/dashboard';
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/gov/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      // Safe JSON parse — handles empty body or non-JSON responses
      let data = {};
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(`Server returned an unexpected response (${res.status}). Please try again.`);
      }

      if (!res.ok) {
        throw new Error(data.message || `Authentication failed (${res.status})`);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      navigate(redirectAfterLogin(data.user.role));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gov-bg">
      <div className="bg-gov-dark h-8 flex items-center px-6 border-b-2 border-gov-orange">
        <span className="text-white text-xs font-semibold">GOVERNMENT OF INDIA</span>
        <span className="text-gray-300 text-xs ml-4">
          Ministry of Environment, Forest &amp; Climate Change
        </span>
      </div>

      <div className="bg-white border-b-2 border-gov-orange py-4 px-6 flex items-center gap-4">
        <div className="w-16 h-16 bg-gov-navy flex items-center justify-center">
          <span className="text-white text-2xl font-bold">CT</span>
        </div>
        <div>
          <div className="text-gov-navy text-xl font-bold">CarbonTrace</div>
          <div className="text-gray-500 text-sm">National Blue Carbon MRV Registry Portal</div>
          <div className="text-gray-400 text-xs">
            Under MISHTI Mission - Mangrove Initiative for Shoreline Habitats &amp; Tangible Incomes
          </div>
        </div>
      </div>

      <div className="flex justify-center items-start pt-12 px-4 pb-28">
        <div className="w-full max-w-md">
          <div className="gov-card">
            <div className="gov-card-header">
              <span>User Login</span>
            </div>
            <div className="p-6">
              {error && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  <AlertTriangle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gov-border px-3 py-2 text-sm focus:outline-none focus:border-gov-blue bg-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gov-border px-3 py-2 pr-10 text-sm focus:outline-none focus:border-gov-blue bg-white"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gov-navy"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-gov py-2 text-sm disabled:opacity-50">
                  {loading ? 'Authenticating...' : 'Login to Portal'}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 p-4 text-xs">
            <div className="font-bold text-gov-navy mb-2 uppercase tracking-wide">
              Demo Credentials
            </div>
            <table className="w-full">
              <tbody>
                {[
                  ['Government', 'rajesh@gov.in', 'admin123'],
                  ['Panchayat', 'ratnagiri@panch.in', 'panch123'],
                  ['NGO', 'coastal@ngo.in', 'ngo123'],
                ].map(([role, demoEmail, pass]) => (
                  <tr
                    key={role}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      setEmail(demoEmail);
                      setPassword(pass);
                    }}
                  >
                    <td className="py-1 font-semibold text-gov-navy w-24">{role}</td>
                    <td className="py-1 text-gray-600">{demoEmail}</td>
                    <td className="py-1 text-gray-400">{pass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-gray-400 mt-2">Click a row to auto-fill credentials</div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-400">
            This portal is for authorized government officials, NGOs and Gram Panchayats only.
            <br />
            For technical support contact: support@nccr.gov.in
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 w-full bg-gov-dark text-gray-400 text-xs py-2 px-6 flex justify-between border-t-2 border-gov-orange">
        <span>© 2026 CarbonTrace | Government of India</span>
        <span>Best viewed in Chrome/Firefox | Powered by ISRO Bhuvan &amp; Ethereum</span>
      </div>
    </div>
  );
}
