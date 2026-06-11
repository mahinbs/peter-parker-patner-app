'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiCamera, FiCheck, FiX, FiDroplet, FiActivity, FiAlertCircle } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, DarkInput, GradientButton, SectionLabel } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export default function VehicleReturnPage() {
  const router = useRouter();
  const params = useParams();
  const [step, setStep] = useState<'inspection' | 'confirmation'>('inspection');
  const [images, setImages] = useState<Record<string, string>>({});
  const [damageFound, setDamageFound] = useState<string[]>([]);
  const [fuelLevel, setFuelLevel] = useState(45);
  const [odometer, setOdometer] = useState('');
  const [initialFuel] = useState(50);
  const [initialOdometer] = useState('15000');
  const [booking, setBooking] = useState<any>(null);
  const { setStatus } = useAuthStore();

  useEffect(() => {
    const fetchBooking = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', params.id).single();
      if (data) setBooking(data);
    };
    if (params.id) fetchBooking();
  }, [params.id]);

  const imageTypes = [
    { key: 'front', label: 'Front' },
    { key: 'back', label: 'Back' },
    { key: 'left', label: 'Left side' },
    { key: 'right', label: 'Right side' },
  ];

  const handleImageCapture = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setImages(prev => ({ ...prev, [type]: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const toggleDamage = (area: string) => {
    setDamageFound(prev => (prev.includes(area) ? prev.filter(d => d !== area) : [...prev, area]));
  };

  const allImagesCaptured = imageTypes.every(t => images[t.key]);
  const fuelDifference = initialFuel - fuelLevel;

  const handleSubmit = async () => {
    let finalCost = Number(booking?.cost) || 80;
    if (booking?.parked_at) {
      const diffMins = Math.floor((Date.now() - new Date(booking.parked_at).getTime()) / 60000);
      if (diffMins > 30) finalCost += Math.ceil((diffMins - 30) / 10) * 10;
    }
    await supabase
      .from('bookings')
      .update({ status: 'valet_enroute_return', cost: finalCost })
      .eq('id', params.id);
    setStep('confirmation');
  };

  const handleComplete = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    await supabase
      .from('bookings')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', params.id);
    if (user) await setStatus('online');
    router.push('/dashboard');
  };

  if (step === 'confirmation') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4 pb-12">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center mb-4 shadow-lg">
              <FiCheck className="text-white" size={36} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Return inspection complete</h1>
          </div>

          <DarkCard>
            <div className="flex justify-between mb-2">
              <span className="text-white/85 text-sm">Total charges</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-[#34C0CA] to-[#66BD59] bg-clip-text text-transparent">
                ₹{booking?.cost || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/85">
              <span>Fuel difference</span>
              <span className="text-white">
                {fuelDifference > 0 ? `−${fuelDifference}%` : 'No change'}
              </span>
            </div>
          </DarkCard>

          {damageFound.length > 0 && (
            <DarkCard className="border-[#EF4444]/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center shrink-0">
                  <FiAlertCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold">New damage reported</p>
                  <p className="text-[12px] text-white/85 mt-0.5">{damageFound.join(', ')}</p>
                </div>
              </div>
            </DarkCard>
          )}

          <DarkInput label="User OTP" placeholder="6-digit OTP" maxLength={6} />
          <GradientButton fullWidth size="lg" onClick={handleComplete}>
            Complete return
          </GradientButton>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-32">
        <div>
          <p className="text-xs text-neutral-500">Return</p>
          <h1 className="text-2xl font-extrabold text-[#0F1415]">Vehicle return inspection</h1>
        </div>

        <div>
          <SectionLabel>Capture return images</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {imageTypes.map(t => (
              <div key={t.key}>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1.5">
                  {t.label}
                </label>
                <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-neutral-300 bg-neutral-50">
                  {images[t.key] ? (
                    <>
                      <img src={images[t.key]} alt={t.label} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const ni = { ...images };
                          delete ni[t.key];
                          setImages(ni);
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
                      >
                        <FiX className="text-white" size={12} />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={e =>
                          e.target.files?.[0] && handleImageCapture(t.key, e.target.files[0])
                        }
                      />
                      <FiCamera className="text-neutral-400" size={20} />
                      <span className="text-[10px] text-neutral-500 font-semibold">Capture</span>
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionLabel>Damage check</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {['Front bumper', 'Rear bumper', 'Left door', 'Right door', 'Hood', 'Trunk'].map(area => {
              const active = damageFound.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleDamage(area)}
                  className={`py-3 rounded-2xl text-sm font-semibold border transition ${
                    active
                      ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444]'
                      : 'border-neutral-200 bg-neutral-50 text-[#0F1415]'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        <DarkCard>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/85 mb-2">
                Fuel level
              </label>
              <div className="flex items-center gap-3">
                <FiDroplet className="text-[#34C0CA]" size={18} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fuelLevel}
                  onChange={e => setFuelLevel(Number(e.target.value))}
                  className="flex-1 accent-[#66BD59]"
                />
                <span className="text-sm font-bold w-12 text-right">{fuelLevel}%</span>
              </div>
              <p className="text-[10px] text-white/85 mt-1">
                Initial {initialFuel}% · Used {fuelDifference}%
              </p>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/85 mb-2">
                Odometer (km)
              </label>
              <input
                type="text"
                value={odometer}
                onChange={e => setOdometer(e.target.value)}
                placeholder="Current reading"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-[#34C0CA]"
              />
              <p className="text-[10px] text-white/85 mt-1">Initial {initialOdometer} km</p>
            </div>
          </div>
        </DarkCard>
      </div>

      <div className="fixed bottom-20 inset-x-0 p-4 z-30">
        <div className="max-w-md mx-auto">
          <GradientButton
            fullWidth
            size="lg"
            disabled={!allImagesCaptured || !odometer}
            onClick={handleSubmit}
          >
            Complete inspection
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
