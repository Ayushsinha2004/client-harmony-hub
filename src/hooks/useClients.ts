import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Client, PipelineStage } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error, status, statusText } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          status,
          statusText
        });
        throw error;
      }

      setClients(data as Client[] || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Connection Error',
        description: error.message || 'Failed to fetch clients from Supabase. Please check your API keys and RLS policies.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateClientStage = async (clientId: string, newStage: PipelineStage) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ stage: newStage })
        .eq('id', clientId);

      if (error) throw error;

      // Log the activity
      await supabase.from('activity_log').insert({
        client_id: clientId,
        action: 'stage_changed',
        details: `Stage changed to ${newStage}`,
      });

      toast({
        title: 'Stage Updated',
        description: `Client moved to ${newStage.replace(/_/g, ' ')}`,
      });

      return true;
    } catch (error) {
      console.error('Error updating client stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client stage',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates as any)
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: 'Client Updated',
        description: 'Client information has been updated',
      });

      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: 'Error',
        description: 'Failed to update client',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsClient = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          status: 'client' as any,
          client_since: new Date().toISOString().split('T')[0]
        })
        .eq('id', clientId);

      if (error) throw error;

      await supabase.from('activity_log').insert({
        client_id: clientId,
        action: 'marked_as_client',
        details: 'Lead converted to active client',
      });

      toast({
        title: 'Client Created',
        description: 'Lead has been converted to an active client',
      });

      return true;
    } catch (error) {
      console.error('Error marking as client:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert lead to client',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markAsLead = async (clientId: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          status: 'lead' as any,
          client_since: null
        })
        .eq('id', clientId);

      if (error) throw error;

      await supabase.from('activity_log').insert({
        client_id: clientId,
        action: 'marked_as_lead',
        details: 'Client converted back to lead',
      });

      toast({
        title: 'Lead Created',
        description: 'Client has been converted back to a lead',
      });

      return true;
    } catch (error) {
      console.error('Error marking as lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert client to lead',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();

    // Set up realtime subscription
    const channel = supabase
      .channel('clients-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          console.log('Client change:', payload);
          fetchClients(); // Refetch on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Computed values
  const leads = clients.filter(c => c.status === 'lead');
  const activeClients = clients.filter(c => c.status === 'client');

  const getClientsByStage = (stage: PipelineStage) =>
    leads.filter(c => c.stage === stage);

  const stagesCounts = {
    new_booking: getClientsByStage('new_booking').length,
    discovery_complete: getClientsByStage('discovery_complete').length,
    awaiting_data: getClientsByStage('awaiting_data').length,
    recommendation_call: getClientsByStage('recommendation_call').length,
    letter_pending: getClientsByStage('letter_pending').length,
    awaiting_signature: getClientsByStage('awaiting_signature').length,
  };

  const actionRequiredCount = leads.filter(c =>
    (!c.cashcalc_complete && c.stage !== 'new_booking') ||
    (!c.typeform_complete && c.stage !== 'new_booking') ||
    c.stage === 'awaiting_signature'
  ).length;

  return {
    clients,
    leads,
    activeClients,
    loading,
    stagesCounts,
    actionRequiredCount,
    getClientsByStage,
    updateClientStage,
    updateClient,
    markAsClient,
    markAsLead,
    refetch: fetchClients,
    getEmailDraft: async (clientId: string, type: string) => {
      try {
        console.log(`--- Searching for ${type} email for client ${clientId} ---`);

        // 1. Try to find the specific template type with status 'draft'
        let { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('client_id', clientId)
          .ilike('template_type', type)
          .eq('status', 'draft')
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (error) throw error;

        // 2. If no draft found, try to find any email with matching template_type (regardless of status)
        if (!data) {
          console.warn(`No '${type}' draft found. Trying any email with template_type '${type}'...`);
          const { data: anyTypeData, error: anyTypeError } = await supabase
            .from('emails')
            .select('*')
            .eq('client_id', clientId)
            .ilike('template_type', type)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (anyTypeError) throw anyTypeError;
          data = anyTypeData;
        }

        // 3. Fallback: Get most recent email for this client (any type, any status)
        if (!data) {
          console.warn(`No '${type}' email found. Falling back to most recent email for this client...`);
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('emails')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fallbackError) throw fallbackError;
          data = fallbackData;
        }

        if (data) {
          console.log('✅ Found email:', data.subject, '| template_type:', data.template_type, '| status:', data.status);
        } else {
          console.error('❌ No email found at all for this client.');
        }

        return data as any;
      } catch (error) {
        console.error('Error fetching email draft:', error);
        return null;
      }
    },
    updateEmail: async (emailId: string, updates: any) => {
      try {
        const { error } = await supabase
          .from('emails')
          .update(updates)
          .eq('id', emailId);

        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error updating email:', error);
        return false;
      }
    },
    getMeetingActionItems: async (clientId: string) => {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('id, action_items')
          .eq('client_id', clientId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching meeting action items:', error);
        return null;
      }
    },
    updateMeetingActionItems: async (meetingId: string, actionItems: string) => {
      try {
        const { error } = await supabase
          .from('meetings')
          .update({ action_items: actionItems })
          .eq('id', meetingId);

        if (error) throw error;

        toast({
          title: 'Saved',
          description: 'Action items have been updated',
        });
        return true;
      } catch (error) {
        console.error('Error updating meeting action items:', error);
        toast({
          title: 'Error',
          description: 'Failed to save action items',
          variant: 'destructive',
        });
        return false;
      }
    },
    createMeetingWithActionItems: async (clientId: string, actionItems: string) => {
      try {
        const { data, error } = await supabase
          .from('meetings')
          .insert({
            client_id: clientId,
            action_items: actionItems,
            meeting_type: 'general',
            status: 'completed'
          })
          .select('id')
          .single();

        if (error) throw error;

        toast({
          title: 'Saved',
          description: 'Action items have been saved',
        });
        return data;
      } catch (error) {
        console.error('Error creating meeting:', error);
        toast({
          title: 'Error',
          description: 'Failed to save action items',
          variant: 'destructive',
        });
        return null;
      }
    },
    getClientDocuments: async (clientId: string) => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, name, file_url')
          .eq('client_id', clientId)
          .order('uploaded_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
      }
    },
  };
}
