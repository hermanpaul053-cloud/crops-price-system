import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Edit3,
  FileText,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
  X
} from 'lucide-react';
import {
  Bar,
  BarChart,
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

type Tab = 'overview' | 'prices' | 'markets' | 'farmers' | 'messages' | 'reports' | 'settings';

interface PriceRow {
  id: number;
  crop: string;
  market: string;
  region: string;
  unit: string;
  currency: string;
  price: number;
  low: number;
  high: number;
  trend: string;
  status: string;
  updated: string;
}

interface AdminDashboardData {
  serverTime: string;
  stats: {
    activeFarmers: number;
    marketsCovered: number;
    activeCrops: number;
    priceUpdates: number;
    smsDelivered: number;
    ussdSessions: number;
  };
  prices: PriceRow[];
  charts: {
    weeklyPrices: Array<Record<string, string | number>>;
    regionalActivity: Array<{ region: string; updates: number }>;
  };
  markets: Array<{ id: number; name: string; region: string; district: string; status: string }>;
  farmers: Array<{ id: number; name: string; region: string; district: string; village: string; phone: string; joined: string }>;
  auditFeed: Array<{ id: number; action: string; entity_type: string; entity_id: number; created_at: string }>;
}

const emptyData: AdminDashboardData = {
  serverTime: new Date().toISOString(),
  stats: { activeFarmers: 0, marketsCovered: 0, activeCrops: 0, priceUpdates: 0, smsDelivered: 0, ussdSessions: 0 },
  prices: [],
  charts: { weeklyPrices: [], regionalActivity: [] },
  markets: [],
  farmers: [],
  auditFeed: []
};

const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
  { id: 'prices', label: 'Prices', icon: <CircleDollarSign className="h-4 w-4" /> },
  { id: 'markets', label: 'Markets', icon: <MapPin className="h-4 w-4" /> },
  { id: 'farmers', label: 'Farmers', icon: <Users className="h-4 w-4" /> },
  { id: 'messages', label: 'SMS/USSD', icon: <MessageSquare className="h-4 w-4" /> },
  { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> }
];

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData>(emptyData);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [priceForm, setPriceForm] = useState({ crop: '', market: '', region: '', district: '', price: '', unit: 'kg' });
  const navigate = useNavigate();

  const loadDashboard = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const res = await api.get('/api/dashboard/admin');
      setData(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load admin dashboard');
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
      return data.prices;
    }

    return data.prices.filter((item) =>
      [item.crop, item.market, item.region, item.status].some((field) => String(field).toLowerCase().includes(value))
    );
  }, [data.prices, query]);

  const statCards = [
    { label: 'Active Farmers', value: data.stats.activeFarmers, icon: <Users className="h-5 w-5" />, tone: 'text-primary' },
    { label: 'Markets Covered', value: data.stats.marketsCovered, icon: <MapPin className="h-5 w-5" />, tone: 'text-secondary' },
    { label: 'Active Crops', value: data.stats.activeCrops, icon: <Leaf className="h-5 w-5" />, tone: 'text-accent' },
    { label: 'Price Updates', value: data.stats.priceUpdates, icon: <TrendingUp className="h-5 w-5" />, tone: 'text-blue-600' }
  ];

  const submitPrice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await api.post('/api/dashboard/admin/prices', priceForm);
      setPriceForm({ crop: '', market: '', region: '', district: '', price: '', unit: 'kg' });
      toast.success('Price saved');
      loadDashboard(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save price');
    }
  };

  const verifyPrice = async (id: number) => {
    try {
      await api.patch(`/api/dashboard/admin/prices/${id}/verify`);
      toast.success('Price verified');
      loadDashboard(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify price');
    }
  };

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
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-950 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Leaf className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold leading-tight">Crop Market</p>
              <p className="text-xs text-gray-400">Admin site</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${activeTab === tab.id ? 'bg-white text-gray-950' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">Agricultural Market Administration</h1>
                <p className="text-sm text-gray-500">Live data refreshes every 30 seconds.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 sm:inline-flex">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Online
              </span>
              <button onClick={() => loadDashboard()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-4 sm:p-6">
          {activeTab === 'overview' && (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((item) => (
                  <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="mt-2 text-3xl font-semibold">{Number(item.value).toLocaleString()}</p>
                      </div>
                      <div className={`rounded-lg bg-gray-100 p-2 ${item.tone}`}>{item.icon}</div>
                    </div>
                  </div>
                ))}
              </section>
              <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <ChartPanel title="Weekly Price Movement">
                  <LineChart data={data.charts.weeklyPrices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="maize" stroke="#16A34A" strokeWidth={2} />
                    <Line type="monotone" dataKey="rice" stroke="#F97316" strokeWidth={2} />
                    <Line type="monotone" dataKey="beans" stroke="#2563EB" strokeWidth={2} />
                  </LineChart>
                </ChartPanel>
                <ChartPanel title="Regional Updates">
                  <BarChart data={data.charts.regionalActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="region" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="updates" fill="#16A34A" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartPanel>
              </section>
              <ActivityFeed rows={data.auditFeed} />
            </>
          )}

          {activeTab === 'prices' && (
            <section className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Add Live Market Price</h2>
                <form onSubmit={submitPrice} className="grid gap-4 md:grid-cols-6">
                  {(['crop', 'market', 'region', 'district', 'unit'] as const).map((field) => (
                    <input
                      key={field}
                      value={priceForm[field]}
                      onChange={(event) => setPriceForm((current) => ({ ...current, [field]: event.target.value }))}
                      placeholder={field}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={priceForm.price}
                      onChange={(event) => setPriceForm((current) => ({ ...current, price: event.target.value }))}
                      placeholder="TZS"
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </form>
              </div>
              <DataToolbar query={query} setQuery={setQuery} />
              <PriceTable rows={filteredPrices} onVerify={verifyPrice} />
            </section>
          )}

          {activeTab === 'markets' && (
            <SimpleTable title="Market Coverage" headers={['Market', 'Region', 'District', 'Status']} rows={data.markets.map((item) => [item.name, item.region, item.district, item.status])} />
          )}

          {activeTab === 'farmers' && (
            <SimpleTable title="Farmer Accounts" headers={['Name', 'Region', 'District', 'Village', 'Phone', 'Joined']} rows={data.farmers.map((item) => [item.name, item.region, item.district, item.village, item.phone, new Date(item.joined).toLocaleDateString()])} />
          )}

          {activeTab === 'messages' && (
            <section className="grid gap-6 xl:grid-cols-3">
              {[
                { title: 'SMS Gateway', value: data.stats.smsDelivered, detail: 'Delivered messages', icon: <MessageSquare className="h-5 w-5" /> },
                { title: 'USSD Sessions', value: data.stats.ussdSessions, detail: 'Sessions today', icon: <Smartphone className="h-5 w-5" /> },
                { title: 'Farmer Alerts', value: data.stats.priceUpdates, detail: 'Price alerts ready', icon: <Bell className="h-5 w-5" /> }
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="font-semibold">{item.title}</h2>
                    <span className="rounded-lg bg-primary/10 p-2 text-primary">{item.icon}</span>
                  </div>
                  <p className="text-3xl font-semibold">{Number(item.value).toLocaleString()}</p>
                  <p className="mt-2 text-sm text-gray-500">{item.detail}</p>
                </div>
              ))}
            </section>
          )}

          {activeTab === 'reports' && <ReportsPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
};

const ChartPanel: React.FC<{ title: string; children: React.ReactElement }> = ({ title, children }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-semibold">{title}</h2>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const DataToolbar: React.FC<{ query: string; setQuery: (value: string) => void }> = ({ query, setQuery }) => (
  <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
    <h2 className="text-lg font-semibold">Price Verification Queue</h2>
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>
  </div>
);

const PriceTable: React.FC<{ rows: PriceRow[]; onVerify: (id: number) => void }> = ({ rows, onVerify }) => (
  <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
          <tr>{['Crop', 'Market', 'Region', 'Price', 'Range', 'Status', 'Updated', 'Action'].map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{row.crop}</td>
              <td className="px-4 py-3">{row.market}</td>
              <td className="px-4 py-3">{row.region}</td>
              <td className="px-4 py-3 font-semibold">{row.price.toLocaleString()} {row.currency}/{row.unit}</td>
              <td className="px-4 py-3">{row.low.toLocaleString()} - {row.high.toLocaleString()}</td>
              <td className="px-4 py-3"><span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">{row.status}</span></td>
              <td className="px-4 py-3 text-gray-500">{new Date(row.updated).toLocaleString()}</td>
              <td className="px-4 py-3">
                <button onClick={() => onVerify(row.id)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs hover:bg-gray-50">
                  <Edit3 className="h-3.5 w-3.5" />
                  Verify
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SimpleTable: React.FC<{ title: string; headers: string[]; rows: string[][] }> = ({ title, headers, rows }) => (
  <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-100 p-5"><h2 className="text-lg font-semibold">{title}</h2></div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr></thead>
        <tbody className="divide-y divide-gray-100">{rows.map((row) => <tr key={row.join('|')} className="hover:bg-gray-50">{row.map((cell, index) => <td key={`${cell}-${index}`} className="px-4 py-3">{cell || '-'}</td>)}</tr>)}</tbody>
      </table>
    </div>
  </section>
);

const ActivityFeed: React.FC<{ rows: AdminDashboardData['auditFeed'] }> = ({ rows }) => (
  <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
    <div className="divide-y divide-gray-100">
      {rows.length === 0 && <p className="text-sm text-gray-500">No audit events yet.</p>}
      {rows.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-3">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-sm text-gray-700">{item.action} {item.entity_type ? `on ${item.entity_type}` : ''}</span>
          <span className="ml-auto text-xs text-gray-400">{new Date(item.created_at).toLocaleString()}</span>
        </div>
      ))}
    </div>
  </section>
);

const ReportsPanel: React.FC = () => (
  <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-lg font-semibold">Reports</h2>
    {['Daily market prices', 'Farmer registrations', 'SMS delivery summary', 'Regional price trends'].map((report) => (
      <div key={report} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0">
        <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-primary" /><span className="font-medium">{report}</span></div>
        <button className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"><Download className="h-4 w-4" />Export</button>
      </div>
    ))}
  </section>
);

const SettingsPanel: React.FC = () => (
  <section className="grid gap-6 xl:grid-cols-2">
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">System Settings</h2>
      {['Require admin approval for new prices', 'Send farmer SMS alerts', 'Enable USSD market lookup'].map((setting) => (
        <label key={setting} className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0">
          <span className="text-sm font-medium">{setting}</span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-primary" />
        </label>
      ))}
    </div>
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Security</h2>
      <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 text-green-800">
        <ShieldCheck className="mt-0.5 h-5 w-5" />
        <div><p className="font-medium">JWT authentication active</p><p className="mt-1 text-sm">Dashboard APIs are protected by role.</p></div>
      </div>
    </div>
  </section>
);

export default AdminDashboard;
