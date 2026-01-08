import { useState, useEffect } from 'react';
import { X, Mail, Send, Pencil, Paperclip, Upload, FileText, Trash2, Loader2 } from 'lucide-react';
import { Client, Email } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface EmailDraftModalProps {
  lead: Client;
  type: 'discovery' | 'chase' | 'letter';
  onClose: () => void;
}

export function EmailDraftModal({ lead, type, onClose }: EmailDraftModalProps) {
  const [email, setEmail] = useState<Partial<Email> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const { getEmailDraft, updateEmail } = useClients();

  useEffect(() => {
    const fetchDraft = async () => {
      setLoading(true);
      const draft = await getEmailDraft(lead.id, type);
      console.log('Fetching draft for:', { clientId: lead.id, type, found: !!draft });

      if (draft) {
        setEmail(draft);
        setBody(draft.body);
      } else {
        const fallbackBody = `Dear ${lead.full_name.split(' ')[0]},\n\n[Draft not found in database for this client and type '${type}'].`;
        setEmail({
          to_email: lead.email,
          subject: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${lead.full_name}`,
          body: fallbackBody,
        });
        setBody(fallbackBody);
      }
      setLoading(false);
    };

    fetchDraft();
  }, [lead.id, type]);

  const handleSendEmail = async () => {
    setSaving(true);

    // Prepare data for webhook
    const payload = {
      to_email: email?.to_email || lead.email,
      cc_emails: email?.cc_emails || [],
      subject: email?.subject || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${lead.full_name}`,
      body: body,
      client_id: lead.id,
      client_name: lead.full_name,
      template_type: type,
      attachments: [
        ...attachments,
        ...uploadedFiles.map(f => f.name)
      ]
    };

    try {
      console.log('Sending to webhook:', payload);
      const response = await fetch('https://braind.app.n8n.cloud/webhook/510b6a83-bc19-42ac-b72d-fbace767fe63', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to send to webhook');

      // Mark as sent in Supabase
      if (email?.id) {
        await updateEmail(email.id, {
          body,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      }

      const totalAttachments = attachments.length + uploadedFiles.length;
      toast({
        title: 'Email Sent',
        description: `Email sent successfully to ${lead.full_name}`,
      });
      onClose();
    } catch (error) {
      console.error('Webhook Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email through the delivery system.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!email?.id) return;
    setSaving(true);
    const success = await updateEmail(email.id, { body });
    if (success) {
      toast({
        title: 'Draft Saved',
        description: 'Your changes have been saved to the database.',
      });
    }
    setSaving(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeUploadedFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const removeTemplateAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in">
        <div className="bg-card rounded-2xl p-12 text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Fetching email draft...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-card rounded-2xl w-full max-w-[750px] max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between text-primary-foreground bg-gradient-blue">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Email Draft</h2>
              <p className="text-sm opacity-85">Review and send to {lead.full_name}</p>
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
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {/* Email Fields */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">To</p>
              <div className="px-3.5 py-2.5 bg-secondary/50 rounded-lg text-sm text-foreground border border-border">
                {email?.to_email}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">CC</p>
              <div className="px-3.5 py-2.5 bg-secondary/50 rounded-lg text-sm text-foreground border border-border">
                {email?.cc_emails && email.cc_emails.length > 0
                  ? email.cc_emails.join(', ')
                  : <span className="text-muted-foreground italic">No CC recipients</span>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Subject</p>
              <div className="px-3.5 py-2.5 bg-secondary/50 rounded-lg text-sm text-foreground border border-border">
                {email?.subject}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Body (click to edit)</p>
              <div
                key={email?.id || 'empty'}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setBody(e.currentTarget.innerText)}
                className="min-h-[250px] px-3.5 py-3 bg-card border border-border rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-wrap focus:outline-none focus:border-info focus:ring-2 focus:ring-info/10"
              >
                {body}
              </div>
            </div>

            {/* Attachments */}
            <div className="pt-4 border-t border-dashed border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Paperclip className="w-4 h-4" />
                Attachments
                <span className="bg-blue-100 text-info px-2 py-0.5 rounded-full text-[11px] font-bold">
                  {attachments.length + uploadedFiles.length}
                </span>
              </p>

              {/* Template Attachments */}
              {attachments.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] text-muted-foreground font-semibold mb-2">Template Documents</p>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-md text-xs text-info"
                      >
                        <FileText className="w-3 h-3" />
                        {att}
                        <button
                          onClick={() => removeTemplateAttachment(i)}
                          className="w-4 h-4 rounded-full bg-blue-100 hover:bg-red-100 hover:text-destructive flex items-center justify-center ml-1 transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="mb-3 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-semibold">Your Uploads</p>
                  {uploadedFiles.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-card border border-border rounded-lg"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center text-info">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{file.name}</p>
                          <p className="text-[11px] text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUploadedFile(file.id)}
                        className="w-7 h-7 rounded-md bg-secondary hover:bg-red-100 hover:text-destructive flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('email-file-upload')?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-info bg-blue-50' : 'border-border bg-secondary/50 hover:border-info hover:bg-blue-50'
                  }`}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-blue rounded-xl flex items-center justify-center text-primary-foreground">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  <span className="text-info font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, JPG, PNG up to 10MB</p>
              </div>
              <input
                type="file"
                id="email-file-upload"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-secondary/50 border-t border-border flex justify-between items-center">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving || !email?.id}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
              Save Draft
            </Button>
            <Button onClick={handleSendEmail} disabled={saving} className="bg-gradient-primary text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Approve & Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

