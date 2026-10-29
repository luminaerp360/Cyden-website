import React, { useState } from 'react';
import { X, MapPin, Plus, ShieldCheck } from 'lucide-react';
import { DeliveryAddressSelector } from './DeliveryAddressSelector';
import { CustomerAddress } from '../types';

interface MyAddressesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyAddressesModal: React.FC<MyAddressesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(
    null
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-100 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Brand Accent Top Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1B3E6F] via-[#3AA88C] to-[#F2A93B]" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-100 pt-1">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1B3E6F] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#3AA88C]" />
              <span>Customer Account Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1B3E6F] tracking-tight">
              My Delivery Locations
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Manage your residential, club, bar, or depot drop-off spots with exact GPS map pins.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-4">
          <DeliveryAddressSelector
            selectedAddressId={selectedAddress?._id || selectedAddress?.id}
            onSelectAddress={(addr) => setSelectedAddress(addr)}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="text-[11px] text-neutral-400">
            Selected location is used for one-click checkout
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAddressesModal;

