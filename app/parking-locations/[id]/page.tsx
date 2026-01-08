'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiDollarSign, FiClock, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
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
  isActive: boolean;
}

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id as string;
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LocationForm>();
  const [vehicleTypes, setVehicleTypes] = useState<string[]>(['car']);
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading location data
  useEffect(() => {
    // In a real app, fetch location data by ID
    setTimeout(() => {
      setValue('name', 'Downtown Parking');
      setValue('address', '123 Main St, City Center');
      setValue('landmark', 'Near City Mall');
      setValue('totalSlots', 20);
      setValue('basePrice', 50);
      setValue('minDuration', 1);
      setValue('extensionPrice', 50);
      setVehicleTypes(['car', 'suv']);
      setIsActive(true);
      setIsLoading(false);
    }, 500);
  }, [locationId, setValue]);

  const toggleVehicleType = (type: string) => {
    setVehicleTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const onSubmit = (data: LocationForm) => {
    // Handle form submission
    console.log('Updating location:', { ...data, vehicleTypes, isActive });
    router.push('/parking-locations');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
      // Handle deletion
      router.push('/parking-locations');
    }
  };

  if (isLoading) {
    return (
      <MobileContainer>
        <div className="p-4 space-y-4">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading location details...</p>
          </div>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-900 dark:text-gray-100" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Location
          </h1>
        </div>

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

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  Location Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isActive ? 'Location is active and accepting requests' : 'Location is inactive'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isActive 
                    ? 'bg-teal-500' 
                    : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    isActive ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
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
              Save Changes
            </Button>
          </div>

          <Button
            type="button"
            onClick={handleDelete}
            variant="danger"
            fullWidth
            className="flex items-center justify-center gap-2"
          >
            <FiTrash2 size={18} />
            Delete Location
          </Button>
        </form>
      </div>
    </MobileContainer>
  );
}

