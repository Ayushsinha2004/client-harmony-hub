export type PipelineStage = 
  | 'new_booking' 
  | 'discovery_complete' 
  | 'awaiting_data' 
  | 'recommendation_call' 
  | 'letter_pending' 
  | 'awaiting_signature';

export type ClientStatus = 'lead' | 'active_client' | 'inactive';

export interface Client {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: ClientStatus;
  stage: PipelineStage;
  assigned_advisor_id: string | null;
  products: string[];
  source: string | null;
  cashcalc_complete: boolean;
  cashcalc_completed_at: string | null;
  typeform_complete: boolean;
  typeform_completed_at: string | null;
  docs_required: number;
  docs_received: number;
  calendly_event_id: string | null;
  cashcalc_portal_url: string | null;
  sharepoint_folder_url: string | null;
  client_since: string | null;
  review_due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  advisor?: TeamMember;
}

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  client_id: string | null;
  action: string;
  details: string | null;
  performed_by: string | null;
  created_at: string;
  // Joined data
  client?: Client;
  performer?: TeamMember;
}

export interface StageConfig {
  id: PipelineStage;
  label: string;
  color: string;
  gradient: string;
  bgLight: string;
}

export const PIPELINE_STAGES: Record<PipelineStage, StageConfig> = {
  new_booking: {
    id: 'new_booking',
    label: 'New Booking',
    color: 'hsl(220, 90%, 56%)',
    gradient: 'bg-gradient-blue',
    bgLight: 'bg-blue-50',
  },
  discovery_complete: {
    id: 'discovery_complete',
    label: 'Discovery Done',
    color: 'hsl(270, 91%, 65%)',
    gradient: 'bg-gradient-purple',
    bgLight: 'bg-purple-50',
  },
  awaiting_data: {
    id: 'awaiting_data',
    label: 'Awaiting Data',
    color: 'hsl(38, 92%, 50%)',
    gradient: 'bg-gradient-amber',
    bgLight: 'bg-amber-50',
  },
  recommendation_call: {
    id: 'recommendation_call',
    label: 'Recommendation Call',
    color: 'hsl(189, 94%, 43%)',
    gradient: 'bg-gradient-cyan',
    bgLight: 'bg-cyan-50',
  },
  letter_pending: {
    id: 'letter_pending',
    label: 'Letter Pending',
    color: 'hsl(330, 81%, 60%)',
    gradient: 'bg-gradient-pink',
    bgLight: 'bg-pink-50',
  },
  awaiting_signature: {
    id: 'awaiting_signature',
    label: 'Awaiting Signature',
    color: 'hsl(0, 84%, 60%)',
    gradient: 'bg-gradient-red',
    bgLight: 'bg-red-50',
  },
};
