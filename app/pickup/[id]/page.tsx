'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiCamera, FiCheck, FiX, FiDroplet, FiActivity } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import MobileContainer from '../../components/MobileContainer';

export default function VehiclePickupPage() {
  const router = useRouter();
  const params = useParams();
  const [step, setStep] = useState<'inspection' | 'confirmation'>('inspection');
  const [images, setImages] = useState<Record<string, string>>({});
  const [dents, setDents] = useState<string[]>([]);
  const [fuelLevel, setFuelLevel] = useState(50);
  const [odometer, setOdometer] = useState('');

  const imageTypes = [
    { key: 'front', label: 'Front' },
    { key: 'back', label: 'Back' },
    { key: 'left', label: 'Left Side' },
    { key: 'right', label: 'Right Side' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'numberPlate', label: 'Number Plate' },
  ];

  const handleImageCapture = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages(prev => ({ ...prev, [type]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const toggleDent = (area: string) => {
    setDents(prev =>
      prev.includes(area)
        ? prev.filter(d => d !== area)
        : [...prev, area]
    );
  };

  const allImagesCaptured = imageTypes.every(type => images[type.key]);

  const handleSubmit = () => {
    setStep('confirmation');
  };

  const handleConfirm = () => {
    router.push('/sessions/123');
  };

  if (step === 'confirmation') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-6">
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex p-6 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <FiCheck className="text-green-600 dark:text-green-400" size={48} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Vehicle Inspection Complete
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                All documentation has been captured. Please get user confirmation.
              </p>
              <div className="space-y-3">
                <Input
                  label="User OTP"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
                <Button onClick={handleConfirm} fullWidth>
                  Confirm Handover
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Vehicle Inspection
        </h1>

        <Card>
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Capture Vehicle Images
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {imageTypes.map((type) => (
                <div key={type.key}>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {type.label}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 aspect-square">
                    {images[type.key] ? (
                      <div className="relative w-full h-full">
                        <img
                          src={images[type.key]}
                          alt={type.label}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            const newImages = { ...images };
                            delete newImages[type.key];
                            setImages(newImages);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center h-full">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) =>
                            e.target.files?.[0] &&
                            handleImageCapture(type.key, e.target.files[0])
                          }
                        />
                        <FiCamera className="text-gray-400 mb-2" size={24} />
                        <span className="text-xs text-gray-500">Tap to capture</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Existing Damage/Dents
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {['Front Bumper', 'Rear Bumper', 'Left Door', 'Right Door', 'Hood', 'Trunk'].map(
                (area) => (
                  <button
                    key={area}
                    onClick={() => toggleDent(area)}
                    className={`p-3 rounded-xl border-2 transition-colors text-sm ${
                      dents.includes(area)
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {area}
                  </button>
                )
              )}
            </div>
            {dents.length > 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {dents.length} area(s) marked with damage
              </p>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuel Level (%)
              </label>
              <div className="flex items-center gap-3">
                <FiDroplet className="text-gray-400" size={20} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-semibold w-12 text-right">{fuelLevel}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Odometer Reading (km)
              </label>
              <div className="flex items-center gap-3">
                <FiActivity className="text-gray-400" size={20} />
                <input
                  type="text"
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  placeholder="Enter odometer reading"
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </Card>

        <Button
          onClick={handleSubmit}
          fullWidth
          disabled={!allImagesCaptured || !odometer}
        >
          Complete Inspection
        </Button>
      </div>
    </MobileContainer>
  );
}

