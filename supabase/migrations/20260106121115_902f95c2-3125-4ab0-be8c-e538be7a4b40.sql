-- Create enums for the application
CREATE TYPE public.client_status AS ENUM ('lead', 'active_client', 'inactive');
CREATE TYPE public.pipeline_stage AS ENUM ('new_booking', 'discovery_complete', 'awaiting_data', 'recommendation_call', 'letter_pending', 'awaiting_signature');
CREATE TYPE public.meeting_type AS ENUM ('discovery_call', 'recommendation_call', 'review_call', 'general');
CREATE TYPE public.email_status AS ENUM ('draft', 'scheduled', 'sent', 'failed');
CREATE TYPE public.document_type AS ENUM ('id_document', 'proof_of_address', 'bank_statement', 'payslip', 'p60', 'other');
CREATE TYPE public.signature_status AS ENUM ('draft', 'sent', 'viewed', 'signed', 'expired');

-- Create team_members table first (no dependencies)
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email character varying NOT NULL UNIQUE,
  full_name character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'advisor',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Create clients table (depends on team_members)
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  status client_status DEFAULT 'lead',
  stage pipeline_stage DEFAULT 'new_booking',
  assigned_advisor_id uuid REFERENCES public.team_members(id),
  products text[] DEFAULT '{}',
  source character varying,
  cashcalc_complete boolean DEFAULT false,
  cashcalc_completed_at timestamp with time zone,
  typeform_complete boolean DEFAULT false,
  typeform_completed_at timestamp with time zone,
  docs_required integer DEFAULT 0,
  docs_received integer DEFAULT 0,
  calendly_event_id character varying,
  cashcalc_portal_url character varying,
  sharepoint_folder_url character varying,
  client_since date,
  review_due_date date,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bookings table (depends on clients)
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  calendly_event_id character varying UNIQUE,
  meeting_type meeting_type DEFAULT 'discovery_call',
  meeting_name text,
  scheduled_at timestamp with time zone NOT NULL,
  zoom_join_url character varying,
  status character varying DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now()
);

