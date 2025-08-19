export interface Payment {
  id: number;
  booking_id: number;
  payment_method: string;
  transaction_id: string;
  amount: number;
  status: string;
  paid_at: string;
  created_at: string;
  job_title: string;
  date: string;
  time: string;
  address: string;
  client_name: string;
  cleaner_name: string;
}

export interface CreatePaymentRequest {
  bookingId: number;
  amount: number;
}

export interface CreatePaymentResponse {
  message: string;
  paymentId: number;
  booking: {
    id: number;
    job_title: string;
    job_description: string;
    address: string;
    price: number;
    duration_hours: number;
    date: string;
    time: string;
    status: string;
    created_at: string;
    accepted_at: string;
    completed_at: string | null;
    client_id: number;
    cleaner_id: number;
  };
}

export interface InitiatePesapalRequest {
  paymentId: number;
  customerName: string;
  phoneNumber: string;
}

export interface InitiatePesapalResponse {
  success: boolean;
  paymentId: number;
  orderTrackingId: string;
  redirectUrl: string;
  message: string;
}

export interface PaymentCallbackResponse {
  success: boolean;
  message: string;
}
