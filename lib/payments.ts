// Payment adapters. Razorpay runs in test mode with the publishable key id only (rzp_test_…).
// The key secret never reaches the browser: in a cloud workspace, the `razorpay-verify` edge function checks the
// payment with Razorpay before the wallet is credited. MockPayment needs no account and is labelled as a test.
import type { WalletTxn } from './types';
export type PayRequest = { amount: number; purpose: 'topup' | 'plan'; note: string; prefill?: { email?: string; contact?: string; name?: string } };
export type PayResult = { ok: boolean; provider: 'mock' | 'razorpay'; ref: string; error?: string };
export interface PaymentAdapter { id: 'mock' | 'razorpay'; label: string; pay(r: PayRequest): Promise<PayResult> }
export const MIN_TOPUP = 500, MAX_TOPUP = 500000;
export function validateAmount(n: number) { if (!Number.isFinite(n) || n < MIN_TOPUP) return `Minimum ₹${MIN_TOPUP}`; if (n > MAX_TOPUP) return 'Maximum ₹5,00,000 per top-up'; if (Math.round(n) !== n) return 'Whole rupees only'; return ''; }
export function isPublishableRzpKey(k: string) { return /^rzp_(test|live)_[A-Za-z0-9]{6,}$/.test(k.trim()); }

export class MockPayment implements PaymentAdapter {
  id = 'mock' as const; label = 'Test payment (no money moves)';
  constructor(private opts: { fail?: boolean; delayMs?: number } = {}) {}
  async pay(r: PayRequest): Promise<PayResult> {
    const err = validateAmount(r.amount); if (err && r.purpose === 'topup') return { ok: false, provider: 'mock', ref: '', error: err };
    await new Promise(res => setTimeout(res, this.opts.delayMs ?? 500));
    if (this.opts.fail) return { ok: false, provider: 'mock', ref: '', error: 'Test payment declined' };
    return { ok: true, provider: 'mock', ref: 'mock_' + Math.random().toString(36).slice(2, 10) };
  }
}
export class RazorpayPayment implements PaymentAdapter {
  id = 'razorpay' as const; label = 'Razorpay (test mode)';
  constructor(private keyId: string, private brand = { name: 'AdCognix', color: '#2F5BFF' }) {
    if (!isPublishableRzpKey(keyId)) throw new Error('Use the Razorpay Key Id (rzp_test_…). Never paste the key secret.');
  }
  private load(): Promise<void> {
    if ((window as any).Razorpay) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => res(); s.onerror = () => rej(new Error('Could not load Razorpay checkout')); document.body.appendChild(s); });
  }
  async pay(r: PayRequest): Promise<PayResult> {
    await this.load();
    return new Promise(resolve => {
      const rz = new (window as any).Razorpay({ key: this.keyId, amount: r.amount * 100, currency: 'INR', name: this.brand.name, description: r.note, prefill: r.prefill, theme: { color: this.brand.color },
        handler: (resp: any) => resolve({ ok: true, provider: 'razorpay', ref: resp.razorpay_payment_id }),
        modal: { ondismiss: () => resolve({ ok: false, provider: 'razorpay', ref: '', error: 'Payment cancelled' }) } });
      rz.on('payment.failed', (e: any) => resolve({ ok: false, provider: 'razorpay', ref: e?.error?.metadata?.payment_id || '', error: e?.error?.description || 'Payment failed' }));
      rz.open();
    });
  }
}
/** Wallet balance = successful top-ups and refunds minus plan purchases. */
export function balance(txns: WalletTxn[]) {
  return txns.filter(t => t.status === 'success').reduce((a, t) => a + (t.kind === 'plan' ? -Math.abs(t.amount) : t.kind === 'adjust' ? t.amount : Math.abs(t.amount)), 0);
}
