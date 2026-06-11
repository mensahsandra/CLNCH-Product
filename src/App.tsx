import React, { useState, useEffect } from 'react';
import { Plus, FolderOpen, Loader2 } from 'lucide-react';
import NavSidebar from './components/NavSidebar';
import TopBar, { type ViewMode } from './components/TopBar';
import Sidebar from './components/Sidebar';
import FastCaptureModal from './components/FastCaptureModal';
import {
  processOpportunityUrl,
  createOpportunity,
  getOpportunities,
  updateOpportunityStatus,
  type Opportunity,
} from './services/opportunityService';

const CATEGORY_LABELS: Record<string, string> = {
  fellowship: 'Fellowship',
  grant: 'Grant',
  accelerator: 'Accelerator',
  job: 'Job',
  conference: 'Conference',
};

export default function App() {
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // DB States
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOpps = async () => {
    setIsLoading(true);
    try {
      const data = await getOpportunities();
      setOpportunities(data);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOpps();
  }, []);

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleCaptureSubmit = async (data: { link: string; category: string }) => {
    // Call AI Extraction Service (Gemini powered server route)
    const extraction = await processOpportunityUrl(data.link);
    const newOpp = await createOpportunity({
      link: data.link,
      organization: extraction.organization || 'Opportunity Issuer',
      category: data.category,
      requirements: extraction.requirements || [],
      deadline: extraction.deadline,
      status: 'pending',
    });

    setOpportunities((prev) => [newOpp, ...prev]);
    setSelectedOpp(newOpp);
    setDetailPanelOpen(true);
  };

  const handleUpdateOpportunity = async (updated: Opportunity) => {
    if (!updated.id) return;
    const result = await updateOpportunityStatus(updated.id, updated.status);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === updated.id ? { ...o, status: result.status } : o))
    );
    setSelectedOpp((current) =>
      current && current.id === updated.id ? { ...current, status: result.status } : current
    );
  };

  const handleDeleteOpportunity = async (id: string) => {
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    if (selectedOpp?.id === id) {
      setSelectedOpp(null);
      setDetailPanelOpen(false);
    }
  };

  const handleSelectOpp = (opp: Opportunity) => {
    setSelectedOpp(opp);
    setDetailPanelOpen(true);
  };

  // Filter based on active navigation tab and search/categories
  const filtered = opportunities.filter((o) => {
    // 1. Navigation Tab filter
    if (activeNav === 'applied' && o.status !== 'applied') return false;
    if (activeNav === 'pending' && o.status !== 'pending') return false;
    if (activeNav === 'history' && o.status !== 'filed') return false;

    // 2. Search query filter
    const matchesSearch =
      !search ||
      (o.organization || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.requirements || []).some((r) => r.toLowerCase().includes(search.toLowerCase())) ||
      (o.link || '').toLowerCase().includes(search.toLowerCase());

    // 3. Category select filter
    const matchesCat =
      selectedCategories.length === 0 || selectedCategories.includes(o.category);

    return matchesSearch && matchesCat;
  });

  const navWidth = navCollapsed ? 60 : 240;
  const detailWidth = detailPanelOpen ? 360 : 0;

  return (
    <div className="flex h-screen bg-cream overflow-hidden">
      {/* Left Navigation Sidebar */}
      <NavSidebar
        collapsed={navCollapsed}
        onToggleCollapse={() => setNavCollapsed(!navCollapsed)}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      {/* Main Content Area */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: navWidth, marginRight: detailWidth }}
      >
        {/* Top Bar */}
        <TopBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          search={search}
          onSearchChange={setSearch}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6 bg-cream">
          {/* Active filters badge row */}
          {selectedCategories.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {selectedCategories.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-burnt-orange/10 text-burnt-orange rounded-full font-semibold border border-burnt-orange/20"
                >
                  {CATEGORY_LABELS[id] || id}
                  <button
                    onClick={() => handleCategoryToggle(id)}
                    className="hover:text-burnt-orange/70 leading-none text-sm font-bold ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <Loader2 className="w-8 h-8 text-burnt-orange animate-spin" />
              <p className="text-sm text-slate mt-3 font-semibold animate-pulse-subtle">
                Initializing Opportunity Index...
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onAdd={() => setModalOpen(true)} />
          ) : viewMode === 'grid' ? (
            <GridView opps={filtered} selectedId={selectedOpp?.id} onSelect={handleSelectOpp} />
          ) : (
            <ListView opps={filtered} selectedId={selectedOpp?.id} onSelect={handleSelectOpp} />
          )}
        </main>
      </div>

      {/* Right Detail Sidebar */}
      {detailPanelOpen && selectedOpp && (
        <Sidebar
          onClose={() => setDetailPanelOpen(false)}
          opportunity={selectedOpp}
          onUpdateOpportunity={handleUpdateOpportunity}
          onDeleteOpportunity={handleDeleteOpportunity}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-8 w-14 h-14 bg-burnt-orange text-white rounded-full shadow-2xl hover:bg-burnt-orange/90 active:scale-95 transition-all z-40 flex items-center justify-center group cursor-pointer"
        style={{ right: detailPanelOpen ? '384px' : '32px' }}
        aria-label="Add new opportunity"
        id="floating-add-btn"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Fast Capture Modal */}
      <FastCaptureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCaptureSubmit}
      />
    </div>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center select-none" id="empty-state-card">
      <div className="w-16 h-16 mb-5 text-card-border">
        <FolderOpen className="w-full h-full" strokeWidth={1} />
      </div>
      <p className="text-base font-semibold text-slate mb-1">No opportunities recorded</p>
      <p className="text-xs text-slate/70 mb-5">
        Try paste-capturing a new program link or clear active category filters.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-burnt-orange text-white text-xs font-bold rounded-lg hover:bg-burnt-orange/90 active:scale-95 transition-all cursor-pointer shadow-md"
        id="empty-add-btn"
      >
        Capture First Link
      </button>
    </div>
  );
}

