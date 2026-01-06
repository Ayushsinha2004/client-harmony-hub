import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityLog } from '@/types/database';

export function useActivityLog(limit = 10) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select(`
          *,
          client:clients(*),
          performer:team_members(*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      setActivities(data as ActivityLog[] || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    action: string, 
    clientId?: string, 
    details?: string,
    performedBy?: string
  ) => {
    try {
      const { error } = await supabase.from('activity_log').insert({
        client_id: clientId || null,
        action,
        details: details || null,
        performed_by: performedBy || null,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Set up realtime subscription
    const channel = supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities,
  };
}
