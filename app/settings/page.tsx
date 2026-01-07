'use client';

import { useState } from 'react';
import { FiBell, FiGlobe, FiShield, FiCreditCard } from 'react-icons/fi';
import Card from '../components/Card';
import MobileContainer from '../components/MobileContainer';
import Button from '../components/Button';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    newRequests: true,
    extensions: true,
    messages: true,
    payouts: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>

        {/* Notifications */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FiBell className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
          </div>
          <div className="space-y-3">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {key === 'newRequests' && 'Get notified about new parking requests'}
                    {key === 'extensions' && 'Alert when users extend parking time'}
                    {key === 'messages' && 'Notifications for user messages'}
                    {key === 'payouts' && 'Updates about earnings and payouts'}
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification(key as keyof typeof notifications)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Language */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FiGlobe className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Language
            </h3>
          </div>
          <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500">
            <option>English</option>
            <option>Hindi</option>
            <option>Marathi</option>
            <option>Tamil</option>
          </select>
        </Card>

        {/* Payment Methods */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FiCreditCard className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Payment Methods
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Bank Account
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ****1234
                </p>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <Button variant="outline" fullWidth>
              Add UPI ID
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FiShield className="text-teal-600 dark:text-teal-400" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Security
            </h3>
          </div>
          <div className="space-y-2">
            <Button variant="outline" fullWidth>
              Change Password
            </Button>
            <Button variant="outline" fullWidth>
              Two-Factor Authentication
            </Button>
          </div>
        </Card>

        {/* Availability Schedule */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Availability Schedule
          </h3>
          <Button variant="outline" fullWidth>
            Set Operating Hours
          </Button>
        </Card>
      </div>
    </MobileContainer>
  );
}

