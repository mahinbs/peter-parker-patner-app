'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useEffect, useRef } from 'react';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore(); // Get current user from store
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]); // Initialize with empty array
  const [booking, setBooking] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatData = async () => {
      if (!user?.id || !params.id) return;

      // 1. Fetch booking to get the other participant (user_id)
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', params.id)
        .single();

      if (bookingError) {
        console.error('Error fetching booking:', bookingError);
        return;
      }
      setBooking(bookingData);

      // 2. Fetch existing messages for this booking
      const { data: msgs, error: msgsError } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', params.id)
        .order('created_at', { ascending: true });

      if (msgsError) {
        console.error('Error fetching messages:', msgsError);
      } else {
        setMessages(msgs || []);
      }
    };

    fetchChatData();

    // Subscribe to new messages for this specific booking
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
        (payload) => {
          setMessages((prev) => {
            // Avoid duplicate messages if the sender already added it locally
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
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
    if (message.trim() && user?.id && params.id) {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            booking_id: params.id,
            sender_id: user.id,
            text: message.trim(),
          },
        ])
        .select();

      if (error) {
        console.error('Error sending message:', error);
      } else if (data && data.length > 0) {
        setMessages((prev) => [...prev, data[0]]);
        setMessage('');
      }
    }
  };

  return (
    <MobileContainer>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 gradient-primary text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="font-semibold">{booking?.user?.name || 'User Chat'}</h1>
            <p className="text-xs text-white/80">Vehicle: {booking?.vehicle_number || 'N/A'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender_id === user?.id
                  ? 'gradient-primary text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-white/70' : 'text-gray-500'
                  }`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleSend}
              className="p-3 gradient-primary text-white rounded-xl"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}

