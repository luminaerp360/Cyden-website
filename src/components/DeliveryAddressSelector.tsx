import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  Navigation,
  ExternalLink,
  Home,
  Store,
  Briefcase,
  Building2,
} from 'lucide-react';
import { CustomerAddress } from '../types';
import {
  fetchUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setUserDefaultAddress,
} from '../services/addressService';
import { MapLocationPicker } from './MapLocationPicker';

interface DeliveryAddressSelectorProps {
  selectedAddressId?: string;
  onSelectAddress: (address: CustomerAddress) => void;
}

export const DeliveryAddressSelector: React.FC<DeliveryAddressSelectorProps> = ({
  selectedAddressId,
  onSelectAddress,
}) => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const list = await fetchUserAddresses();
      setAddresses(list);

      // Auto-select default address if none is selected yet
      if (list.length > 0 && !selectedAddressId) {
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        onSelectAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Error loading addresses', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSaveAddress = async (addrData: CustomerAddress) => {
    let updatedList: CustomerAddress[];
    if (editingAddress && (editingAddress._id || editingAddress.id)) {
      const id = (editingAddress._id || editingAddress.id) as string;
      updatedList = await updateUserAddress(id, addrData);
    } else {
      updatedList = await addUserAddress(addrData);
    }

    setAddresses(updatedList);

    // If new or updated, select it
    const target =
      updatedList.find(
        (a) => a.street === addrData.street && a.label === addrData.label
      ) ||
      updatedList[updatedList.length - 1] ||
      addrData;

    onSelectAddress(target);
    setIsPickerOpen(false);
    setEditingAddress(null);
  };

  const handleDelete = async (e: React.MouseEvent, addressId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this delivery location?')) {
      return;
    }
    const updated = await deleteUserAddress(addressId);
    setAddresses(updated);
    if (selectedAddressId === addressId && updated.length > 0) {
      onSelectAddress(updated[0]);
    }
  };

  const handleOpenEdit = (e: React.MouseEvent, addr: CustomerAddress) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsPickerOpen(true);
  };

  const getLabelIcon = (lbl?: string) => {
    switch (lbl) {
      case 'Home':
        return <Home className="w-3.5 h-3.5 text-[#1B3E6F]" />;
      case 'Outlet / Bar':
        return <Store className="w-3.5 h-3.5 text-[#3AA88C]" />;
      case 'Office':
        return <Briefcase className="w-3.5 h-3.5 text-[#F2A93B]" />;
      case 'Depot':
        return <Building2 className="w-3.5 h-3.5 text-neutral-600" />;
      default:
        return <MapPin className="w-3.5 h-3.5 text-[#3AA88C]" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          Saved Delivery Locations
        </label>
        <button
          type="button"
          onClick={() => {
            setEditingAddress(null);
            setIsPickerOpen(true);
          }}
          className="text-xs font-bold text-[#1B3E6F] hover:text-[#3AA88C] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Pin New on Map</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-neutral-400 animate-pulse">
          Loading saved locations...
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/60 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-neutral-200/60 text-[#1B3E6F] flex items-center justify-center mx-auto">
            <Navigation className="w-5 h-5 text-[#3AA88C]" />
          </div>
          <p className="text-xs font-bold text-neutral-700">
            No delivery locations saved yet
          </p>
          <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
            Drop an exact pin on our interactive map so dispatch riders and drivers navigate straight to your gate.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingAddress(null);
              setIsPickerOpen(true);
            }}
            className="mt-1 px-4 py-2 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#3AA88C]" />
            <span>Pin Location on Map</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id || '';
            const isSelected = selectedAddressId === addrId;

            return (
              <div
                key={addrId}
                onClick={() => onSelectAddress(addr)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer relative text-left flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1B3E6F] bg-blue-50/40 ring-2 ring-[#1B3E6F]/10 shadow-xs'
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-neutral-100">
                        {getLabelIcon(addr.label)}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {addr.label || 'Delivery Spot'}
                      </span>
                      {addr.isDefault && (
                        <span className="bg-[#3AA88C]/15 text-[#2C856E] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-[#1B3E6F]" />
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(e, addr)}
                        className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                        title="Edit location"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, addrId)}
                        className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                        title="Delete location"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-semibold line-clamp-1">
                    {addr.street}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  {addr.building && (
                    <p className="text-[10px] text-slate-400 line-clamp-1">
                      Building: {addr.building}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                  {addr.lat && addr.lng ? (
                    <span className="font-mono text-[#3AA88C] font-semibold">
                      📍 {addr.lat.toFixed(4)}°, {addr.lng.toFixed(4)}°
                    </span>
                  ) : (
                    <span>No GPS</span>
                  )}

                  {addr.googleMapsUrl && (
                    <a
                      href={addr.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[#1B3E6F] hover:underline flex items-center gap-0.5 font-bold"
                    >
                      <span>Map Pin</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Map Location Picker Modal */}
      <MapLocationPicker
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setEditingAddress(null);
        }}
        onSaveAddress={handleSaveAddress}
        initialAddress={editingAddress}
        title={editingAddress ? 'Edit Delivery Location' : 'Pin New Delivery Location'}
      />
    </div>
  );
};

export default DeliveryAddressSelector;

