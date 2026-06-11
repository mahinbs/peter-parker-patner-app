'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiDollarSign, FiClock, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import MobileContainer from '../../components/MobileContainer';
import { DarkCard, DarkInput, GradientButton, SectionLabel } from '../../components/ui';
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

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LocationForm>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['car']);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('parking_locations')
        .select('*')
        .eq('id', locationId)
        .single();
      if (data) {
        setValue('name', data.name);
        setValue('address', data.address);
        setValue('totalSlots', data.total_slots);
        setValue('basePrice', 50);
        setValue('minDuration', 1);
        setValue('extensionPrice', 50);
        setIsActive(true);
      }
      setIsLoading(false);
    };
    if (locationId) fetchLocation();
  }, [locationId, setValue]);

  const toggleVehicleType = (type: string) => {
    setVehicleTypes(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
  };

  const onSubmit = async (data: LocationForm) => {
    setSaving(true);
    await supabase
      .from('parking_locations')
      .update({
        name: data.name,
        address: data.address,
        total_slots: data.totalSlots,
        available_slots: data.totalSlots,
      })
      .eq('id', locationId);
    setSaving(false);
    router.push('/parking-locations');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this location?')) return;
    await supabase.from('parking_locations').delete().eq('id', locationId);
    router.push('/parking-locations');
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="p-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-12 h-12 border-4 border-neutral-200 border-t-[#66BD59] rounded-full animate-spin" />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-5 pb-32">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-[#13191C] flex items-center justify-center text-white active:scale-95 shrink-0 shadow-md"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs text-neutral-500">Edit</p>
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
                required: 'Required',
                min: { value: 1, message: 'Min 1' },
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
                  required: 'Required',
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
                  min: { value: 1, message: '1 hr min' },
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

          <DarkCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Location status</p>
                <p className="text-[11px] text-white/55 mt-0.5">
                  {isActive ? 'Active — accepting requests' : 'Inactive'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-7 rounded-full transition relative ${
                  isActive ? 'bg-gradient-to-r from-[#34C0CA] to-[#66BD59]' : 'bg-white/15'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow absolute top-0.5 transition ${
                    isActive ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </DarkCard>

          <button
            type="button"
            onClick={handleDelete}
            className="w-full py-3 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <FiTrash2 size={16} /> Delete location
          </button>
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
          <GradientButton fullWidth size="md" loading={saving} onClick={handleSubmit(onSubmit)}>
            Save
          </GradientButton>
        </div>
      </div>
    </MobileContainer>
  );
}
