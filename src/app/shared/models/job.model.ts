export interface Job {
  id?: number;
  job_title: string;
  job_description: string;
  address: string;
  price: number;
  duration_hours: number;
  date: string;
  time: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
  accepted_at?: string;
  completed_at?: string;
  client_id: number;
  cleaner_id?: number;

  // Populated fields from joins
  client_name?: string;
  client_phone?: string;
  cleaner_name?: string;
  cleaner_phone?: string;
}

export interface JobRequest {
  job_title: string;
  job_description: string;
  address: string;
  price: number;
  duration_hours: number;
  date: string;
  time: string;
  client_id: number;
}

export interface JobResponse {
  message: string;
  bookingId?: number;
}

export interface AcceptJobRequest {
  bookingId: number;
}

export interface UpdateJobStatusRequest {
  bookingId: number;
  status: 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}
