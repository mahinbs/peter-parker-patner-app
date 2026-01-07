'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCamera, FiCheck } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';

export default function KYCIdentityPage() {
  const router = useRouter();
  const [idType, setIdType] = useState<'aadhaar' | 'pan' | 'license'>('aadhaar');
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  const handleFileUpload = (type: 'front' | 'back' | 'selfie', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'front') setIdFront(result);
      else if (type === 'back') setIdBack(result);
      else setSelfie(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    router.push('/kyc/qualification');
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Identity Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please upload your government-issued ID for verification
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['aadhaar', 'pan', 'license'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setIdType(type)}
                    className={`p-3 rounded-xl border-2 transition-colors ${
                      idType === type
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Front Side
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {idFront ? (
                  <div className="relative">
                    <img src={idFront} alt="ID Front" className="w-full h-48 object-contain rounded-lg" />
                    <button
                      onClick={() => setIdFront(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiCheck size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                    />
                    <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tap to upload</p>
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Back Side
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {idBack ? (
                  <div className="relative">
                    <img src={idBack} alt="ID Back" className="w-full h-48 object-contain rounded-lg" />
                    <button
                      onClick={() => setIdBack(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiCheck size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                    />
                    <FiUpload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tap to upload</p>
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selfie with ID
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {selfie ? (
                  <div className="relative">
                    <img src={selfie} alt="Selfie" className="w-full h-48 object-contain rounded-lg" />
                    <button
                      onClick={() => setSelfie(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <FiCheck size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload('selfie', e.target.files[0])}
                    />
                    <FiCamera size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Take a selfie</p>
                  </label>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              fullWidth
              disabled={!idFront || !idBack || !selfie}
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

