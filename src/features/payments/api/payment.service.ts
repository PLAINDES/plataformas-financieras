import { api } from "@/shared/services/api";
import type {
  PaymentDiagnosticRequest,
  PaymentDiagnosticResponse,
  PaymentSessionResponse,
  PaymentStatusResponse,
} from "../types/payment.types";

const getAuthToken = (): string | undefined =>
  localStorage.getItem("auth_token") || undefined;

export const PaymentService = {
  validatePayload: async (
    data: PaymentDiagnosticRequest
  ): Promise<PaymentDiagnosticResponse> =>
    api.post<PaymentDiagnosticResponse>("main/report-payments/diagnostic", data, {
      token: getAuthToken(),
    }),
  createSession: async (
    data: PaymentDiagnosticRequest
  ): Promise<PaymentSessionResponse> =>
    api.post<PaymentSessionResponse>("main/report-payments/sessions", data, {
      token: getAuthToken(),
    }),
  getStatus: async (paymentId: number): Promise<PaymentStatusResponse> =>
    api.get<PaymentStatusResponse>(`main/report-payments/${paymentId}`, {
      token: getAuthToken(),
    }),
};
