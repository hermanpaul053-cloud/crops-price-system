import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const FarmerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const res = await api.post('/api/auth/refresh-token');

        if (res.data.accessToken && res.data.user?.role === 'farmer') {
          localStorage.setItem('token', res.data.accessToken);
          localStorage.setItem('role', res.data.user.role);
          navigate('/farmer/dashboard');
        }
      } catch {
        localStorage.removeItem('token');
      }
    };

    autoLogin();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', {
        email: email.trim(),
        password,
        remember
      });
      const { accessToken, user } = res.data;

      if (user.role !== 'farmer') {
        toast.error('This account is not a farmer account');
        return;
      }

      localStorage.setItem('token', accessToken);
      localStorage.setItem('role', user.role);
      toast.success('Login successful');
      navigate('/farmer/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.details || error.response?.data?.message || 'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Farmer Login</h1>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="remember" className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/auth" className="text-sm text-primary hover:underline">
              Create account
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FarmerLogin;
