import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Check,
  X,
  Search,
  Building2,
  Home,
  Store,
  Briefcase,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CustomerAddress } from '../types';

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: CustomerAddress) => void | Promise<void>;
  initialAddress?: CustomerAddress | null;
  title?: string;
}

// Default center: Cyden Main Hub, Eldoret, Kenya
const DEFAULT_CENTER: [number, number] = [0.515, 35.288333];
const DEFAULT_ZOOM = 14;

// Quick Jump North Rift Delivery Hubs & Outlets
const QUICK_LOCATIONS: { name: string; coords: [number, number] }[] = [
  { name: 'Eldoret CBD', coords: [0.5204, 35.2698] },
  { name: 'Rupa Mall / Godowns', coords: [0.515, 35.2883] },
  { name: 'Elgon View', coords: [0.5015, 35.285] },
  { name: 'Pioneer / Langas', coords: [0.495, 35.272] },
  { name: 'Annex / Moi Univ Main', coords: [0.485, 35.31] },
  { name: 'Huruma / West Indies', coords: [0.53, 35.26] },
  { name: 'Iten Town Center', coords: [0.6732, 35.5085] },
  { name: 'Kapsabet CBD', coords: [0.2045, 35.105] },
];

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
  initialAddress,
  title = 'Pin Delivery Location on Map',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => ({
    lat: initialAddress?.lat ?? DEFAULT_CENTER[0],
    lng: initialAddress?.lng ?? DEFAULT_CENTER[1],
  }));

  const [label, setLabel] = useState<string>(initialAddress?.label || 'Home');
  const [customLabel, setCustomLabel] = useState<string>('');
  const [street, setStreet] = useState<string>(initialAddress?.street || '');
  const [landmark, setLandmark] = useState<string>(initialAddress?.landmark || '');
  const [building, setBuilding] = useState<string>(initialAddress?.building || '');
  const [contactPhone, setContactPhone] = useState<string>(
    initialAddress?.contactPhone || ''
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState<string>(
    initialAddress?.deliveryInstructions || ''
  );
  const [isDefault, setIsDefault] = useState<boolean>(
    initialAddress?.isDefault ?? true
  );

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [reverseGeocoding, setReverseGeocoding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom SVG Leaflet Pin (prevents missing leaflet png asset bugs)
  const createPinIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          background: #1B3E6F;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: #3AA88C;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });
  }, []);

  // Reverse Geocoding with OpenStreetMap Nominatim (Free, no API key)
  const fetchAddressFromCoords = useCallback(async (lat: number, lng: number) => {
    setReverseGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (res.ok) {
        const data = await res.json();
        const road =
          data.address?.road ||
          data.address?.suburb ||
          data.address?.neighbourhood ||
          data.address?.commercial ||
          data.address?.town ||
          data.name ||
          '';

        const place = [road, data.address?.city || data.address?.county || 'Eldoret']
          .filter(Boolean)
          .join(', ');

        if (place && !street) {
          setStreet(place);
        }
      }
    } catch {
      // Quietly ignore geocoding network errors
    } finally {
      setReverseGeocoding(false);
    }
  }, [street]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = initialAddress?.lat ?? DEFAULT_CENTER[0];
      const initialLng = initialAddress?.lng ?? DEFAULT_CENTER[1];

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Marker setup
      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: createPinIcon(),
      }).addTo(map);

      // Map Click Handler -> Move pin to click
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        fetchAddressFromCoords(lat, lng);
      });

      // Marker Drag End Handler
      marker.on('dragend', () => {
        const latLng = marker.getLatLng();
        setCoords({ lat: latLng.lat, lng: latLng.lng });
        fetchAddressFromCoords(latLng.lat, latLng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Leaflet requires invalidateSize when rendered inside a modal
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, initialAddress, createPinIcon, fetchAddressFromCoords]);

  // GPS "Locate Me" Button Handler
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16, {
            animate: true,
          });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        fetchAddressFromCoords(latitude, longitude);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setError(err.message || 'Unable to retrieve your physical location.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 10000 }
    );
  };

  // Jump to known Eldoret / North Rift hotspot
  const handleJumpTo = (spotCoords: [number, number]) => {
    setCoords({ lat: spotCoords[0], lng: spotCoords[1] });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(spotCoords, 16, { animate: true });
      markerRef.current.setLatLng(spotCoords);
    }
    fetchAddressFromCoords(spotCoords[0], spotCoords[1]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const effectiveLabel = label === 'Other' ? customLabel.trim() || 'Other' : label;
    const effectiveStreet = street.trim();

    if (!effectiveStreet) {
      setError('Please provide a street or neighborhood description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const googleMapsUrl = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;

      const addressData: CustomerAddress = {
        _id: initialAddress?._id || initialAddress?.id,
        label: effectiveLabel,
        street: effectiveStreet,
        city: 'Eldoret',
        state: 'Uasin Gishu',
        country: 'Kenya',
        landmark: landmark.trim() || undefined,
        building: building.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        lat: coords.lat,
        lng: coords.lng,
        googleMapsUrl,
        isDefault,
      };

      await onSaveAddress(addressData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save delivery location.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-neutral-100 relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1B3E6F]/10 text-[#1B3E6F] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#3AA88C]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#1B3E6F] tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-neutral-500">
                Click map or drag the pin to your exact delivery entrance
              </p>
            </div>
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

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 py-3 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Map & Controls */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-neutral-600">
                <span className="font-bold text-[#1B3E6F]">Pin Coordinates:</span>
                <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-[11px]">
                  {coords.lat.toFixed(5)}°, {coords.lng.toFixed(5)}°
                </span>
                {reverseGeocoding && (
                  <span className="text-[10px] text-[#3AA88C] animate-pulse">
                    Detecting area...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-lg bg-[#3AA88C] hover:bg-[#2C856E] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Navigation
                    className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`}
                  />
                  <span>{isLocating ? 'Acquiring GPS...' : 'My Location'}</span>
                </button>
              </div>
            </div>

            {/* Quick-Jump Hotspots */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <span className="text-neutral-400 text-[10px] font-bold uppercase shrink-0">
                Quick Jump:
              </span>
              {QUICK_LOCATIONS.map((spot) => (
                <button
                  key={spot.name}
                  type="button"
                  onClick={() => handleJumpTo(spot.coords)}
                  className="px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium whitespace-nowrap transition-colors cursor-pointer"
                >
                  {spot.name}
                </button>
              ))}
            </div>

            {/* The Leaflet Map Canvas */}
            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner relative z-10">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>💡 Tap anywhere on the map or drag the blue pin</span>
              <a
                href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3AA88C] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Google Maps Preview</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Address Details Form */}
          <form id="address-form" onSubmit={handleSave} className="space-y-3 pt-2">
            {/* Label Pills */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Location Label
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'Home', icon: Home },
                  { id: 'Outlet / Bar', icon: Store },
                  { id: 'Office', icon: Briefcase },
                  { id: 'Depot', icon: Building2 },
                  { id: 'Other', icon: MapPin },
                ].map(({ id, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLabel(id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      label === id
                        ? 'bg-[#1B3E6F] text-white shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{id}</span>
                  </button>
                ))}
              </div>
              {label === 'Other' && (
                <input
                  type="text"
                  required
                  placeholder="e.g. Eldoret Sports Club, Warehouse 3"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="mt-2 w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                />
              )}
            </div>

            {/* Street / Area & Landmark */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Street / Area Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uganda Road / Rupa Mall Area"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Landmark (Visible Reference)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Shell Petrol Station, Black Gate"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                />
              </div>
            </div>

            {/* Building / Stall & Contact Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Building / Floor / Stall No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ground Floor, Stall 4B"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                  Recipient Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0722 000 000"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
                />
              </div>
            </div>

            {/* Rider Instructions */}
            <div>
              <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
                Driver / Dispatch Delivery Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Call guard at the barrier gate for delivery entry slip"
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3AA88C]"
              />
            </div>

            {/* Default Address Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-[#3AA88C] focus:ring-[#3AA88C] border-neutral-300"
              />
              <span className="text-xs font-semibold text-neutral-700">
                Set as default delivery address for future orders
              </span>
            </label>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="address-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-[#1B3E6F] hover:bg-[#122B4E] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Location...</span>
              </span>
            ) : (
              <>
                <Check className="w-4 h-4 text-[#3AA88C]" />
                <span>Save Delivery Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;

