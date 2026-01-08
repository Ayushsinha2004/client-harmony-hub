import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { KanbanBoard } from '@/components/pipeline/KanbanBoard';

export default function Pipeline() {
    const { leads, searchQuery, setSelectedLead, updateClientStage } = useOutletContext<any>();

    const filteredLeads = useMemo(() => {
        if (!searchQuery.trim()) return leads;
        const query = searchQuery.toLowerCase();
        return leads.filter(
            (lead: any) =>
                lead.full_name.toLowerCase().includes(query) ||
                lead.email.toLowerCase().includes(query) ||
                lead.products.some((p: any) => p.toLowerCase().includes(query))
        );
    }, [leads, searchQuery]);

    return (
        <KanbanBoard
            leads={filteredLeads}
            onLeadClick={setSelectedLead}
            onStageChange={updateClientStage}
        />
    );
}