/* ─── Opportunity Card ────────────────────────────────────── */
const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border border-yellow-150',
  applied: 'bg-blue-50 text-blue-700 border border-blue-150',
  filed: 'bg-green-50 text-green-700 border border-green-150',
};

function OppCard({
  opp,
  selected,
  onSelect,
}: {
  opp: Opportunity;
  selected: boolean;
  onSelect: (opp: Opportunity) => void;
  key?: any;
}) {
  const daysLeft = opp.deadline
    ? Math.max(0, Math.ceil((new Date(opp.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)))
    : null;

  return (
    <div
      onClick={() => onSelect(opp)}
      className={`card p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group flex flex-col justify-between ${
        selected ? 'ring-2 ring-burnt-orange border-transparent bg-cream-fill/20' : 'bg-card-white border-card-border'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[10px] px-2 py-0.5 bg-cream rounded-md text-slate capitalize font-semibold border border-card-border">
            {CATEGORY_LABELS[opp.category] || opp.category}
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${statusColors[opp.status] || 'bg-gray-100 text-slate'}`}>
            {opp.status}
          </span>
        </div>
        <h3 className="font-bold text-charcoal mb-1 text-sm leading-snug group-hover:text-burnt-orange transition-colors line-clamp-2">
          {opp.organization}
        </h3>
        <p className="text-[10.5px] text-slate line-clamp-3 leading-relaxed mb-3">
          {(opp.requirements || []).join(' • ') || 'No requirement extracted yet.'}
        </p>
      </div>
      <div className="flex items-center justify-between border-t border-card-border/40 pt-2.5">
        <span className="text-[10px] text-slate/70 font-semibold">
          {daysLeft !== null ? `${daysLeft} days remaining` : 'TBD Deadline'}
        </span>
        <span className="text-[10px] font-bold text-burnt-orange hover:underline">
          Manage Pitch &#129130;
        </span>
      </div>
    </div>
  );
}

function GridView({
  opps,
  selectedId,
  onSelect,
}: {
  opps: Opportunity[];
  selectedId: string | undefined;
  onSelect: (opp: Opportunity) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" id="grid-view-container">
      {opps.map((o) => (
        <OppCard key={o.id} opp={o} selected={o.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}

function ListView({
  opps,
  selectedId,
  onSelect,
}: {
  opps: Opportunity[];
  selectedId: string | undefined;
  onSelect: (opp: Opportunity) => void;
}) {
  return (
    <div className="space-y-3" id="list-view-container">
      {opps.map((o) => (
        <div
          key={o.id}
          onClick={() => onSelect(o)}
          className={`card px-5 py-4 flex items-center justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group ${
            o.id === selectedId ? 'ring-2 ring-burnt-orange border-transparent bg-cream-fill/20' : 'bg-card-white border-card-border'
          }`}
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-charcoal text-sm truncate group-hover:text-burnt-orange transition-colors">
                {o.organization}
              </h3>
            </div>
            <p className="text-xs text-slate truncate">
              {(o.requirements || []).join(' • ') || o.link}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-[10px] text-slate/70 hidden sm:block font-semibold">
              {o.deadline || 'TBD Deadline'}
            </span>
            <span className="text-[10pt] px-2 py-0.5 bg-cream rounded-md text-slate capitalize hidden md:block border border-card-border font-medium">
              {CATEGORY_LABELS[o.category] || o.category}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${statusColors[o.status] || 'bg-gray-100 text-slate'}`}>
              {o.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
