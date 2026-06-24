import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const AuthPage: React.FC = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    region: '',
    district: '',
    village: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.full_name.trim() || !form.email.trim() || !form.password) {
      toast.error('Full name, email, and password are required');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/register', {
        ...form,
        full_name: form.full_name.trim(),
        email: form.email.trim()
      });

      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('role', res.data.user.role);
      toast.success('Registration successful');
      navigate('/farmer/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-primary mb-6">Farmer Registration</h1>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 md:grid-cols-2">
          <input
            name="full_name"
            type="text"
            placeholder="Full name"
            value={form.full_name}
            onChange={handleChange}
            className="md:col-span-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="name"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="email"
          />
          <input
            name="phone"
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="tel"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="md:col-span-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            autoComplete="new-password"
          />
          <input
            name="region"
            type="text"
            placeholder="Region"
            value={form.region}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            name="district"
            type="text"
            placeholder="District"
            value={form.district}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            name="village"
            type="text"
            placeholder="Village"
            value={form.village}
            onChange={handleChange}
            className="md:col-span-2 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/farmer/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
