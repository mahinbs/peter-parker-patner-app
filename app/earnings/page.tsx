'use client';

import { useEffect, useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiCalendar, FiDownload, FiX } from 'react-icons/fi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, GradientButton, EmptyState } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

type Period = 'today' | 'week' | 'month';

export default function EarningsPage() {
  const [period, setPeriod] = useState<Period>('today');

  const { user } = useAuthStore();
  const [, setLoading] = useState(true);
  const [wallet, setWallet] = useState<{ id: string; balance: number } | null>(null);
  const [stats, setStats] = useState({ total: 0, sessions: 0, average: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      const { data: walletData } = await supabase
        .from('wallets')
        .select('id, balance')
        .eq('user_id', user.id)
        .single();
      if (walletData) setWallet({ id: walletData.id, balance: Number(walletData.balance) });

      const startDate = new Date();
      if (period === 'today') startDate.setHours(0, 0, 0, 0);
      else if (period === 'week') startDate.setDate(startDate.getDate() - 7);
      else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);

      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('partner_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      const { data: walletTx } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', walletData?.id)
        .order('created_at', { ascending: false });

      if (bookings) {
        const total = bookings.reduce((acc: number, b: any) => acc + (Number(b.cost) || 0), 0);
        const sessions = bookings.length;
        setStats({ total, sessions, average: sessions > 0 ? Math.round(total / sessions) : 0 });

        const combined = [
          ...bookings.map((b: any) => ({
            id: b.id,
            type: 'credit',
            title: b.vehicle_number || 'Valet service',
            subtitle: `${b.duration || 'Session'} • ${new Date(b.created_at).toLocaleDateString()}`,
            amount: b.cost,
            date: new Date(b.created_at),
            status: 'completed',
          })),
          ...(walletTx || [])
            .filter((tx: any) => tx.type === 'debit')
            .map((tx: any) => ({
              id: tx.id,
              type: 'debit',
              title: 'Withdrawal',
              subtitle: new Date(tx.created_at).toLocaleString(),
              amount: tx.amount,
              date: new Date(tx.created_at),
              status: tx.status,
            })),
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        setTransactions(combined);
      }
      setLoading(false);
    };
    fetchData();
  }, [user, period]);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!wallet || isNaN(amount) || amount <= 0 || amount > wallet.balance) return;
    setIsWithdrawing(true);
    try {
      await supabase.from('wallet_transactions').insert({
        wallet_id: wallet.id,
        amount,
        type: 'debit',
        status: 'completed',
        description: 'Withdrawal to bank account',
      });
      await supabase.from('wallets').update({ balance: wallet.balance - amount }).eq('id', wallet.id);
      setWallet(prev => (prev ? { ...prev, balance: prev.balance - amount } : null));
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setPeriod(period);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const platformFee = Math.round(stats.total * 0.1);
  const netEarnings = Math.round(stats.total * 0.9);

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-8">
        {/* Wallet hero */}
        <DarkCard glow noPadding>
          <div className="relative p-5">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-[#34C0CA]/30 to-[#66BD59]/30 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs text-white/55 uppercase tracking-wider">Available balance</p>
              <p className="text-4xl font-extrabold mt-1 tracking-tight">
                ₹{wallet?.balance.toLocaleString() ?? '0'}
              </p>
              <div className="mt-5 flex items-center gap-2">
                <GradientButton
                  size="sm"
                  disabled={!wallet || wallet.balance <= 0}
                  onClick={() => setIsWithdrawModalOpen(true)}
                >
                  Withdraw
                </GradientButton>
                <button
                  className="px-3 py-2 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 active:scale-95"
                >
                  <FiDownload size={14} /> Export
                </button>
              </div>
            </div>
          </div>
        </DarkCard>

        {/* Period selector */}
        <div className="flex gap-2 bg-neutral-100 rounded-2xl p-1">
          {(['today', 'week', 'month'] as const).map(p => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition capitalize ${
                  active ? 'bg-white text-[#0F1415] shadow-sm' : 'text-neutral-500'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <DarkCard className="!p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-[#66BD59]/15 text-[#66BD59] flex items-center justify-center">
                <FiDollarSign size={16} />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Total earnings</p>
            </div>
            <p className="text-xl font-extrabold">₹{stats.total.toLocaleString()}</p>
          </DarkCard>
          <DarkCard className="!p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-9 h-9 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center">
                <FiTrendingUp size={16} />
              </div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">Sessions</p>
            </div>
            <p className="text-xl font-extrabold">{stats.sessions}</p>
          </DarkCard>
        </div>

        {/* Breakdown */}
        <DarkCard>
          <p className="text-[10px] uppercase font-bold tracking-wider text-white/55 mb-2">Breakdown</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-white/65">Average per session</span>
              <span className="font-semibold">₹{stats.average}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/65">Platform commission (10%)</span>
              <span className="font-semibold text-[#EF4444]">−₹{platformFee}</span>
            </div>
          </div>
          <div className="border-t border-white/10 my-3" />
          <div className="flex justify-between items-baseline">
            <span className="font-bold">Net earnings</span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-[#34C0CA] to-[#66BD59] bg-clip-text text-transparent">
              ₹{netEarnings.toLocaleString()}
            </span>
          </div>
        </DarkCard>

        {/* Transactions */}
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-1 mb-2">
            Recent transactions
          </p>
          {transactions.length === 0 ? (
            <EmptyState
              icon={<FiDollarSign size={32} />}
              title="No transactions yet"
              description="Earnings and payouts in this period will show up here."
            />
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 12).map(tx => (
                <DarkCard key={tx.id} className="!p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit'
                          ? 'bg-[#66BD59]/15 text-[#66BD59]'
                          : 'bg-[#EF4444]/15 text-[#EF4444]'
                      }`}
                    >
                      {tx.type === 'credit' ? <FiDollarSign size={16} /> : <FiTrendingUp size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{tx.title}</p>
                      <p className="text-[11px] text-white/55 mt-0.5">{tx.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-bold ${
                          tx.type === 'credit' ? 'text-[#66BD59]' : 'text-[#EF4444]'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '−'}₹{tx.amount}
                      </p>
                      <p className="text-[10px] text-white/40 capitalize mt-0.5">{tx.status}</p>
                    </div>
                  </div>
                </DarkCard>
              ))}
            </div>
          )}
        </div>

        {/* Next payout */}
        <DarkCard glow>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shrink-0">
              <FiCalendar className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Next payout</p>
              <p className="text-[11px] text-white/55">
                ₹{netEarnings.toLocaleString()} transferred in 2 days
              </p>
            </div>
          </div>
        </DarkCard>
      </div>

      {/* Withdraw modal */}
      {isWithdrawModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          onClick={() => setIsWithdrawModalOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-5 pb-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold text-[#0F1415]">Withdraw funds</h3>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-[#0F1415]"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="rounded-2xl bg-[#13191C] text-white p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">
                  Available to withdraw
                </p>
                <p className="text-3xl font-extrabold mt-1">
                  ₹{wallet?.balance.toLocaleString() ?? '0'}
                </p>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-[#0F1415] mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-neutral-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl text-xl font-extrabold text-[#0F1415] outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setWithdrawAmount(amt.toString())}
                      className="py-2 rounded-xl bg-neutral-100 text-[#0F1415] text-xs font-bold active:scale-95"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <GradientButton
                  fullWidth
                  size="lg"
                  loading={isWithdrawing}
                  disabled={
                    !withdrawAmount ||
                    Number(withdrawAmount) <= 0 ||
                    Number(withdrawAmount) > (wallet?.balance ?? 0)
                  }
                  onClick={handleWithdraw}
                >
                  Confirm withdrawal
                </GradientButton>
                <p className="text-[10px] text-center text-neutral-500 mt-3 px-4">
                  Funds will be transferred to your registered bank account within 24-48 business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}
