import { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { PipelineStats } from '@/components/dashboard/PipelineStats';
import { ActivityCards } from '@/components/dashboard/ActivityCards';
import { Client } from '@/types/database';

export default function Home() {
    const {
        leads,
        activeClients,
        stagesCounts,
        actionRequiredCount,
        setSelectedLead
    } = useOutletContext<any>();
    const navigate = useNavigate();

    const leadsNeedingAction = leads.filter(
        (l: any) =>
            (!l.cashcalc_complete && l.stage !== 'new_booking') ||
            (!l.typeform_complete && l.stage !== 'new_booking') ||
            l.stage === 'awaiting_signature'
    );

    // Get 3 most recently updated leads
    const recentLeads = useMemo(() => {
        return [...leads]
            .sort((a: Client, b: Client) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )
            .slice(0, 3);
    }, [leads]);

    return (
        <>
            <StatsGrid
                leadsCount={leads.length}
                clientsCount={activeClients.length}
                actionRequiredCount={actionRequiredCount}
            />
            <PipelineStats
                counts={stagesCounts}
                onStageClick={() => navigate('/pipeline')}
            />
            <ActivityCards
                leadsNeedingAction={leadsNeedingAction}
                recentLeads={recentLeads}
                onLeadClick={setSelectedLead}
            />
        </>
    );
}
