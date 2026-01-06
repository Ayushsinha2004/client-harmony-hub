import { useState } from 'react';
import { X, Mail, Send, Pencil, Paperclip, Upload, FileText, Trash2 } from 'lucide-react';
import { Client } from '@/types/database';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

const emailTemplates = {
  discovery: (lead: Client) => ({
    subject: `Follow-up from your Discovery Call - ${lead.full_name}`,
    to: lead.email,
    cc: 'admin@fpms.ie',
    body: `Dear ${lead.full_name.split(' ')[0]},

Thank you for taking the time to speak with us during your discovery call. It was great to learn more about your financial goals.

Based on our conversation, I've identified the following areas we can help you with:
${lead.products.map(p => `• ${p}`).join('\n')}

Next Steps:
1. Please complete your CashCalc fact find (link in separate email)
2. Complete the risk profiler questionnaire
3. Gather the required documents

If you have any questions, please don't hesitate to reach out.

Kind regards,
Fiona McCarthy
Financial Advisor`,
    attachments: ['Document_Checklist.pdf', 'Privacy_Notice.pdf'],
  }),
  chase: (lead: Client) => ({
    subject: `Reminder: Outstanding Items - ${lead.full_name}`,
    to: lead.email,
    cc: 'admin@fpms.ie',
    body: `Dear ${lead.full_name.split(' ')[0]},

I hope this email finds you well. I wanted to follow up regarding your financial planning application.

We're still waiting for the following items:
${!lead.cashcalc_complete ? '• CashCalc fact find completion\n' : ''}${!lead.typeform_complete ? '• Risk profiler questionnaire\n' : ''}${lead.docs_received < lead.docs_required ? `• Outstanding documents (${lead.docs_required - lead.docs_received} remaining)\n` : ''}
Once we receive these items, we can proceed to the next stage of your application.

Please let me know if you need any assistance or have any questions.

Kind regards,
Fiona McCarthy
Financial Advisor`,
    attachments: [],
  }),
  letter: (lead: Client) => ({
    subject: `Your Letter of Recommendation - ${lead.full_name}`,
    to: lead.email,
    cc: 'admin@fpms.ie',
    body: `Dear ${lead.full_name.split(' ')[0]},

Please find attached your Letter of Recommendation outlining our proposed solutions for:
${lead.products.map(p => `• ${p}`).join('\n')}

Please review the document carefully and let me know if you have any questions.

Once you're happy to proceed, please sign the attached document using Adobe Sign (link will be sent separately).

Kind regards,
Fiona McCarthy
Financial Advisor`,
    attachments: ['Letter_of_Recommendation.pdf', 'Product_Illustrations.pdf'],
  }),
};

export function EmailDraftModal({ lead, type, onClose }: EmailDraftModalProps) {
  const template = emailTemplates[type](lead);
  const [attachments, setAttachments] = useState(template.attachments);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = () => {
    const totalAttachments = attachments.length + uploadedFiles.length;
    toast({
      title: 'Email Sent',
      description: `Email sent to ${lead.full_name} with ${totalAttachments} attachment${totalAttachments !== 1 ? 's' : ''}`,
    });
    onClose();
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
                {template.to}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">CC</p>
              <div className="px-3.5 py-2.5 bg-secondary/50 rounded-lg text-sm text-foreground border border-border">
                {template.cc}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Subject</p>
              <div className="px-3.5 py-2.5 bg-secondary/50 rounded-lg text-sm text-foreground border border-border">
                {template.subject}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1.5">Body (click to edit)</p>
              <div
                contentEditable
                suppressContentEditableWarning
                className="min-h-[200px] px-3.5 py-3 bg-card border border-border rounded-lg text-sm text-foreground leading-relaxed whitespace-pre-wrap focus:outline-none focus:border-info focus:ring-2 focus:ring-info/10"
              >
                {template.body}
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
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-info bg-blue-50' : 'border-border bg-secondary/50 hover:border-info hover:bg-blue-50'
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
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2.5">
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleSendEmail} className="bg-gradient-primary text-primary-foreground">
              <Send className="w-4 h-4 mr-2" />
              Approve & Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
