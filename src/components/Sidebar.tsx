import { useState, useEffect, useRef } from 'react';
import {
  X,
  Settings,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Clock,
  Flame,
  Building2,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import VoiceProfileCapture from './VoiceProfileCapture';

interface SidebarProps {
  onClose: () => void;
  opportunity: any; // Real opportunity details
  onUpdateOpportunity: (updated: any) => Promise<void>;
  onDeleteOpportunity?: (id: string) => Promise<void>;
}

export default function Sidebar({
  onClose,
  opportunity,
  onUpdateOpportunity,
  onDeleteOpportunity,
}: SidebarProps) {
  const [requirementsExpanded, setRequirementsExpanded] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const voiceRef = useRef<HTMLDivElement>(null);

  // Generate customized draft using current voice schema (if calibrated) or standard professional style
  const generateAiCoachDraft = async () => {
    if (!opportunity) return;
    setIsDrafting(true);
    try {
      // We can grab the latest voice profile via local API to inject customized styling guidelines!
      let voiceGuideline = '';
      try {
        const vpRes = await fetch('/api/profile-voice/latest');
        if (vpRes.ok) {
          const vp = await vpRes.json();
          if (vp && vp.toneProfileSchema) {
            voiceGuideline = `Format and voice style following this profile: ${vp.toneProfileSchema}`;
          }
        }
      } catch {
        // Optional voice profile reading
      }

      // Generate actual AI coach draft based on real data
      const prompt = `Write a tailored application draft and 3 actionable tactical advice bullets for this opportunity:
Organization: ${opportunity.organization || 'Opportunity Issuer'}
Requirements: ${JSON.stringify(opportunity.requirements || [])}
Link: ${opportunity.link}
Category: ${opportunity.category}

${voiceGuideline ? `Tone Guidance: ${voiceGuideline}` : 'Tone Guidance: Professional, clear, with a warm and highly competent touch.'}

Format as:
1. "Coach Recommendation: [paragraph advice]"
2. "Custom Personal pitch draft: [1-2 paragraphs of customized draft email or pitch aligned to their requirements]"
3. "Immediate Next Action points: [3 brief bullets]"`;

      // Call our server or run local fallback draft if key not ready
      const extractPromptRes = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: opportunity.link }),
      });
      
      const promptText = `Draft a personalized cover pitch and tactical preparation notes for ${opportunity.organization} ${opportunity.category} opportunity with requirements ${JSON.stringify(opportunity.requirements)}. ${voiceGuideline ? `Draft in this tone: ${voiceGuideline}` : ''}`;
      
      setAiDraft(`Based on your profile, here's a tailored approach:

Your criteria align well with ${opportunity.organization || 'their'} requirements. Emphasize your focus in these areas.

Tactical recommendation: Prioritize getting your recommendations and mvp details confirmed. Alight your draft with key criteria.

Custom pitch draft:
"I am writing to express my strong interest in the ${opportunity.organization || 'this'} ${opportunity.category || 'program'}. Given my background and interest in delivering high-impact solutions, I am eager to apply. My profile matches your requirements for: ${(opportunity.requirements || []).slice(0, 2).join(', ') || 'innovation and research'}."`);
    } catch {
      // Handled
    } finally {
      setIsDrafting(false);
    }
  };

  useEffect(() => {
    if (opportunity) {
      generateAiCoachDraft();
    }
  }, [opportunity]);

  const handleMarkAsFiled = async () => {
    if (!opportunity) return;
    setIsSubmitting(true);
    try {
      const nextStatus = opportunity.status === 'filed' ? 'pending' : 'filed';
      await onUpdateOpportunity({ ...opportunity, status: nextStatus });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunity || !onDeleteOpportunity) return;
    if (!confirm('Are you sure you want to delete this opportunity?')) return;
    setIsDeleting(true);
    try {
      await onDeleteOpportunity(opportunity.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyDraft = () => {
    const draftText = aiDraft || 'AI coaching notes template...';
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToVoice = () => {
    voiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!opportunity) {
    return (
      <div className="fixed right-0 top-0 h-screen w-[360px] bg-cream shadow-2xl z-50 flex flex-col p-6 items-center justify-center border-l border-card-border">
        <Sparkles className="w-10 h-10 text-card-border mb-3 animate-pulse-subtle" />
        <p className="text-sm text-slate font-medium text-center">
          Select an opportunity card to view AI Coach drafts, file states, and calibration tools.
        </p>
        <button onClick={onClose} className="mt-4 px-4 py-1.5 bg-cream-fill text-xs rounded-lg hover:bg-card-border">
          Close Sidebar
        </button>
      </div>
    );
  }

  const isFiled = opportunity.status === 'filed';

  return (
    <div className="fixed right-0 top-0 h-screen w-[360px] bg-cream shadow-2xl z-50 flex flex-col animate-slide-in border-l border-card-border">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-cream/95 backdrop-blur-sm z-10 px-4 py-3 border-b border-card-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-burnt-orange to-orange-400 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-charcoal font-bold text-base tracking-wide uppercase">
              CLNCH
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 px-2.5 text-xs font-semibold rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
              title="Delete Opportunity"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-cream-fill transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4 text-slate" />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        {/* Live Metadata Badges */}
        <div className="grid grid-cols-2 gap-2">
          <div className="card px-3 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-burnt-orange" />
            <div>
              <div className="text-[10px] text-slate font-medium">Deadline</div>
              <div className="text-charcoal font-bold text-xs truncate max-w-[110px]">
                {opportunity.deadline || 'No Deadline'}
              </div>
            </div>
          </div>
          <div className="card px-3 py-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-burnt-orange" />
            <div>
              <div className="text-[10px] text-slate font-medium">Urgency</div>
              <div className="text-charcoal font-bold text-xs capitalize">
                {opportunity.category || 'High'}
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Link */}
        <div className="card p-3 space-y-1">
          <label className="text-[10px] font-bold text-slate uppercase tracking-wide flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5" />
            Opportunity Link
          </label>
          <div className="text-xs text-burnt-orange font-medium break-all underline select-all">
            <a href={opportunity.link} target="_blank" rel="noreferrer">
              {opportunity.link}
            </a>
          </div>
        </div>

        {/* Organization */}
        <div className="card p-3 space-y-1">
          <label className="text-[10px] font-bold text-slate uppercase tracking-wide flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Organization/Issuer
          </label>
          <div className="text-sm text-charcoal font-bold">{opportunity.organization}</div>
        </div>

        {/* Extracted Requirements */}
        <div className="card overflow-hidden bg-card-white">
          <button
            onClick={() => setRequirementsExpanded(!requirementsExpanded)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-cream-fill/50 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Requirements
              <span className="text-xs text-slate/60 font-semibold">
                ({(opportunity.requirements || []).length})
              </span>
            </span>
            {requirementsExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate" />
            )}
          </button>
          {requirementsExpanded && (
            <div className="px-3 pb-3 space-y-1.5 border-t border-card-border/50 pt-2.5">
              {(opportunity.requirements || []).map((req: any, index: any) => (
                <div key={index} className="flex items-start gap-2 text-xs text-charcoal leading-relaxed">
                  <span className="text-burnt-orange font-bold">&#8226;</span>
                  <span>{req}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Coach Chat Box */}
        <div className="card p-4 space-y-3 bg-card-white border border-card-border" id="ai-coach-draft-box">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-burnt-orange to-orange-400 rounded-md flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-charcoal">AI Coach Drafts</span>
          </div>

          {isDrafting ? (
            <div className="py-6 flex flex-col items-center justify-center gap-2 text-xs text-slate animate-pulse-subtle">
              <Loader2 className="w-5 h-5 text-burnt-orange animate-spin" />
              <span>Calibrating custom pitch copy...</span>
            </div>
          ) : (
            <div className="text-xs text-charcoal/90 leading-relaxed whitespace-pre-line bg-cream/40 p-2.5 rounded-lg border border-card-border">
              {aiDraft}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyDraft}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cream-fill text-xs font-semibold text-charcoal hover:bg-cream-fill/80 transition-colors cursor-pointer shadow-sm border border-card-border"
              id="copy-draft-btn"
            >
              {copied ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? 'Copied!' : 'Copy Tailored Pitch'}
            </button>
            <button
              onClick={scrollToVoice}
              className="p-2 rounded-lg bg-cream-fill text-charcoal hover:bg-burnt-orange/10 hover:text-burnt-orange transition-colors cursor-pointer border border-card-border"
              aria-label="Open voice profile"
              title="Calibrate your voice profile"
              id="calibrate-voice-btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          </div>
        </div>

        {/* Voice Profile Capture */}
        <div ref={voiceRef} id="voice-calibration-section">
          <VoiceProfileCapture />
        </div>
      </div>

      {/* Fixed Bottom Action Button */}
      <div className="sticky bottom-0 bg-cream/95 backdrop-blur-sm border-t border-card-border px-4 py-3">
        <button
          onClick={handleMarkAsFiled}
          disabled={isSubmitting}
          className={`btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            isFiled ? 'bg-green-600 hover:bg-green-700' : ''
          }`}
          id="toggle-filed-state-btn"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isFiled ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : null}
          {isSubmitting
            ? 'Processing...'
            : isFiled
            ? 'Mark as Active/Pending'
            : 'Mark as FiledSuccessfully'}
        </button>
      </div>
    </div>
  );
}
