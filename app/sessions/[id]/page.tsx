'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiClock, FiMapPin, FiCamera, FiCheckCircle } from 'react-icons/fi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MobileContainer from '../../components/MobileContainer';
import { format } from 'date-fns';

export default function ActiveSessionPage() {
  const router = useRouter();
  const params = useParams();
  const [remainingTime, setRemainingTime] = useState(5400); // 90 minutes in seconds
  const [isExtended, setIsExtended] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const handleReturn = () => {
    router.push('/return/123');
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Active Parking Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vehicle: MH-12-AB-1234
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Time</p>
                <p className={`text-2xl font-bold ${
                  remainingTime < 900 ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'
                }`}>
                  {formatTime(remainingTime)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">Slot Number</p>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">A-12</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiClock className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Start Time
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FiMapPin className="text-teal-600 dark:text-teal-400 mt-1" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Parking Location
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Downtown Parking - Slot A-12
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {isExtended && (
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <FiCheckCircle className="text-green-600 dark:text-green-400" size={24} />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Session Extended
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Additional 2 hours added. New end time updated.
                </p>
              </div>
            </div>
          </Card>
        )}

        {remainingTime < 900 && (
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <FiClock className="text-orange-600 dark:text-orange-400" size={24} />
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100">
                  Time Running Low
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Less than 15 minutes remaining. Prepare for vehicle return.
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Session Actions
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => router.push('/sessions/123/photos')}
              variant="outline"
              fullWidth
            >
              <FiCamera size={18} />
              View Parking Photos
            </Button>
            <Button
              onClick={handleReturn}
              fullWidth
            >
              Initiate Vehicle Return
            </Button>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

