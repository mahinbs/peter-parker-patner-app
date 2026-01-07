'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSend, FiArrowLeft } from 'react-icons/fi';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello, I\'m at the pickup location', sender: 'user', time: '10:30 AM' },
    { id: '2', text: 'Great! I\'ll be there in 2 minutes', sender: 'partner', time: '10:31 AM' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: message,
        sender: 'partner',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      }]);
      setMessage('');
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
            <h1 className="font-semibold">User Chat</h1>
            <p className="text-xs text-white/80">Vehicle: MH-12-AB-1234</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'partner' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender === 'partner'
                    ? 'gradient-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === 'partner' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
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

