'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiMapPin, FiEdit, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import Card from '../components/Card';
import Button from '../components/Button';
import MobileContainer from '../components/MobileContainer';

interface ParkingLocation {
  id: string;
  name: string;
  address: string;
  totalSlots: number;
  availableSlots: number;
  basePrice: number;
  isActive: boolean;
}

export default function ParkingLocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<ParkingLocation[]>([
    {
      id: '1',
      name: 'Downtown Parking',
      address: '123 Main St, City Center',
      totalSlots: 20,
      availableSlots: 12,
      basePrice: 50,
      isActive: true,
    },
    {
      id: '2',
      name: 'Mall Parking',
      address: '456 Park Ave, Shopping District',
      totalSlots: 15,
      availableSlots: 8,
      basePrice: 60,
      isActive: true,
    },
  ]);

  return (
    <MobileContainer>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Parking Locations
          </h1>
          <Button
            onClick={() => router.push('/parking-locations/new')}
            size="sm"
          >
            <FiPlus size={18} />
            Add Location
          </Button>
        </div>

        {locations.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FiMapPin size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                No parking locations added yet
              </p>
              <Button onClick={() => router.push('/parking-locations/new')}>
                Add Your First Location
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {locations.map((location) => (
              <Card key={location.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">
                          {location.name}
                        </h3>
                        {location.isActive && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <FiMapPin size={14} />
                        {location.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Slots</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {location.availableSlots}/{location.totalSlots} available
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Base Price</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        ₹{location.basePrice}/hour
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => router.push(`/parking-locations/${location.id}`)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <FiEdit size={16} />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setLocations(prev => prev.filter(l => l.id !== location.id));
                      }}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                    >
                      <FiTrash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}

