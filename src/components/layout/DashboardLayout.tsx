import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LeadDetailModal } from '@/components/modals/LeadDetailModal';
import { ClientDetailModal } from '@/components/modals/ClientDetailModal';
import { EmailDraftModal } from '@/components/modals/EmailDraftModal';
import { useClients } from '@/hooks/useClients';
import { Client } from '@/types/database';
import { format } from 'date-fns';
import { useLocation, Outlet } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLayout() {
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLead, setSelectedLead] = useState<Client | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
        markAsLead,
    } = useClients();

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

    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/' || path === '/home') return 'Dashboard';
        if (path === '/leads') return 'Leads';
        if (path === '/pipeline') return 'Pipeline';
        if (path === '/clients') return 'Clients';
        return 'Dashboard';
    };

    const handleOpenEmailDraft = (type: 'discovery' | 'chase' | 'letter', lead: Client) => {
        setEmailDraft({ type, lead });
        setSelectedLead(null);
    };

    // Provide everything via context or just pass down as props through Outlet if needed, 
    // but for simplicity we can use a custom hook or just pass to the components.
    // We'll use Outlet's context feature.

    const contextValue = {
        clients,
        leads,
        activeClients,
        loading,
        stagesCounts,
        actionRequiredCount,
        updateClientStage,
        markAsClient,
        markAsLead,
        searchQuery,
        setSelectedLead,
        setSelectedClient,
        handleOpenEmailDraft
    };

    return (
        <div className="min-h-screen bg-gradient-subtle">
            <Sidebar
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
                    <Outlet context={contextValue} />
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

            {/* Client Detail Modal */}
            {selectedClient && (
                <ClientDetailModal
                    client={selectedClient}
                    onClose={() => setSelectedClient(null)}
                    onMarkAsLead={markAsLead}
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
