'use client';

import { useEffect, useState } from 'react';
import { FiHelpCircle, FiMessageCircle, FiFileText, FiAlertCircle } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import MobileContainer from '../components/MobileContainer';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'help' | 'ticket' | 'disputes'>('help');
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    description: '',
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const faqs = [
    {
      question: 'How do I accept a parking request?',
      answer: 'When you receive a parking request, you can see the details on your dashboard. Tap "Accept" to accept the request and navigate to the pickup location.',
    },
    {
      question: 'What documents do I need for KYC?',
      answer: 'You need a government-issued ID (Aadhaar, PAN, or Driving License), a selfie with your ID, and your driving license for qualification verification.',
    },
    {
      question: 'How are payouts processed?',
      answer: 'Earnings are automatically transferred to your registered bank account or UPI ID within T+2 days (2 days after completion).',
    },
    {
      question: 'What if there is damage to a vehicle?',
      answer: 'Document all existing damage during pickup inspection. If new damage is found during return, report it immediately and contact support for dispute resolution.',
    },
  ];

  useEffect(() => {
    const fetchSupportData = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      if (activeTab === 'ticket') {
        // Fetch user's tickets
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tickets:', error);
          setError('Failed to load tickets.');
        } else {
          setTickets(data);
        }
      } else if (activeTab === 'disputes') {
        // Fetch user's disputes (using support_tickets table with category filter)
        const { data, error } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', 'payment')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching disputes:', error);
          setError('Failed to load disputes.');
        } else {
          setDisputes(data);
        }
      }
      setLoading(false);
    };

    fetchSupportData();
  }, [activeTab, user]);

  const handleTicketSubmit = async () => {
    if (!user?.id) {
      setError('You must be logged in to submit a ticket.');
      return;
    }
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: ticketForm.subject,
        category: ticketForm.category,
        description: ticketForm.description,
        status: 'open',
      });

    if (error) {
      console.error('Error submitting ticket:', error);
      setError('Failed to submit ticket. Please try again.');
    } else {
      alert('Ticket submitted successfully!');
      setTicketForm({ subject: '', category: '', description: '' });
      // Optionally refetch tickets or update state
      setActiveTab('ticket'); // To refresh the list if on ticket tab
    }
    setLoading(false);
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Support & Help
        </h1>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['help', 'ticket', 'disputes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${activeTab === tab
                ? 'gradient-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Help/FAQ */}
        {activeTab === 'help' && (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <FiHelpCircle className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {faq.question}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            <Card className="bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
              <div className="flex items-center gap-3">
                <FiMessageCircle className="text-teal-600 dark:text-teal-400" size={24} />
                <div>
                  <p className="font-semibold text-teal-900 dark:text-teal-100">
                    Need More Help?
                  </p>
                  <p className="text-sm text-teal-700 dark:text-teal-300">
                    Contact us at support@valetpartner.com or call +91-1800-123-4567
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Raise Ticket */}
        {activeTab === 'ticket' && (
          <Card>
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Raise Support Ticket
              </h2>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Input
                label="Subject"
                placeholder="Brief description of your issue"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select category</option>
                  <option value="technical">Technical Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="kyc">KYC Verification</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <Button onClick={handleTicketSubmit} fullWidth loading={loading}>
                Submit Ticket
              </Button>
            </div>
          </Card>
        )}

        {/* Disputes */}
        {activeTab === 'disputes' && (
          <div className="space-y-3">
            {disputes.length === 0 ? (
              <Card>
                <div className="text-center py-8">
                  <FiAlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No active disputes
                  </p>
                </div>
              </Card>
            ) : (
              disputes.map((dispute: any) => (
                <Card key={dispute.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {dispute.subject}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {dispute.category}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${dispute.status === 'open'
                        ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                        : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        }`}>
                        {dispute.status}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" fullWidth>
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            )}
            <Button variant="outline" fullWidth>
              <FiFileText size={18} />
              Report New Dispute
            </Button>
          </div>
        )}
      </div>
    </MobileContainer>
  );
}

