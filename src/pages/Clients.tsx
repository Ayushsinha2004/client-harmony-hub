import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ClientsGrid } from '@/components/clients/ClientsGrid';

export default function Clients() {
    const { activeClients, searchQuery, setSelectedClient } = useOutletContext<any>();

    const filteredClients = useMemo(() => {
        if (!searchQuery.trim()) return activeClients;
        const query = searchQuery.toLowerCase();
        return activeClients.filter(
            (client: any) =>
                client.full_name.toLowerCase().includes(query) ||
                client.email.toLowerCase().includes(query)
        );
    }, [activeClients, searchQuery]);

    return <ClientsGrid clients={filteredClients} onClientClick={setSelectedClient} />;
}
