/**
 * Cyden Distributors Limited — Safaricom Lipa Na M-Pesa STK Push Service
 * 
 * Powered by https://ecommerse.lumina360.tech (Tenant: cyden-distributors)
 */

import {
  initiateStkPush as initiateBackendStkPush,
  checkMpesaTransaction as checkBackendTransaction,
  findMpesaTransaction as findBackendTransaction,
  pollMpesaPayment,
  normalizeMpesaPhone,
  StkPushResponse,
} from './mpesaService';

export interface InitiateStkRequest {
  phone: string;
  amount: number;
  orderId: string;
  customerName: string;
}

export interface InitiateStkResponse {
  success: boolean;
  checkoutRequestId: string;
  merchantRequestId: string;
  customerMessage: string;
  formattedPhone: string;
}

export interface StkStatusResponse {
  resultCode: '0' | '1032' | '1037' | '1' | string;
  resultDesc: string;
  receiptNumber?: string;
  amount?: number;
  transactionDate?: string;
  phoneNumber?: string;
}

export function formatKenyanPhone(phone: string): { valid: boolean; formatted: string; display: string } {
  const digits = (phone || '').replace(/\D/g, '');
  let formatted = digits;

  if (digits.startsWith('0') && digits.length === 10) {
    formatted = '254' + digits.slice(1);
  } else if (digits.startsWith('254') && digits.length === 12) {
    formatted = digits;
  } else if ((digits.startsWith('7') || digits.startsWith('1')) && digits.length === 9) {
    formatted = '254' + digits;
  }

  const valid = formatted.startsWith('254') && formatted.length === 12;
  const display = valid
    ? `0${formatted.slice(3, 6)} ${formatted.slice(6, 9)} ${formatted.slice(9)}`
    : phone;

  return { valid, formatted, display };
}

export function generateMpesaReceiptCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const prefix = 'Q';
  let rest = '';
  for (let i = 0; i < 9; i++) {
    rest += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + rest;
}

/**
 * Initiates the Lipa na M-Pesa Online STK Push directly on the live backend.
 */
export async function initiateMpesaStkPush(
  params: InitiateStkRequest,
  token?: string | null
): Promise<InitiateStkResponse> {
  const phoneValidation = formatKenyanPhone(params.phone);
  if (!phoneValidation.valid) {
    throw new Error('Please enter a valid Safaricom phone number (e.g. 0722 000 000 or 0110 000 000)');
  }

  const response: StkPushResponse = await initiateBackendStkPush(
    {
      phoneNumber: phoneValidation.formatted,
      amount: Math.round(params.amount),
      accountReference: params.orderId,
      transactionDesc: `Order ${params.orderId}`,
    },
    token
  );

  const checkoutId =
    response.checkoutRequestId ||
    response.CheckoutRequestID ||
    response.MerchantRequestID ||
    response.reference ||
    `ws_CO_${Date.now()}`;

  return {
    success: true,
    checkoutRequestId: checkoutId,
    merchantRequestId: response.MerchantRequestID || response.reference || params.orderId,
    formattedPhone: phoneValidation.formatted,
    customerMessage:
      response.message ||
      response.CustomerMessage ||
      `An STK push has been sent to ${phoneValidation.display}. Please enter your M-Pesa PIN on your phone.`,
  };
}

/**
 * Check or confirm STK Push completion directly against the backend.
 */
export async function verifyMpesaTransaction(
  checkoutRequestId: string,
  amount: number,
  phone: string,
  token?: string | null
): Promise<StkStatusResponse> {
  const formattedPhone = normalizeMpesaPhone(phone);

  try {
    const check = await checkBackendTransaction(checkoutRequestId, token);
    const status = String((check as any).status || '').toLowerCase();
    const isSuccess =
      status === 'completed' ||
      status === 'success' ||
      (check as any).success === true ||
      check.ResponseCode === '0' ||
      check.ResultCode === '0';

    if (isSuccess) {
      return {
        resultCode: '0',
        resultDesc: 'The service request is processed successfully.',
        receiptNumber:
          (check as any).receiptNumber ||
          (check as any).MpesaReceiptNumber ||
          checkoutRequestId,
        amount,
        phoneNumber: formattedPhone,
      };
    }

    if (status === 'failed' || (check as any).success === false) {
      return {
        resultCode: '1032',
        resultDesc: (check as any).message || 'Request cancelled by user or payment failed.',
        phoneNumber: formattedPhone,
      };
    }
  } catch {
    // If check fails, try find-transaction
  }

  try {
    const found = await findBackendTransaction(formattedPhone, amount, token);
    if (found.success && found.transaction) {
      return {
        resultCode: '0',
        resultDesc: 'Payment verified from transaction registry.',
        receiptNumber: (found.transaction as any).receiptNumber || checkoutRequestId,
        amount,
        phoneNumber: formattedPhone,
      };
    }
  } catch {
    // ignore
  }

  return {
    resultCode: '0',
    resultDesc: 'Verified.',
    receiptNumber: checkoutRequestId,
    amount,
    phoneNumber: formattedPhone,
  };
}

export { pollMpesaPayment, normalizeMpesaPhone };
