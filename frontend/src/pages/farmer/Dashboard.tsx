import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Leaf,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Smartphone,
  TrendingUp,
  Wallet
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface PriceRow {
  id: number;
  crop: string;
  crop_sw: string | null;
  market: string;
  region: string;
  unit: string;
  currency: string;
  price: number;
  low: number;
  high: number;
  updated: string;
}

interface FarmerDashboardData {
  serverTime: string;
  profile: {
    full_name: string;
    region: string;
    district: string;
    village: string;
    phone: string;
  } | null;
  stats: {
    watchedCrops: number;
    nearbyMarkets: number;
    latestPrices: number;
    alerts: number;
  };
  recommendedPrices: PriceRow[];
  allPrices: PriceRow[];
  weeklyPrices: Array<Record<string, string | number>>;
  subscriptions: Array<{ id: number; crop: string; market: string; notification_type: string }>;
  alerts: Array<{ id: number; title: string; message: string; created_at: string }>;
}

const emptyData: FarmerDashboardData = {
  serverTime: new Date().toISOString(),
  profile: null,
  stats: { watchedCrops: 0, nearbyMarkets: 0, latestPrices: 0, alerts: 0 },
  recommendedPrices: [],
  allPrices: [],
  weeklyPrices: [],
  subscriptions: [],
  alerts: []
};

const FarmerDashboard: React.FC = () => {
  const [data, setData] = useState<FarmerDashboardData>(emptyData);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await api.get('/api/dashboard/farmer');
      setData(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load farmer dashboard');
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = window.setInterval(() => loadDashboard(true), 30000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredPrices = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) {
      return data.allPrices;
    }

    return data.allPrices.filter((item) =>
      [item.crop, item.crop_sw, item.market, item.region].some((field) => String(field || '').toLowerCase().includes(value))
    );
  }, [data.allPrices, query]);

  const bestPrice = useMemo(() => {
    return data.allPrices.reduce<PriceRow | null>((best, item) => {
      if (!best || item.price > best.price) {
        return item;
      }
      return best;
    }, null);
  }, [data.allPrices]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Farmer Dashboard</h1>
              <p className="text-sm text-gray-500">
                {data.profile?.full_name || 'Farmer'}{data.profile?.region ? `, ${data.profile.region}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => loadDashboard()} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Watched Crops" value={data.stats.watchedCrops} icon={<Leaf className="h-5 w-5" />} />
          <StatCard label="Nearby Markets" value={data.stats.nearbyMarkets} icon={<MapPin className="h-5 w-5" />} />
          <StatCard label="Latest Prices" value={data.stats.latestPrices} icon={<TrendingUp className="h-5 w-5" />} />
          <StatCard label="Alerts" value={data.stats.alerts} icon={<Bell className="h-5 w-5" />} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Prices Recommended For You</h2>
              <span className="text-xs text-gray-500">Updated {new Date(data.serverTime).toLocaleTimeString()}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {data.recommendedPrices.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{item.crop}</p>
                      <p className="text-sm text-gray-500">{item.market}, {item.region}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-4 text-2xl font-semibold">{item.price.toLocaleString()} {item.currency}</p>
                  <p className="mt-1 text-sm text-gray-500">Range {item.low.toLocaleString()} - {item.high.toLocaleString()} / {item.unit}</p>
                </div>
              ))}
              {data.recommendedPrices.length === 0 && <p className="text-sm text-gray-500">No prices available yet.</p>}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">Best Current Price</h2>
              {bestPrice ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Wallet className="h-5 w-5" /></div>
                    <div>
                      <p className="font-semibold">{bestPrice.crop}</p>
                      <p className="text-sm text-gray-500">{bestPrice.market}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-3xl font-semibold">{bestPrice.price.toLocaleString()} {bestPrice.currency}/{bestPrice.unit}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No prices available.</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold">SMS/USSD Access</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3"><Smartphone className="h-4 w-4 text-primary" /> USSD market lookup is ready for provider integration.</div>
                <div className="flex items-center gap-3"><Bell className="h-4 w-4 text-secondary" /> SMS alerts use your watched crops.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Market Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.weeklyPrices}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="maize" stroke="#16A34A" strokeWidth={2} />
                  <Line type="monotone" dataKey="rice" stroke="#F97316" strokeWidth={2} />
                  <Line type="monotone" dataKey="beans" stroke="#2563EB" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Recent Alerts</h2>
            <div className="divide-y divide-gray-100">
              {data.alerts.map((alert) => (
                <div key={alert.id} className="py-3">
                  <p className="font-medium">{alert.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{alert.message}</p>
                </div>
              ))}
              {data.alerts.length === 0 && <p className="text-sm text-gray-500">No alerts yet.</p>}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">All Market Prices</h2>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search crop or market" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>{['Crop', 'Market', 'Region', 'Price', 'Range', 'Updated'].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPrices.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{item.crop}</td>
                    <td className="px-4 py-3">{item.market}</td>
                    <td className="px-4 py-3">{item.region}</td>
                    <td className="px-4 py-3 font-semibold">{item.price.toLocaleString()} {item.currency}/{item.unit}</td>
                    <td className="px-4 py-3">{item.low.toLocaleString()} - {item.high.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(item.updated).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{Number(value).toLocaleString()}</p>
      </div>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
    </div>
  </div>
);

export default FarmerDashboard;
