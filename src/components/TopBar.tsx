import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  LayoutList,
  LayoutGrid,
  SlidersHorizontal,
  ChevronDown,
  GraduationCap,
  DollarSign,
  Rocket,
  Briefcase,
  Building2,
  Check,
} from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface Category {
  id: string;
  label: string;
  icon: React.ElementType;
}

const categories: Category[] = [
  { id: 'fellowship', label: 'Fellowship', icon: GraduationCap },
  { id: 'grant', label: 'Grant', icon: DollarSign },
  { id: 'accelerator', label: 'Accelerator', icon: Rocket },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'conference', label: 'Conference', icon: Building2 },
];

interface TopBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (id: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function TopBar({
  viewMode,
  onViewModeChange,
  search,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
}: TopBarProps) {
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const greeting = getGreeting();
  const userName = 'Sandra';

  return (
    <header className="h-[60px] bg-card-white border-b border-card-border flex items-center px-6 gap-6 sticky top-0 z-20">
      {/* Greeting */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm sm:text-base font-semibold text-charcoal leading-tight truncate">
          {greeting}, {userName}.
        </h2>
        <p className="text-[10px] sm:text-xs text-slate leading-tight truncate">
          Start with a link — CLNCH handles the rest.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="relative hidden xs:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Ask me anything..."
            className="pl-9 pr-4 py-1.5 w-[150px] sm:w-[220px] bg-cream border border-card-border rounded-full text-xs text-charcoal placeholder:text-slate/50 focus:outline-none focus:ring-2 focus:ring-burnt-orange/20 focus:border-burnt-orange/40 transition-all"
            id="search-input-field"
          />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-card-border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-cream-fill text-charcoal font-semibold'
                : 'text-slate hover:bg-cream-fill/60'
            }`}
            aria-label="List view"
            id="list-view-btn"
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-cream-fill text-charcoal font-semibold'
                : 'text-slate hover:bg-cream-fill/60'
            }`}
            aria-label="Grid view"
            id="grid-view-btn"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Dropdown */}
        <div className="relative" ref={catRef} id="categories-filter-wrapper">
          <button
            onClick={() => setCatOpen(!catOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              catOpen || selectedCategories.length > 0
                ? 'bg-cream-fill border-burnt-orange/30 text-charcoal'
                : 'border-card-border text-slate hover:bg-cream-fill/60 hover:text-charcoal'
            }`}
            id="categories-filter-toggle"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Categories</span>
            {selectedCategories.length > 0 && (
              <span className="bg-burnt-orange text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {selectedCategories.length}
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${catOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {catOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-[200px] bg-card-white border border-card-border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-3 py-2 border-b border-card-border bg-cream/30">
                <p className="text-[10px] font-bold text-slate uppercase tracking-wide">
                  Filter by Category
                </p>
              </div>
              <div className="py-1">
                {categories.map(({ id, label, icon: Icon }) => {
                  const active = selectedCategories.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => onCategoryToggle(id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-cream-fill transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-burnt-orange' : 'text-slate'}`} />
                        <span className={active ? 'text-charcoal font-semibold' : 'text-charcoal'}>
                          {label}
                        </span>
                      </div>
                      {active && <Check className="w-3.5 h-3.5 text-burnt-orange font-bold" />}
                    </button>
                  );
                })}
              </div>
              {selectedCategories.length > 0 && (
                <div className="border-t border-card-border px-3 py-1.5 bg-cream/10">
                  <button
                    onClick={() => selectedCategories.forEach((id) => onCategoryToggle(id))}
                    className="text-[10px] text-slate hover:text-burnt-orange transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
