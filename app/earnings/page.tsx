'use client';

import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';
import Card from '../components/Card';
import MobileContainer from '../components/MobileContainer';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function EarningsPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sessions: 0,
    average: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      setLoading(true);

      let startDate = new Date();
      if (period === 'today') startDate.setHours(0, 0, 0, 0);
      else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('partner_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
      } else if (data) {
        const total = data.reduce((acc, b) => acc + (Number(b.cost) || 0), 0);
        const sessions = data.length;
        setStats({
          total,
          sessions,
          average: sessions > 0 ? Math.round(total / sessions) : 0
        });
        setTransactions(data.map(b => ({
          id: b.id,
          vehicleNumber: b.vehicle_number,
          duration: b.duration || 'N/A',
          amount: b.cost,
          date: new Date(b.created_at).toLocaleString(),
          status: b.status
        })));
      }
      setLoading(false);
    };

    fetchEarnings();
  }, [user, period]);

  const currentEarnings = stats;
  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Earnings
          </h1>
          <Button variant="outline" size="sm">
            <FiDownload size={18} />
            Export
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${period === p
                  ? 'gradient-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                <FiDollarSign className="text-green-600 dark:text-green-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  ₹{currentEarnings.total.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                <FiTrendingUp className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {currentEarnings.sessions}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Average per Session</span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ₹{currentEarnings.average}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Platform Commission (10%)</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                -₹{Math.round(currentEarnings.total * 0.1)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Net Earnings</span>
              <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                ₹{Math.round(currentEarnings.total * 0.9).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Transactions */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
            Recent Transactions
          </h2>
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {transaction.vehicleNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.duration} • {transaction.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                      +₹{transaction.amount}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full">
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Payout Info */}
        <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-teal-600 dark:text-teal-400" size={18} />
              <p className="font-semibold text-teal-900 dark:text-teal-100">
                Next Payout
              </p>
            </div>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              ₹{Math.round(currentEarnings.total * 0.9).toLocaleString()} will be transferred in 2 days
            </p>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

