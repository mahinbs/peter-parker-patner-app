'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiCamera, FiX, FiCheck } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, GradientButton } from '../../components/ui';
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

  const handleFileSelect = (type: 'front' | 'back' | 'selfie', file: File) => {
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
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;
    const {
      data: { publicUrl },
    } = supabase.storage.from('kyc-documents').getPublicUrl(path);
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please log in again.');
      const [frontUrl, backUrl, selfieUrl] = await Promise.all([
        uploadToStorage(idFrontFile, `${user.id}/id_front.${idFrontFile.name.split('.').pop()}`),
        uploadToStorage(idBackFile, `${user.id}/id_back.${idBackFile.name.split('.').pop()}`),
        uploadToStorage(selfieFile, `${user.id}/selfie.${selfieFile.name.split('.').pop()}`),
      ]);
      await supabase
        .from('profiles')
        .update({
          id_type: idType,
          id_front_url: frontUrl,
          id_back_url: backUrl,
          selfie_url: selfieUrl,
          kyc_status: 'pending',
        })
        .eq('id', user.id);
      router.push('/kyc/qualification');
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents.');
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
    <div>
      {preview ? (
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
          <img src={preview} alt={label} className="w-full h-44 object-cover" />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 flex items-center justify-center"
          >
            <FiX className="text-white" size={16} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-[#66BD59]/20 text-[#66BD59] text-[10px] font-bold flex items-center gap-1">
            <FiCheck size={10} /> Uploaded
          </div>
        </div>
      ) : (
        <label className="cursor-pointer flex flex-col items-center justify-center gap-2 h-32 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 active:bg-neutral-100 transition">
          <input
            type="file"
            accept="image/*"
            capture={capture}
            className="hidden"
            onChange={e => e.target.files?.[0] && onSelect(e.target.files[0])}
          />
          <Icon size={28} className="text-neutral-400" />
          <p className="text-xs text-neutral-500 font-semibold">Tap to upload</p>
          <p className="text-[10px] text-neutral-400">{label}</p>
        </label>
      )}
    </div>
  );

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-12">
        <div>
          <p className="text-xs text-neutral-500">KYC · Step 1 of 2</p>
          <h1 className="text-2xl font-extrabold text-[#0F1415] tracking-tight">Identity verification</h1>
          <p className="text-sm text-neutral-500 mt-1">Upload your government-issued ID to verify</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1415] mb-2">ID type</label>
          <div className="grid grid-cols-3 gap-2">
            {(['aadhaar', 'pan', 'license'] as const).map(type => {
              const active = idType === type;
              return (
                <button
                  key={type}
                  onClick={() => setIdType(type)}
                  className={`py-3 rounded-2xl text-sm font-semibold border capitalize transition ${
                    active
                      ? 'bg-gradient-to-r from-[#34C0CA] to-[#66BD59] text-white border-transparent'
                      : 'bg-neutral-50 text-[#0F1415] border-neutral-200'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1415] mb-2">ID front</label>
          <UploadBox
            preview={idFrontPreview}
            label="Front of your ID"
            icon={FiUpload}
            onClear={() => {
              setIdFrontFile(null);
              setIdFrontPreview(null);
            }}
            onSelect={f => handleFileSelect('front', f)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1415] mb-2">ID back</label>
          <UploadBox
            preview={idBackPreview}
            label="Back of your ID"
            icon={FiUpload}
            onClear={() => {
              setIdBackFile(null);
              setIdBackPreview(null);
            }}
            onSelect={f => handleFileSelect('back', f)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1415] mb-2">Selfie with ID</label>
          <UploadBox
            preview={selfiePreview}
            label="Take a selfie holding your ID"
            icon={FiCamera}
            capture="user"
            onClear={() => {
              setSelfieFile(null);
              setSelfiePreview(null);
            }}
            onSelect={f => handleFileSelect('selfie', f)}
          />
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <GradientButton
          fullWidth
          size="lg"
          loading={loading}
          disabled={!idFrontFile || !idBackFile || !selfieFile}
          onClick={handleSubmit}
        >
          Continue
        </GradientButton>
      </div>
    </MobileContainer>
  );
}
