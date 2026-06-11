'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [booking, setBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const fetchChatData = async () => {
      if (!user?.id || !params.id) return;
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.id)
        .single();
      setBooking(bookingData);
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', params.id)
        .order('created_at', { ascending: true });
      setMessages(msgs || []);
    };
    fetchChatData();

    const channel = supabase
      .channel(`chat:${params.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${params.id}`,
        },
        (payload: any) => {
          setMessages(prev => (prev.find(m => m.id === payload.new.id) ? prev : [...prev, payload.new]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, params.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user?.id || !params.id) return;
    const { data } = await supabase
      .from('messages')
      .insert([{ booking_id: params.id, sender_id: user.id, text: message.trim() }])
      .select();
    if (data && data.length > 0) {
      setMessages(prev => [...prev, data[0]]);
      setMessage('');
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-neutral-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#13191C] text-white flex items-center justify-center active:scale-95"
          >
            <FiArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-[#0F1415] truncate">
              {booking?.user?.name || 'Customer'}
            </h1>
            <p className="text-[11px] text-neutral-500">
              Vehicle {booking?.vehicle_number || 'N/A'}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map(msg => {
            const mine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                    mine
                      ? 'bg-gradient-to-r from-[#34C0CA] to-[#66BD59] text-white rounded-br-md'
                      : 'bg-[#13191C] text-white rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-[10px] mt-0.5 ${mine ? 'text-white/75' : 'text-white/50'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-neutral-100 px-3 py-2.5 bg-white flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Message…"
            className="flex-1 px-4 py-3 bg-neutral-100 rounded-full text-sm text-[#0F1415] placeholder-neutral-400 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-[#34C0CA] to-[#66BD59] text-white flex items-center justify-center active:scale-95 disabled:opacity-50 shadow-md"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </MobileContainer>
  );
}
