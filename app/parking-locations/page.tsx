'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiMapPin, FiEdit, FiTrash2 } from 'react-icons/fi';
import MobileContainer from '../components/MobileContainer';
import { DarkCard, EmptyState } from '../components/ui';
import { supabase } from '../lib/supabase';

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
  const [locations, setLocations] = useState<ParkingLocation[]>([]);

  const fetchLocations = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('parking_locations').select('*').eq('partner_id', user.id);
      if (data) {
        setLocations(
          data.map((l: any) => ({
            id: l.id,
            name: l.name,
            address: l.address,
            totalSlots: l.total_slots,
            availableSlots: l.available_slots,
            basePrice: 50,
            isActive: true,
          })),
        );
      }
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return;
    await supabase.from('parking_locations').delete().eq('id', id);
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  return (
    <MobileContainer>
      <div className="p-4 space-y-4 pb-12">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-neutral-500">Locations</p>
            <h1 className="text-2xl font-extrabold text-[#0F1415]">Parking spots</h1>
          </div>
          <button
            onClick={() => router.push('/parking-locations/new')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center text-white active:scale-95 shadow-md"
          >
            <FiPlus size={20} />
          </button>
        </div>

        {locations.length === 0 ? (
          <EmptyState
            icon={<FiMapPin size={32} />}
            title="No parking locations"
            description="Add your first parking location so you can start accepting bookings."
            actionLabel="Add location"
            onAction={() => router.push('/parking-locations/new')}
          />
        ) : (
          <div className="space-y-3">
            {locations.map(loc => (
              <DarkCard key={loc.id}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#34C0CA] to-[#66BD59] flex items-center justify-center text-white shrink-0">
                    <FiMapPin size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold truncate">{loc.name}</p>
                      {loc.isActive && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#66BD59]/20 text-[#66BD59]">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/55 mt-0.5 line-clamp-2">{loc.address}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10 text-sm">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">
                      Slots
                    </p>
                    <p className="text-sm font-bold">
                      {loc.availableSlots}/{loc.totalSlots}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-white/55">
                      Base price
                    </p>
                    <p className="text-sm font-bold">₹{loc.basePrice}/hr</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push(`/parking-locations/${loc.id}`)}
                    className="flex-1 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <FiEdit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="flex-1 py-2 rounded-xl bg-[#EF4444]/15 text-[#EF4444] text-xs font-semibold flex items-center justify-center gap-1 active:scale-[0.98]"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </div>
              </DarkCard>
            ))}
          </div>
        )}
      </div>
    </MobileContainer>
  );
}
