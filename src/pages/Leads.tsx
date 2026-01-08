import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LeadsTable } from '@/components/leads/LeadsTable';

export default function Leads() {
    const { leads, searchQuery, setSelectedLead } = useOutletContext<any>();

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

    return <LeadsTable leads={filteredLeads} onLeadClick={setSelectedLead} />;
}
