'use client';

import { useEffect, useState } from 'react';
import { FiHelpCircle, FiMessageCircle, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, GradientButton, DarkInput, EmptyState } from '../components/ui';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'help' | 'ticket' | 'disputes'>('help');
  const [ticketForm, setTicketForm] = useState({ subject: '', category: '', description: '' });
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const faqs = [
    {
      q: 'How do I accept a parking request?',
      a: 'Tap Accept on the dashboard when a new request comes in, then navigate to the pickup.',
    },
    {
      q: 'What documents do I need for KYC?',
      a: 'A government-issued ID (Aadhaar, PAN, or DL), a selfie with the ID, and a driving license for qualification.',
    },
    {
      q: 'How are payouts processed?',
      a: 'Earnings transfer to your bank or UPI within T+2 days after each completed session.',
    },
    {
      q: 'What if there is damage to a vehicle?',
      a: 'Document damage during pickup. If new damage appears at return, report it and contact support.',
    },
  ];

  useEffect(() => {
    const fetchSupportData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      if (activeTab === 'disputes') {
        const { data } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'payment')
          .order('created_at', { ascending: false });
        if (data) setDisputes(data);
      }
      setLoading(false);
    };
    fetchSupportData();
  }, [activeTab, user]);

  const handleTicketSubmit = async () => {
    if (!user?.id || !ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.from('support_tickets').insert({
      user_id: user.id,
      subject: ticketForm.subject,
      category: ticketForm.category,
      description: ticketForm.description,
      status: 'open',
    });
    if (error) setError('Failed to submit ticket.');
    else {
      setTicketForm({ subject: '', category: '', description: '' });
      setActiveTab('help');
    }
    setLoading(false);
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-8">
        <div>
          <p className="text-xs text-neutral-500">Help</p>
          <h1 className="text-2xl font-extrabold text-[#0F1415]">Support & help</h1>
        </div>

        <div className="flex bg-neutral-100 rounded-2xl p-1">
          {(['help', 'ticket', 'disputes'] as const).map(tab => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition capitalize ${
                  active ? 'bg-white text-[#0F1415] shadow-sm' : 'text-neutral-500'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {activeTab === 'help' && (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <DarkCard key={i}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#34C0CA]/15 text-[#34C0CA] flex items-center justify-center shrink-0">
                    <FiHelpCircle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-tight">{faq.q}</p>
                    <p className="text-xs text-white/65 mt-1.5 leading-snug">{faq.a}</p>
                  </div>
                </div>
              </DarkCard>
            ))}
            <DarkCard glow>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center shrink-0">
                  <FiMessageCircle className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">Need more help?</p>
                  <p className="text-[11px] text-white/55">support@valetpartner.com · +91 1800 123 4567</p>
                </div>
              </div>
            </DarkCard>
          </div>
        )}

        {activeTab === 'ticket' && (
          <div className="space-y-3">
            <DarkInput
              label="Subject"
              placeholder="Brief description"
              value={ticketForm.subject}
              onChange={e => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
            />
            <div>
              <label className="block text-sm font-semibold text-[#0F1415] mb-2">Category</label>
              <div className="relative">
                <select
                  value={ticketForm.category}
                  onChange={e => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3.5 pr-10 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-[#0F1415] font-semibold appearance-none outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15"
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical issue</option>
                  <option value="payment">Payment issue</option>
                  <option value="kyc">KYC verification</option>
                  <option value="other">Other</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0F1415] mb-2">Description</label>
              <textarea
                value={ticketForm.description}
                onChange={e => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your issue in detail…"
                rows={6}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-[#0F1415] outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15 resize-none"
              />
            </div>
            {error && (
              <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
            <GradientButton fullWidth size="lg" loading={loading} onClick={handleTicketSubmit}>
              Submit ticket
            </GradientButton>
          </div>
        )}

        {activeTab === 'disputes' && (
          <div className="space-y-3">
            {disputes.length === 0 ? (
              <EmptyState
                icon={<FiAlertCircle size={32} />}
                title="No active disputes"
                description="Disputes you raise will appear here for tracking."
              />
            ) : (
              disputes.map(d => (
                <DarkCard key={d.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{d.subject}</p>
                      <p className="text-[11px] text-white/55 capitalize">{d.category}</p>
                      <p className="text-[10px] text-white/40 mt-1">
                        {new Date(d.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        d.status === 'open'
                          ? 'bg-[#FFB627]/20 text-[#FFB627]'
                          : 'bg-[#66BD59]/20 text-[#66BD59]'
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                </DarkCard>
              ))
            )}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
