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
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          advisor:team_members!clients_assigned_advisor_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setClients(data as Client[] || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch clients',
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
        .update(updates)
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
          status: 'active_client' as const,
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
  const activeClients = clients.filter(c => c.status === 'active_client');
  
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
    refetch: fetchClients,
  };
}
