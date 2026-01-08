import { useState, useEffect } from 'react';
import { X, Mail, Check, Clock, FolderOpen, FileText, CheckCircle, Save, Loader2, ExternalLink } from 'lucide-react';
import { Client, PIPELINE_STAGES, PipelineStage } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';

interface Document {
  id: string;
  name: string;
  file_url: string;
}

interface LeadDetailModalProps {
  lead: Client;
  onClose: () => void;
  onStageChange: (clientId: string, newStage: PipelineStage) => Promise<boolean>;
  onMarkAsClient: (clientId: string) => Promise<boolean>;
  onOpenEmailDraft: (type: 'discovery' | 'chase' | 'letter', lead: Client) => void;
}

export function LeadDetailModal({
  lead,
  onClose,
  onStageChange,
  onMarkAsClient,
  onOpenEmailDraft
}: LeadDetailModalProps) {
  const [selectedStage, setSelectedStage] = useState<PipelineStage>(lead.stage);
  const [saving, setSaving] = useState(false);
  const [actionItems, setActionItems] = useState('');
  const [originalActionItems, setOriginalActionItems] = useState('');
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [savingNotes, setSavingNotes] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const { getMeetingActionItems, updateMeetingActionItems, createMeetingWithActionItems, getClientDocuments } = useClients();

  const stage = PIPELINE_STAGES[lead.stage];
  const hasChanges = selectedStage !== lead.stage;
  const hasNotesChanges = actionItems !== originalActionItems;

  // Fetch action items from meetings table
  useEffect(() => {
    const fetchActionItems = async () => {
      setLoadingNotes(true);
      const meeting = await getMeetingActionItems(lead.id);
      if (meeting) {
        setActionItems(meeting.action_items || '');
        setOriginalActionItems(meeting.action_items || '');
        setMeetingId(meeting.id);
      } else {
        setActionItems('');
        setOriginalActionItems('');
        setMeetingId(null);
      }
      setLoadingNotes(false);
    };

    fetchActionItems();
  }, [lead.id]);

  // Fetch documents from documents table
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoadingDocs(true);
      const docs = await getClientDocuments(lead.id);
      setDocuments(docs);
      setLoadingDocs(false);
    };

    fetchDocuments();
  }, [lead.id]);

  const handleSaveStage = async () => {
    if (!hasChanges) return;
    setSaving(true);
    const success = await onStageChange(lead.id, selectedStage);
    if (success) {
      onClose();
    }
    setSaving(false);
  };

  const handleMarkAsClient = async () => {
    setSaving(true);
    const success = await onMarkAsClient(lead.id);
    if (success) {
      onClose();
    }
    setSaving(false);
  };

  const handleSaveActionItems = async () => {
    if (!hasNotesChanges) return;
    setSavingNotes(true);

    if (meetingId) {
      // Update existing meeting
      const success = await updateMeetingActionItems(meetingId, actionItems);
      if (success) {
        setOriginalActionItems(actionItems);
      }
    } else {
      // Create new meeting record
      const result = await createMeetingWithActionItems(lead.id, actionItems);
      if (result) {
        setMeetingId(result.id);
        setOriginalActionItems(actionItems);
      }
    }

    setSavingNotes(false);
  };

  const checklistItems = [
    { label: 'CashCalc Complete', complete: lead.cashcalc_complete },
    { label: 'Risk Profiler Complete', complete: lead.typeform_complete },
    { label: `Documents (${lead.docs_received}/${lead.docs_required})`, complete: lead.docs_received >= lead.docs_required },
    { label: 'Discovery Call Done', complete: lead.stage !== 'new_booking' },
  ];

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card rounded-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between text-primary-foreground"
          style={{ background: stage.color }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center font-bold text-lg">
              {lead.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-xl font-bold">{lead.full_name}</h2>
              <p className="text-sm opacity-85">{stage.label}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Contact Info */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Contact Information
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Email</p>
                <p className="text-sm font-semibold text-foreground">{lead.email}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Phone</p>
                <p className="text-sm font-semibold text-foreground">{lead.phone || 'Not provided'}</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase mb-1">Advisor</p>
                <p className="text-sm font-semibold text-foreground">{lead.advisor?.full_name || 'Unassigned'}</p>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Requirements Checklist
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {checklistItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-secondary/50 rounded-xl text-[13px]"
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center",
                      item.complete
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                    )}
                  >
                    {item.complete ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <span className={item.complete ? "text-emerald-600" : "text-amber-600"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Documents
            </h3>
            {loadingDocs ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    {doc.name}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No documents uploaded</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="px-6 py-5 border-b border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {lead.stage === 'discovery_complete' && (
                <Button
                  onClick={() => onOpenEmailDraft('discovery', lead)}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Generate Discovery Email
                </Button>
              )}
              {lead.stage === 'awaiting_data' && (!lead.cashcalc_complete || !lead.typeform_complete) && (
                <Button
                  onClick={() => onOpenEmailDraft('chase', lead)}
                  className="bg-gradient-amber text-primary-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Chaser Email
                </Button>
              )}
              {lead.stage === 'letter_pending' && (
                <Button
                  onClick={() => onOpenEmailDraft('letter', lead)}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Letter Email
                </Button>
              )}
              {lead.stage === 'awaiting_signature' && (
                <Button
                  onClick={() => onOpenEmailDraft('chase', lead)}
                  className="bg-gradient-amber text-primary-foreground"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Signature Reminder
                </Button>
              )}
              <Button variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Open Client Folder
              </Button>
            </div>

            {/* Stage Selector */}
            <div className="bg-secondary/50 p-4 rounded-xl mt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-muted-foreground">Move to Stage</span>
                <Button
                  variant="outline"
                  onClick={handleMarkAsClient}
                  disabled={saving}
                  className="border-2 border-primary text-primary hover:bg-emerald-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark as Client
                </Button>
              </div>
              <div className="flex gap-3 items-center">
                <Select value={selectedStage} onValueChange={(v) => setSelectedStage(v as PipelineStage)}>
                  <SelectTrigger className="flex-1 bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PIPELINE_STAGES) as PipelineStage[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {PIPELINE_STAGES[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSaveStage}
                  disabled={!hasChanges || saving}
                  className="bg-gradient-primary text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Meeting Notes / Action Items */}
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Meeting Notes
              </h3>
              {hasNotesChanges && (
                <Button
                  size="sm"
                  onClick={handleSaveActionItems}
                  disabled={savingNotes}
                  className="bg-gradient-primary text-primary-foreground h-8"
                >
                  {savingNotes ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1.5" />
                      Save Notes
                    </>
                  )}
                </Button>
              )}
            </div>
            {loadingNotes ? (
              <div className="bg-secondary/50 rounded-xl p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <textarea
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="Add meeting notes or action items..."
                className="w-full min-h-[120px] px-3.5 py-3 bg-secondary/50 border border-border rounded-xl text-sm text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
