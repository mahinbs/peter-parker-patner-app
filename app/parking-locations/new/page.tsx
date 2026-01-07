'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import MobileContainer from '../../components/MobileContainer';

interface LocationForm {
  name: string;
  address: string;
  landmark: string;
  totalSlots: number;
  basePrice: number;
  minDuration: number;
  extensionPrice: number;
  vehicleTypes: string[];
}

export default function NewLocationPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LocationForm>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['car']);

  const toggleVehicleType = (type: string) => {
    setVehicleTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const onSubmit = (data: LocationForm) => {
    // Handle form submission
    router.push('/parking-locations');
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Add Parking Location
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Location Details
            </h2>
            <div className="space-y-4">
              <Input
                label="Parking Name"
                placeholder="e.g., Downtown Parking"
                {...register('name', { required: 'Parking name is required' })}
                error={errors.name?.message}
              />
              <Input
                label="Address"
                icon={<FiMapPin />}
                placeholder="Enter full address"
                {...register('address', { required: 'Address is required' })}
                error={errors.address?.message}
              />
              <Input
                label="Landmark"
                placeholder="Nearby landmark"
                {...register('landmark')}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Capacity & Pricing
            </h2>
            <div className="space-y-4">
              <Input
                label="Total Slots"
                type="number"
                placeholder="20"
                {...register('totalSlots', {
                  required: 'Total slots is required',
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                error={errors.totalSlots?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Base Price/Hour"
                  type="number"
                  icon={<FiDollarSign />}
                  placeholder="50"
                  {...register('basePrice', {
                    required: 'Base price is required',
                    min: { value: 1, message: 'Must be at least ₹1' },
                  })}
                  error={errors.basePrice?.message}
                />
                <Input
                  label="Min Duration (hours)"
                  type="number"
                  icon={<FiClock />}
                  placeholder="1"
                  {...register('minDuration', {
                    required: 'Minimum duration is required',
                    min: { value: 1, message: 'Must be at least 1 hour' },
                  })}
                  error={errors.minDuration?.message}
                />
              </div>
              <Input
                label="Extension Price/Hour"
                type="number"
                placeholder="50"
                {...register('extensionPrice', {
                  required: 'Extension price is required',
                })}
                error={errors.extensionPrice?.message}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Vehicle Types Supported
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {['Car', 'SUV', 'Premium'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleVehicleType(type.toLowerCase())}
                  className={`p-3 rounded-xl border-2 transition-colors ${
                    vehicleTypes.includes(type.toLowerCase())
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <span className="text-sm font-medium">{type}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Location
            </Button>
          </div>
        </form>
      </div>
    </MobileContainer>
  );
}

