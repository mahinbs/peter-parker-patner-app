'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiDollarSign, FiClock, FiArrowLeft } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkInput, GradientButton, SectionLabel } from '../../components/ui';
import { supabase } from '../../lib/supabase';

interface LocationForm {
  name: string;
  address: string;
  landmark: string;
  totalSlots: number;
  basePrice: number;
  minDuration: number;
  extensionPrice: number;
}

export default function NewLocationPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationForm>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['car']);
  const [submitting, setSubmitting] = useState(false);

  const toggleVehicleType = (type: string) => {
    setVehicleTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
  };

  const onSubmit = async (data: LocationForm) => {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('parking_locations').insert({
        partner_id: user.id,
        name: data.name,
        address: data.address,
        total_slots: data.totalSlots,
        available_slots: data.totalSlots,
      });
    }
    setSubmitting(false);
    router.push('/parking-locations');
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-32">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-[#13191C] flex items-center justify-center text-white active:scale-95 shrink-0 shadow-md"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-neutral-500">New</p>
            <h1 className="text-xl font-extrabold text-[#0F1415] leading-tight">Parking location</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-3">
            <SectionLabel>Location details</SectionLabel>
            <DarkInput
              label="Name"
              placeholder="e.g. Downtown parking"
              error={errors.name?.message as string}
              {...(register('name', { required: 'Parking name is required' }) as any)}
            />
            <DarkInput
              label="Address"
              placeholder="Full address"
              leftIcon={<FiMapPin size={18} />}
              error={errors.address?.message as string}
              {...(register('address', { required: 'Address is required' }) as any)}
            />
            <DarkInput
              label="Landmark (optional)"
              placeholder="Nearby landmark"
              {...(register('landmark') as any)}
            />
          </div>

          <div className="space-y-3">
            <SectionLabel>Capacity & pricing</SectionLabel>
            <DarkInput
              label="Total slots"
              type="number"
              placeholder="20"
              error={errors.totalSlots?.message as string}
              {...(register('totalSlots', {
                required: 'Total slots is required',
                min: { value: 1, message: 'Must be at least 1' },
              }) as any)}
            />
            <div className="grid grid-cols-2 gap-3">
              <DarkInput
                label="Base ₹/hr"
                type="number"
                placeholder="50"
                leftIcon={<FiDollarSign size={18} />}
                error={errors.basePrice?.message as string}
                {...(register('basePrice', {
                  required: 'Base price is required',
                  min: { value: 1, message: '₹1 min' },
                }) as any)}
              />
              <DarkInput
                label="Min duration"
                type="number"
                placeholder="1"
                leftIcon={<FiClock size={18} />}
                error={errors.minDuration?.message as string}
                {...(register('minDuration', {
                  required: 'Required',
                  min: { value: 1, message: '1 hour min' },
                }) as any)}
              />
            </div>
            <DarkInput
              label="Extension ₹/hr"
              type="number"
              placeholder="50"
              error={errors.extensionPrice?.message as string}
              {...(register('extensionPrice', { required: 'Required' }) as any)}
            />
          </div>

          <div className="space-y-3">
            <SectionLabel>Vehicles supported</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {['Car', 'SUV', 'Premium'].map(type => {
                const active = vehicleTypes.includes(type.toLowerCase());
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleVehicleType(type.toLowerCase())}
                    className={`py-3 rounded-2xl text-sm font-semibold border transition ${
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
        </form>
      </div>

      <div className="fixed bottom-20 inset-x-0 p-4 z-30">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 rounded-full bg-white border border-neutral-200 text-[#0F1415] font-semibold active:scale-[0.98]"
          >
            Cancel
          </button>
          <GradientButton fullWidth size="md" loading={submitting} onClick={handleSubmit(onSubmit)}>
            Save
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