-- Create meetings table (depends on clients, bookings, team_members)
CREATE TABLE public.meetings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  meeting_type meeting_type NOT NULL,
  title character varying,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  transcript text,
  summary text,
  action_items jsonb DEFAULT '[]',
  zoom_recording_url character varying,
  advisor_id uuid REFERENCES public.team_members(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create emails table (depends on clients, team_members)
CREATE TABLE public.emails (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  subject character varying NOT NULL,
  body text NOT NULL,
  to_email character varying NOT NULL,
  cc_emails text[],
  status email_status DEFAULT 'draft',
  template_type character varying,
  sent_at timestamp with time zone,
  created_by uuid REFERENCES public.team_members(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Create chases table (depends on clients, emails)
CREATE TABLE public.chases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  chase_type character varying NOT NULL,
  email_id uuid REFERENCES public.emails(id) ON DELETE SET NULL,
  sent_at timestamp with time zone DEFAULT now()
);

-- Create documents table (depends on clients)
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name character varying NOT NULL,
  document_type document_type NOT NULL,
  file_url character varying,
  sharepoint_url character varying,
  uploaded_at timestamp with time zone DEFAULT now()
);

-- Create signatures table (depends on clients)
CREATE TABLE public.signatures (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  adobe_envelope_id character varying UNIQUE,
  documents jsonb DEFAULT '[]',
  status signature_status DEFAULT 'draft',
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  signed_at timestamp with time zone,
  signed_document_url character varying,
  reminder_count integer DEFAULT 0,
  last_reminder_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create activity_log table (depends on clients, team_members)
CREATE TABLE public.activity_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  action character varying NOT NULL,
  details text,
  performed_by uuid REFERENCES public.team_members(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables (allowing public read/write for now - will add auth later)
CREATE POLICY "Allow public read for team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert for team_members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for team_members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for team_members" ON public.team_members FOR DELETE USING (true);

CREATE POLICY "Allow public read for clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Allow public insert for clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Allow public read for bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public insert for bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for bookings" ON public.bookings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for bookings" ON public.bookings FOR DELETE USING (true);

CREATE POLICY "Allow public read for meetings" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Allow public insert for meetings" ON public.meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for meetings" ON public.meetings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for meetings" ON public.meetings FOR DELETE USING (true);

CREATE POLICY "Allow public read for emails" ON public.emails FOR SELECT USING (true);
CREATE POLICY "Allow public insert for emails" ON public.emails FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for emails" ON public.emails FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for emails" ON public.emails FOR DELETE USING (true);

CREATE POLICY "Allow public read for chases" ON public.chases FOR SELECT USING (true);
CREATE POLICY "Allow public insert for chases" ON public.chases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for chases" ON public.chases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for chases" ON public.chases FOR DELETE USING (true);

CREATE POLICY "Allow public read for documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert for documents" ON public.documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for documents" ON public.documents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for documents" ON public.documents FOR DELETE USING (true);

CREATE POLICY "Allow public read for signatures" ON public.signatures FOR SELECT USING (true);
CREATE POLICY "Allow public insert for signatures" ON public.signatures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for signatures" ON public.signatures FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for signatures" ON public.signatures FOR DELETE USING (true);

CREATE POLICY "Allow public read for activity_log" ON public.activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert for activity_log" ON public.activity_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update for activity_log" ON public.activity_log FOR UPDATE USING (true);
CREATE POLICY "Allow public delete for activity_log" ON public.activity_log FOR DELETE USING (true);

-- Enable realtime for clients table
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for clients table
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample team member
INSERT INTO public.team_members (full_name, email, role) VALUES 
  ('Fiona McCarthy', 'fiona@fpms.ie', 'advisor'),
  ('Niall O''Brien', 'niall@fpms.ie', 'advisor');

-- Insert sample clients
INSERT INTO public.clients (full_name, email, phone, stage, products, cashcalc_complete, typeform_complete, docs_required, docs_received, notes, assigned_advisor_id) VALUES 
  ('John O''Brien', 'john@email.com', '087 123 4567', 'awaiting_data', ARRAY['Pension', 'Life Cover'], false, true, 4, 2, 'Discussed retirement planning. Interested in AVCs.', (SELECT id FROM public.team_members WHERE email = 'fiona@fpms.ie')),
  ('Mary Murphy', 'mary@email.com', '086 234 5678', 'awaiting_data', ARRAY['Income Protection'], true, false, 3, 1, 'Self-employed, needs income protection.', (SELECT id FROM public.team_members WHERE email = 'fiona@fpms.ie')),
  ('Patrick Kelly', 'patrick@email.com', '085 345 6789', 'new_booking', ARRAY['Pension'], false, false, 0, 0, '', (SELECT id FROM public.team_members WHERE email = 'niall@fpms.ie')),
  ('Sarah Walsh', 'sarah@email.com', '083 456 7890', 'discovery_complete', ARRAY['Savings', 'Pension'], false, false, 4, 0, 'Young professional, starting savings plan for house deposit.', (SELECT id FROM public.team_members WHERE email = 'fiona@fpms.ie')),
  ('Gavin Ashe', 'gavin@email.com', '087 567 8901', 'letter_pending', ARRAY['Protection', 'Pension'], true, true, 5, 5, 'Documents complete, letter preparation in progress.', (SELECT id FROM public.team_members WHERE email = 'fiona@fpms.ie')),
  ('Laura Carrick', 'laura@email.com', '086 678 9012', 'awaiting_signature', ARRAY['Pension Review'], true, true, 3, 3, 'Signed but awaiting policy number.', (SELECT id FROM public.team_members WHERE email = 'niall@fpms.ie')),
  ('Michael Byrne', 'michael@email.com', '085 789 0123', 'recommendation_call', ARRAY['Mortgage Protection', 'Life Cover'], true, true, 4, 4, 'Ready for recommendation meeting.', (SELECT id FROM public.team_members WHERE email = 'fiona@fpms.ie'));