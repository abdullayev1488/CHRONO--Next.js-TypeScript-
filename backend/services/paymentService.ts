import type { PaymentStatus } from "../constants";

export interface Payment {
  provider: string | null;
  status: PaymentStatus;
}

// Ödəniş provayderi (Stripe və s.) üçün giriş nöqtəsi.
// Provider hesabı olmadığı üçün real ödəniş aparılmır: sifariş "Unpaid" qalır
// və admin ödənişi əl ilə təsdiqləyir.
export const isPaymentProviderConfigured = (): boolean => false;

export const createPayment = async (): Promise<Payment> => ({
  provider: null,
  status: "Unpaid",
});
