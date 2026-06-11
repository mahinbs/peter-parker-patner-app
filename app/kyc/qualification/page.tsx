'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUpload, FiX, FiArrowLeft } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { GradientButton } from '../../components/ui';
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
    const blob = await fetch(base64).then(res => res.blob());
    const { error } = await supabase.storage
      .from('kyc-documents')
      .upload(path, blob, { upsert: true, contentType: 'image/png' });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from('kyc-documents').getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found.');
      let frontUrl = '';
      let backUrl = '';
      if (licenseFront) frontUrl = await uploadToStorage(licenseFront, `${user.id}/license_front.png`);
      if (licenseBack) backUrl = await uploadToStorage(licenseBack, `${user.id}/license_back.png`);
      await supabase
        .from('profiles')
        .update({
          experience,
          license_front_url: frontUrl,
          license_back_url: backUrl,
          kyc_status: 'pending',
        })
        .eq('id', user.id);
      router.push('/kyc/status');
    } catch (err: any) {
      setError(err.message || 'Failed to submit KYC.');
    } finally {
      setLoading(false);
    }
  };

  const UploadCell = ({
    img,
    onClear,
    onSelect,
    label,
  }: {
    img: string | null;
    onClear: () => void;
    onSelect: (file: File) => void;
    label: string;
  }) => (
    <div>
      <label className="block text-xs font-semibold text-[#0F1415] mb-2">{label}</label>
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-50">
        {img ? (
          <>
            <img src={img} alt={label} className="w-full h-full object-cover" />
            <button
              onClick={onClear}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center"
            >
              <FiX className="text-white" size={14} />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2 active:bg-neutral-100 transition">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && onSelect(e.target.files[0])}
            />
            <FiUpload size={20} className="text-neutral-400" />
            <span className="text-[11px] text-neutral-500 font-semibold">Upload</span>
          </label>
        )}
      </div>
    </div>
  );

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-12">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-[#13191C] flex items-center justify-center text-white active:scale-95 shrink-0 shadow-md"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-neutral-500">KYC · Step 2 of 2</p>
            <h1 className="text-xl font-extrabold text-[#0F1415] leading-tight">Qualification</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <UploadCell
            img={licenseFront}
            label="License front"
            onClear={() => setLicenseFront(null)}
            onSelect={f => handleFileUpload('front', f)}
          />
          <UploadCell
            img={licenseBack}
            label="License back"
            onClear={() => setLicenseBack(null)}
            onSelect={f => handleFileUpload('back', f)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1415] mb-2">Experience</label>
          <textarea
            value={experience}
            onChange={e => setExperience(e.target.value)}
            placeholder="Briefly describe your vehicle handling experience…"
            rows={4}
            className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm text-[#0F1415] outline-none focus:border-[#34C0CA] focus:ring-4 focus:ring-[#34C0CA]/15 resize-none"
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
          disabled={!licenseFront || !licenseBack || !experience.trim()}
          onClick={handleSubmit}
        >
          Submit for verification
        </GradientButton>
      </div>
    </MobileContainer>
  );
}
