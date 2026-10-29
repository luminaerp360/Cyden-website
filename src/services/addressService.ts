import { apiRequest } from './apiClient';
import { CustomerAddress } from '../types';
import { getAccessToken, getStoredUser } from './authService';

const GUEST_ADDRESSES_KEY = 'cyden_guest_addresses';

export function getGuestAddresses(): CustomerAddress[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(GUEST_ADDRESSES_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveGuestAddress(address: CustomerAddress): CustomerAddress[] {
  const list = getGuestAddresses();
  const addressWithId: CustomerAddress = {
    ...address,
    _id: address._id || `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    isDefault: address.isDefault || list.length === 0,
  };

  let updated = address.isDefault
    ? list.map((a) => ({ ...a, isDefault: false }))
    : [...list];

  updated.push(addressWithId);

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(updated));
    }
  } catch {
    // ignore
  }
  return updated;
}

export async function fetchUserAddresses(): Promise<CustomerAddress[]> {
  const token = getAccessToken();
  if (!token) {
    return getGuestAddresses();
  }

  try {
    const list = await apiRequest<CustomerAddress[]>('/users/me/addresses', {
      token,
    });
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.warn('Falling back to user stored addresses or local cache', err);
    const user = getStoredUser();
    if (user && Array.isArray((user as any).addresses)) {
      return (user as any).addresses;
    }
    return getGuestAddresses();
  }
}

export async function addUserAddress(
  address: Partial<CustomerAddress>
): Promise<CustomerAddress[]> {
  const token = getAccessToken();
  if (!token) {
    return saveGuestAddress(address as CustomerAddress);
  }

  const list = await apiRequest<CustomerAddress[]>('/users/me/addresses', {
    method: 'POST',
    body: address,
    token,
  });

  return Array.isArray(list) ? list : [];
}

export async function updateUserAddress(
  addressId: string,
  address: Partial<CustomerAddress>
): Promise<CustomerAddress[]> {
  const token = getAccessToken();
  if (!token) {
    const list = getGuestAddresses();
    const updated = list.map((a) =>
      a._id === addressId || a.id === addressId ? { ...a, ...address } : a
    );
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(updated));
    return updated;
  }

  const list = await apiRequest<CustomerAddress[]>(
    `/users/me/addresses/${addressId}`,
    {
      method: 'PATCH',
      body: address,
      token,
    }
  );

  return Array.isArray(list) ? list : [];
}

export async function deleteUserAddress(
  addressId: string
): Promise<CustomerAddress[]> {
  const token = getAccessToken();
  if (!token) {
    const list = getGuestAddresses().filter(
      (a) => a._id !== addressId && a.id !== addressId
    );
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(list));
    return list;
  }

  const list = await apiRequest<CustomerAddress[]>(
    `/users/me/addresses/${addressId}`,
    {
      method: 'DELETE',
      token,
    }
  );

  return Array.isArray(list) ? list : [];
}

export async function setUserDefaultAddress(
  addressId: string
): Promise<CustomerAddress[]> {
  const token = getAccessToken();
  if (!token) {
    const list = getGuestAddresses().map((a) => ({
      ...a,
      isDefault: a._id === addressId || a.id === addressId,
    }));
    localStorage.setItem(GUEST_ADDRESSES_KEY, JSON.stringify(list));
    return list;
  }

  const list = await apiRequest<CustomerAddress[]>(
    `/users/me/addresses/${addressId}/default`,
    {
      method: 'PATCH',
      token,
    }
  );

  return Array.isArray(list) ? list : [];
}

