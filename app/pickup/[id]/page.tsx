'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FiCamera,
  FiCheck,
  FiX,
  FiDroplet,
  FiActivity,
  FiMapPin,
  FiCheckCircle,
} from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, DarkInput, GradientButton, SectionLabel } from '../../components/ui';
import { supabase } from '../../lib/supabase';

export default function VehiclePickupPage() {
  const router = useRouter();
  const params = useParams();
  const [step, setStep] = useState<'inspection' | 'confirmation' | 'parking'>('inspection');
  const [images, setImages] = useState<Record<string, string>>({});
  const [dents, setDents] = useState<string[]>([]);
  const [fuelLevel, setFuelLevel] = useState(50);
  const [odometer, setOdometer] = useState('');
  const [parkingSlot, setParkingSlot] = useState('');
  const [parkingLocation, setParkingLocation] = useState('');
  const [isParked, setIsParked] = useState(false);

  const imageTypes = [
    { key: 'front', label: 'Front' },
    { key: 'back', label: 'Back' },
    { key: 'left', label: 'Left side' },
    { key: 'right', label: 'Right side' },
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'numberPlate', label: 'Number plate' },
  ];

  const handleImageCapture = (type: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImages(prev => ({ ...prev, [type]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const toggleDent = (area: string) => {
    setDents(prev => (prev.includes(area) ? prev.filter(d => d !== area) : [...prev, area]));
  };

  const allImagesCaptured = imageTypes.every(t => images[t.key]);

  const handleConfirm = async () => {
    await supabase.from('bookings').update({ status: 'valet_enroute_drop' }).eq('id', params.id);
    setStep('parking');
  };

  const handleParkingConfirm = async () => {
    if (parkingSlot && parkingLocation && isParked) {
      await supabase
        .from('bookings')
        .update({
          status: 'parked',
          parking_location: `${parkingLocation} - Slot ${parkingSlot}`,
          parked_at: new Date().toISOString(),
        })
        .eq('id', params.id);
      router.push(`/sessions/${params.id}`);
    }
  };

  if (step === 'confirmation') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4 pb-12">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center mb-4 shadow-lg">
              <FiCheck className="text-white" size={40} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Inspection complete</h1>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs">
              Get the user's OTP to confirm handover.
            </p>
          </div>
          <DarkInput label="User OTP" placeholder="6-digit code" maxLength={6} />
          <GradientButton fullWidth size="lg" onClick={handleConfirm}>
            Confirm handover
          </GradientButton>
        </div>
      </MobileContainer>
    );
  }

  if (step === 'parking') {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4 pb-12">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center mb-3 shadow-lg">
              <FiMapPin className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Confirm parking</h1>
            <p className="text-sm text-neutral-500 mt-1 max-w-xs">
              Add the parking details so the user knows where their car is.
            </p>
          </div>

          <DarkInput
            label="Parking location"
            placeholder="e.g. Downtown parking"
            value={parkingLocation}
            onChange={e => setParkingLocation(e.target.value)}
            leftIcon={<FiMapPin size={18} />}
          />
          <DarkInput
            label="Slot number"
            placeholder="e.g. A-12"
            value={parkingSlot}
            onChange={e => setParkingSlot(e.target.value)}
          />

          <DarkCard onClick={() => setIsParked(!isParked)}>
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center transition shrink-0 ${
                  isParked ? 'bg-[#66BD59]' : 'border-2 border-white/30'
                }`}
              >
                {isParked && <FiCheck className="text-white" size={14} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Vehicle is parked</p>
                <p className="text-[11px] text-white/55">
                  Confirm the vehicle is safely at the location
                </p>
              </div>
            </div>
          </DarkCard>

          <GradientButton
            fullWidth
            size="lg"
            disabled={!parkingSlot || !parkingLocation || !isParked}
            onClick={handleParkingConfirm}
          >
            Confirm parking
          </GradientButton>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-32">
        <div>
          <p className="text-xs text-neutral-500">Step 1</p>
          <h1 className="text-2xl font-extrabold text-[#0F1415]">Vehicle inspection</h1>
        </div>

        <div>
          <SectionLabel>Capture images</SectionLabel>
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
                        onChange={e => e.target.files?.[0] && handleImageCapture(t.key, e.target.files[0])}
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
          <SectionLabel>Existing damage</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {['Front bumper', 'Rear bumper', 'Left door', 'Right door', 'Hood', 'Trunk'].map(area => {
              const active = dents.includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleDent(area)}
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
          {dents.length > 0 && (
            <p className="text-xs text-[#EF4444] font-semibold mt-2">
              {dents.length} area{dents.length === 1 ? '' : 's'} marked
            </p>
          )}
        </div>

        <DarkCard>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/55 mb-2">
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
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-white/55 mb-2">
                Odometer (km)
              </label>
              <div className="flex items-center gap-2">
                <FiActivity className="text-[#34C0CA]" size={18} />
                <input
                  type="text"
                  value={odometer}
                  onChange={e => setOdometer(e.target.value)}
                  placeholder="0"
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white placeholder-white/40 outline-none focus:border-[#34C0CA]"
                />
              </div>
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
            onClick={() => setStep('confirmation')}
          >
            Complete inspection
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
