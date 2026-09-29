import { apiRequest } from './apiClient';
import { API_ENDPOINTS } from '../config';

export interface StkPushPayload {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface StkPushResponse {
  success?: boolean;
  message?: string;
  reference?: string;
  checkoutRequestId?: string;
  CheckoutRequestID?: string;
  MerchantRequestID?: string;
  amount?: number;
  phoneNumber?: string;
  provider?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  CustomerMessage?: string;
  [key: string]: unknown;
}

export interface MpesaTransaction {
  OriginatorConversationID?: string;
  ConversationID?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  ResultCode?: string | number;
  ResultDesc?: string;
  status?: string;
  receiptNumber?: string;
  [key: string]: unknown;
}

export interface FindTransactionResponse {
  success?: boolean;
  message?: string;
  transaction?: MpesaTransaction;
  [key: string]: unknown;
}

/**
 * Normalizes any Kenyan phone number to the 254XXXXXXXXX format required by Safaricom Daraja M-PESA.
 */
export function normalizeMpesaPhone(input: string): string {
  const digits = (input || '').replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export async function initiateStkPush(
  payload: StkPushPayload,
  token?: string | null
): Promise<StkPushResponse> {
  const formattedPhone = normalizeMpesaPhone(payload.phoneNumber);
  return apiRequest<StkPushResponse>(API_ENDPOINTS.mpesaStkPush, {
    method: 'POST',
    body: {
      ...payload,
      phoneNumber: formattedPhone,
    },
    token,
  });
}

export async function checkMpesaTransaction(
  transactionId: string,
  token?: string | null
): Promise<MpesaTransaction> {
  return apiRequest<MpesaTransaction>(
    `${API_ENDPOINTS.mpesaCheck}/${encodeURIComponent(transactionId)}`,
    { token }
  );
}

export async function findMpesaTransaction(
  phoneNumber: string,
  amount: number,
  token?: string | null
): Promise<FindTransactionResponse> {
  const phone = normalizeMpesaPhone(phoneNumber);
  return apiRequest<FindTransactionResponse>(
    `${API_ENDPOINTS.mpesaFindTransaction}?phoneNumber=${encodeURIComponent(phone)}&amount=${encodeURIComponent(
      String(amount)
    )}`,
    { token }
  );
}

export interface PollResult {
  success: boolean;
  receiptNumber?: string;
  message?: string;
}

/**
 * Polls M-PESA for a completed transaction matching checkoutRequestId and phone number.
 */
export async function pollMpesaPayment(
  phoneNumber: string,
  amount: number,
  options: {
    attempts?: number;
    intervalMs?: number;
    token?: string | null;
    checkoutId?: string;
    onAttempt?: (attempt: number) => void;
  } = {}
): Promise<PollResult> {
  const { attempts = 24, intervalMs = 2500, token, checkoutId, onAttempt } = options;

  for (let i = 0; i < attempts; i += 1) {
    if (onAttempt) onAttempt(i + 1);

    // Primary: query the STK status directly via checkoutRequestId
    if (checkoutId) {
      try {
        const check = await checkMpesaTransaction(checkoutId, token);
        const status = String((check as any).status || '').toLowerCase();
        const code = String(check.ResponseCode ?? check.ResultCode ?? (check as any).resultCode ?? '');
        const desc = String(
          check.ResponseDescription ?? check.ResultDesc ?? (check as any).message ?? ''
        );
        const receipt =
          (check as any).receiptNumber ||
          (check as any).MpesaReceiptNumber ||
          (check as any).receipt ||
          checkoutId;

        if (
          status === 'completed' ||
          status === 'success' ||
          code === '0' ||
          code === '0000' ||
          /success|completed/i.test(desc)
        ) {
          return { success: true, receiptNumber: receipt };
        }
        if (status === 'failed' || /cancel|fail|timeout|declined|reject/i.test(desc)) {
          return {
            success: false,
            message: desc || 'Payment was cancelled or declined on your phone.',
          };
        }
      } catch {
        // Keep polling
      }
    }

    // Fallback: check by phone + amount
    try {
      const result = await findMpesaTransaction(phoneNumber, amount, token);
      if (result.success && result.transaction) {
        const receipt =
          (result.transaction as any).receiptNumber ||
          (result.transaction as any).MpesaReceiptNumber ||
          checkoutId ||
          'MPESA-PAID';
        return { success: true, receiptNumber: receipt };
      }
    } catch {
      // Keep polling
    }

    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return {
    success: false,
    message: 'Payment was not confirmed automatically. If you already completed payment, tap "I have paid".',
  };
}
