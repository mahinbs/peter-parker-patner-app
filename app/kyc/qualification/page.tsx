'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCamera } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';

export default function KYCQualificationPage() {
  const router = useRouter();
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);
  const [experience, setExperience] = useState('');

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'front') setLicenseFront(result);
      else setLicenseBack(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    router.push('/kyc/status');
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Valet Qualification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your driving license to verify your qualification
          </p>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driving License - Front
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {licenseFront ? (
                  <div className="relative">
                    <img src={licenseFront} alt="License Front" className="w-full h-48 object-contain rounded-lg" />
                    <button
                      onClick={() => setLicenseFront(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
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
                Driving License - Back
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
                {licenseBack ? (
                  <div className="relative">
                    <img src={licenseBack} alt="License Back" className="w-full h-48 object-contain rounded-lg" />
                    <button
                      onClick={() => setLicenseBack(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ×
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
                Vehicle Handling Experience (Optional)
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Describe your experience with vehicle handling..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              fullWidth
              disabled={!licenseFront || !licenseBack}
            >
              Submit for Verification
            </Button>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}

