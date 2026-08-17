export type PaymentDiagnosticState =
  | "idle"
  | "validating"
  | "validated"
  | "waiting"
  | "cancelled"
  | "error";

export interface PaymentDiagnosticRequest {
  report_id: number;
  calculation_id: number;
}

export interface PaymentClientDetails {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface PaymentGatewayPayload {
  amount: number;
  currency: string;
  description: string;
  external_reference_id: string;
  success_redirect_url: string;
  failure_redirect_url: string;
  client_details: PaymentClientDetails;
}

export interface PaymentDiagnosticResponse {
  success: boolean;
  payment_table_ready: boolean;
  payload: PaymentGatewayPayload;
  message: string;
}

export interface PaymentSessionResponse {
  success: boolean;
  payment_id: number;
  session_token: string;
  checkout_url: string;
  expires_at: string | null;
  status: "pending";
  message: string;
}

export interface PaymentStatusResponse {
  payment_id: number;
  external_reference_id: string;
  report_id: number;
  calculation_id: number;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "expired";
  transaction_id: string | null;
  expires_at: string | null;
  paid_at: string | null;
  created_at: string;
}
