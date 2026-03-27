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
  const [wallet, setWallet] = useState<{ id: string; balance: number } | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    sessions: 0,
    average: 0
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchWalletAndEarnings = async () => {
      if (!user) return;
      setLoading(true);

      // 1. Fetch Wallet Balance
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();
      
      if (walletData) {
        setWallet({ id: walletData.id, balance: Number(walletData.balance) });
      }

      // 2. Fetch Earnings (Bookings)
      let startDate = new Date();
      if (period === 'today') startDate.setHours(0, 0, 0, 0);
      else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('partner_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      // 3. Fetch Transactions (Withdrawals/Credits)
      const { data: walletTx, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletData?.id)
        .order('created_at', { ascending: false });

      if (bookings) {
        const total = bookings.reduce((acc: number, b: any) => acc + (Number(b.cost) || 0), 0);
        const sessions = bookings.length;
        setStats({
          total,
          sessions,
          average: sessions > 0 ? Math.round(total / sessions) : 0
        });

        // Combine bookings and wallet transactions for a unified view
        const combined = [
          ...(bookings.map((b: any) => ({
            id: b.id,
            type: 'credit',
            title: b.vehicle_number || 'Valet Service',
            subtitle: `${b.duration || 'N/A'} • ${new Date(b.created_at).toLocaleDateString()}`,
            amount: b.cost,
            date: new Date(b.created_at),
            status: 'completed'
          }))),
          ...(walletTx || []).filter((tx: any) => tx.type === 'debit').map((tx: any) => ({
            id: tx.id,
            type: 'debit',
            title: 'Withdrawal',
            subtitle: new Date(tx.created_at).toLocaleString(),
            amount: tx.amount,
            date: new Date(tx.created_at),
            status: tx.status
          }))
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransactions(combined);
      }
      setLoading(false);
    };

    fetchWalletAndEarnings();
  }, [user, period]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!wallet || isNaN(amount) || amount <= 0) return;
    if (amount > wallet.balance) {
      alert('Insufficient balance');
      return;
    }

    setIsWithdrawing(true);
    try {
      // 1. Create Transaction Record
      const { data: tx, error: txError } = await supabase
        .from('wallet_transactions')
        .insert({
          wallet_id: wallet.id,
          amount: amount,
          type: 'debit',
          status: 'completed', // For mock demo, we complete it immediately
          description: 'Withdrawal to bank account'
        })
        .select()
        .single();

      if (txError) throw txError;

      // 2. Update Wallet Balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: wallet.balance - amount })
        .eq('id', wallet.id);

      if (walletError) throw walletError;

      // 3. Success
      setWallet((prev: any) => prev ? { ...prev, balance: prev.balance - (amount || 0) } : null);
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      // Refresh transactions
      setPeriod(period); 
    } catch (err: any) {
      alert('Withdrawal failed: ' + err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const currentEarnings = stats;
  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Earnings
          </h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsWithdrawModalOpen(true)}
              variant="primary" 
              size="sm"
              disabled={!wallet || wallet.balance <= 0}
            >
              Withdraw
            </Button>
            <Button variant="outline" size="sm">
              <FiDownload size={18} />
              Export
            </Button>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-[#34C0CA] to-[#66BD59] text-white border-none shadow-lg">
          <div className="space-y-1">
            <p className="text-white/80 text-sm font-medium">Available Balance</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-bold">
                ₹{wallet?.balance.toLocaleString() ?? '0'}
              </h2>
              <div className="bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm">
                INR
              </div>
            </div>
          </div>
        </Card>

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
            {transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <Card key={tx.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {tx.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tx.subtitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-teal-600' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                        tx.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                No transactions found for this period
              </div>
            )}
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

      {/* Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsWithdrawModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-300">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Withdraw Funds</h3>
                <button 
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <FiTrendingUp className="rotate-45" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{wallet?.balance.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount to Withdraw</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-[#66BD59] rounded-2xl outline-none font-bold text-lg transition-all"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {[500, 1000, 2000, 5000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(amt.toString())}
                        className="flex-1 py-2 text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleWithdraw}
                    fullWidth
                    disabled={isWithdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (wallet?.balance ?? 0)}
                  >
                    {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                  </Button>
                  <p className="text-[10px] text-center text-gray-500 mt-4 px-4">
                    Funds will be transferred to your registered bank account within 24-48 business hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}

