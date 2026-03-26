'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCamera, FiX, FiCheck } from 'react-icons/fi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';
import { supabase } from '../../lib/supabase';

export default function KYCIdentityPage() {
  const router = useRouter();
  const [idType, setIdType] = useState<'aadhaar' | 'pan' | 'license'>('aadhaar');
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (
    type: 'front' | 'back' | 'selfie',
    file: File
  ) => {
    const preview = URL.createObjectURL(file);
    if (type === 'front') {
      setIdFrontFile(file);
      setIdFrontPreview(preview);
    } else if (type === 'back') {
      setIdBackFile(file);
      setIdBackPreview(preview);
    } else {
      setSelfieFile(file);
      setSelfiePreview(preview);
    }
  };

  const uploadToStorage = async (file: File, path: string): Promise<string> => {
    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(path);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!idFrontFile || !idBackFile || !selfieFile) {
      setError('Please upload all required images.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please log in again.');

      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadToStorage(idFrontFile, `${user.id}/id_front.${idFrontFile.name.split('.').pop()}`),
        uploadToStorage(idBackFile, `${user.id}/id_back.${idBackFile.name.split('.').pop()}`),
        uploadToStorage(selfieFile, `${user.id}/selfie.${selfieFile.name.split('.').pop()}`),
      ]);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id_type: idType,
          id_front_url: frontUrl,
          id_back_url: backUrl,
          selfie_url: selfieUrl,
          kyc_status: 'pending',
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      router.push('/kyc/qualification');
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents. Please try again.');
      console.error('KYC identity upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const UploadBox = ({
    preview,
    onClear,
    onSelect,
    label,
    capture,
    icon: Icon,
  }: {
    preview: string | null;
    onClear: () => void;
    onSelect: (file: File) => void;
    label: string;
    capture?: 'user' | 'environment';
    icon: typeof FiUpload;
  }) => (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center">
      {preview ? (
        <div className="relative">
          <img src={preview} alt={label} className="w-full h-48 object-contain rounded-lg" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow"
          >
            <FiX size={16} />
          </button>
          <div className="flex items-center justify-center gap-1 mt-2 text-emerald-600 text-sm font-medium">
            <FiCheck size={14} /> Uploaded
          </div>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center gap-2">
          <input
            type="file"
            accept="image/*"
            capture={capture}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])}
          />
          <Icon size={32} className="text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Tap to upload</p>
          <p className="text-xs text-gray-400">{label}</p>
        </label>
      )}
    </div>
  );

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
              <UploadBox
                preview={idFrontPreview}
                label="Front of your ID"
                icon={FiUpload}
                onClear={() => { setIdFrontFile(null); setIdFrontPreview(null); }}
                onSelect={(f) => handleFileSelect('front', f)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Back Side
              </label>
              <UploadBox
                preview={idBackPreview}
                label="Back of your ID"
                icon={FiUpload}
                onClear={() => { setIdBackFile(null); setIdBackPreview(null); }}
                onSelect={(f) => handleFileSelect('back', f)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selfie with ID
              </label>
              <UploadBox
                preview={selfiePreview}
                label="Take a selfie holding your ID"
                icon={FiCamera}
                capture="user"
                onClear={() => { setSelfieFile(null); setSelfiePreview(null); }}
                onSelect={(f) => handleFileSelect('selfie', f)}
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
              disabled={!idFrontFile || !idBackFile || !selfieFile}
            >
              {loading ? 'Uploading Documents...' : 'Continue'}
            </Button>
          </div>
        </Card>
      </div>
    </MobileContainer>
  );
}
