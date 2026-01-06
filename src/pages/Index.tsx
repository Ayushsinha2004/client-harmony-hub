import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { PipelineStats } from '@/components/dashboard/PipelineStats';
import { ActivityCards } from '@/components/dashboard/ActivityCards';
import { LeadsTable } from '@/components/leads/LeadsTable';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';
import { ClientsGrid } from '@/components/clients/ClientsGrid';
import { LeadDetailModal } from '@/components/modals/LeadDetailModal';
import { EmailDraftModal } from '@/components/modals/EmailDraftModal';
import { useClients } from '@/hooks/useClients';
import { Client, PipelineStage } from '@/types/database';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type Page = 'home' | 'leads' | 'pipeline' | 'clients';

export default function Index() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<Client | null>(null);
  const [emailDraft, setEmailDraft] = useState<{ type: 'discovery' | 'chase' | 'letter'; lead: Client } | null>(null);

  const {
    clients,
    leads,
    activeClients,
    loading,
    stagesCounts,
    actionRequiredCount,
    updateClientStage,
    markAsClient,
  } = useClients();

  // Filter leads based on search
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return leads;
    const query = searchQuery.toLowerCase();
    return leads.filter(
      lead =>
        lead.full_name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.products.some(p => p.toLowerCase().includes(query))
    );
  }, [leads, searchQuery]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return activeClients;
    const query = searchQuery.toLowerCase();
    return activeClients.filter(
      client =>
        client.full_name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
    );
  }, [activeClients, searchQuery]);

  const leadsNeedingAction = leads.filter(
    l =>
      (!l.cashcalc_complete && l.stage !== 'new_booking') ||
      (!l.typeform_complete && l.stage !== 'new_booking') ||
      l.stage === 'awaiting_signature'
  );

  const getPageTitle = () => {
    switch (activePage) {
      case 'home': return 'Dashboard';
      case 'leads': return 'Leads';
      case 'pipeline': return 'Pipeline';
      case 'clients': return 'Clients';
    }
  };

  const handleOpenEmailDraft = (type: 'discovery' | 'chase' | 'letter', lead: Client) => {
    setEmailDraft({ type, lead });
    setSelectedLead(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="fixed left-0 top-0 h-screen w-60 bg-card border-r border-border">
          <Skeleton className="h-16 m-4" />
          <div className="space-y-2 p-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </div>
        <main className="ml-60 min-h-screen p-6">
          <Skeleton className="h-16 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        leadsCount={leads.length}
        clientsCount={activeClients.length}
        actionRequiredCount={actionRequiredCount}
      />

      <main className="ml-60 min-h-screen">
        <Header
          title={getPageTitle()}
          subtitle={format(new Date(), 'EEEE, d MMMM yyyy')}
          actionRequiredCount={actionRequiredCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="p-6">
          {activePage === 'home' && (
            <>
              <StatsGrid
                leadsCount={leads.length}
                clientsCount={activeClients.length}
                actionRequiredCount={actionRequiredCount}
              />
              <PipelineStats
                counts={stagesCounts}
                onStageClick={() => setActivePage('pipeline')}
              />
              <ActivityCards
                leadsNeedingAction={leadsNeedingAction}
                onLeadClick={setSelectedLead}
              />
            </>
          )}

          {activePage === 'leads' && (
            <LeadsTable leads={filteredLeads} onLeadClick={setSelectedLead} />
          )}

          {activePage === 'pipeline' && (
            <KanbanBoard
              leads={filteredLeads}
              onLeadClick={setSelectedLead}
              onStageChange={updateClientStage}
            />
          )}

          {activePage === 'clients' && (
            <ClientsGrid clients={filteredClients} onClientClick={setSelectedLead} />
          )}
        </div>
      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStageChange={updateClientStage}
          onMarkAsClient={markAsClient}
          onOpenEmailDraft={handleOpenEmailDraft}
        />
      )}

      {/* Email Draft Modal */}
      {emailDraft && (
        <EmailDraftModal
          lead={emailDraft.lead}
          type={emailDraft.type}
          onClose={() => setEmailDraft(null)}
        />
      )}
    </div>
  );
}
