'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';
import { supabase } from '../../lib/supabase';

export default function KYCQualificationPage() {
  const router = useRouter();
  const [licenseFront, setLicenseFront] = useState<string | null>(null);
  const [licenseBack, setLicenseBack] = useState<string | null>(null);
  const [experience, setExperience] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (type === 'front') setLicenseFront(result);
      else setLicenseBack(result);
    };
    reader.readAsDataURL(file);
  };

  const uploadToStorage = async (base64: string, path: string) => {
    // Convert base64 to Blob
    const base64Data = base64.split(',')[1];
    const blob = await fetch(`data:image/png;base64,${base64Data}`).then(res => res.blob());
    
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(path, blob, {
        upsert: true,
        contentType: 'image/png'
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please log in again.');

      let frontUrl = '';
      let backUrl = '';

      if (licenseFront) {
        frontUrl = await uploadToStorage(licenseFront, `${user.id}/license_front.png`);
      }
      if (licenseBack) {
        backUrl = await uploadToStorage(licenseBack, `${user.id}/license_back.png`);
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          experience,
          license_front_url: frontUrl,
          license_back_url: backUrl,
          kyc_status: 'pending',
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/kyc/status');
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC. Please try again.');
      console.error('KYC submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <FiX size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Valet Qualification
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verify your identity and experience
            </p>
          </div>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  License Front
                </label>
                <div className="relative aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                  {licenseFront ? (
                    <>
                      <img src={licenseFront} alt="Front" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setLicenseFront(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <FiX size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('front', e.target.files[0])}
                      />
                      <FiUpload size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Upload Front</span>
                    </label>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  License Back
                </label>
                <div className="relative aspect-[4/3] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
                  {licenseBack ? (
                    <>
                      <img src={licenseBack} alt="Back" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setLicenseBack(null)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <FiX size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('back', e.target.files[0])}
                      />
                      <FiUpload size={24} className="text-gray-400" />
                      <span className="text-xs text-gray-500">Upload Back</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Experience Details
              </label>
              <textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Briefly describe your vehicle handling experience..."
                className="w-full p-4 bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-teal-500 rounded-xl text-sm transition-all outline-none resize-none"
                rows={4}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <FiX />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              fullWidth
              loading={loading}
              disabled={!licenseFront || !licenseBack || !experience.trim()}
            >
              Submit for Verification
            </Button>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}
