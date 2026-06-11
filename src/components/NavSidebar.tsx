import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Compass,
  Briefcase,
  Clock,
  History,
  Settings,
  Globe,
  HelpCircle,
  TrendingUp,
  Download,
  FileText,
  LogOut,
  ChevronUp,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', id: 'home' },
  { icon: Compass, label: 'Discover', id: 'discover' },
  { icon: Briefcase, label: 'Applied', id: 'applied' },
  { icon: Clock, label: 'Pending', id: 'pending' },
  { icon: History, label: 'History', id: 'history' },
];

interface NavSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeNav: string;
  onNavChange: (id: string) => void;
}

export default function NavSidebar({
  collapsed,
  onToggleCollapse,
  activeNav,
  onNavChange,
}: NavSidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const user = {
    name: 'Sandra Mensah',
    email: 'sandramensah7.SM@gmail.com',
    initial: 'S',
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-card-white border-r border-card-border z-30 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-[60px]' : 'w-[240px]'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-card-border min-h-[60px]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-burnt-orange to-orange-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-charcoal text-lg tracking-wide uppercase">
              CLNCH
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-gradient-to-br from-burnt-orange to-orange-400 rounded-lg flex items-center justify-center mx-auto">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-cream-fill transition-colors text-slate cursor-pointer"
            aria-label="Collapse sidebar"
            id="collapse-nav-btn"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapsed expand toggle */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="mt-2 mx-auto p-2 rounded-lg hover:bg-cream-fill transition-colors text-slate cursor-pointer"
          aria-label="Expand sidebar"
          id="expand-nav-btn"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto index-nav">
        {navItems.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            id={`nav-item-${id}`}
            onClick={() => onNavChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group cursor-pointer ${
              activeNav === id
                ? 'bg-cream-fill text-charcoal'
                : 'text-slate hover:bg-cream-fill/60 hover:text-charcoal'
            }`}
          >
            <Icon
              className={`w-4 h-4 flex-shrink-0 ${
                activeNav === id ? 'text-burnt-orange' : 'text-slate group-hover:text-charcoal'
              }`}
            />
            {!collapsed && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="border-t border-card-border p-2 relative" ref={profileRef} id="nav-profile-section">
        {/* Profile Dropdown Menu */}
        {profileOpen && !collapsed && (
          <div className="absolute bottom-full left-2 right-2 mb-1 bg-card-white border border-card-border rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
            <div className="px-4 py-3 border-b border-card-border bg-cream/50">
              <p className="text-xs text-slate truncate font-semibold">{user.name}</p>
              <p className="text-[10px] text-slate/85 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              {[
                { icon: Settings, label: 'Settings', shortcut: '⇧Ctrl,' },
                { icon: Globe, label: 'Language', arrow: true },
                { icon: HelpCircle, label: 'Get help' },
              ].map(({ icon: Icon, label, shortcut, arrow }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-charcoal hover:bg-cream-fill transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 text-slate" />
                    <span>{label}</span>
                  </div>
                  {shortcut && <span className="text-[10px] text-slate/60 font-mono">{shortcut}</span>}
                  {arrow && <ChevronRight className="w-3 h-3 text-slate" />}
                </button>
              ))}
            </div>
            <div className="border-t border-card-border py-1">
              {[
                { icon: TrendingUp, label: 'Upgrade plan' },
                { icon: Download, label: 'Get apps and extensions' },
                { icon: FileText, label: 'Learn more', arrow: true },
              ].map(({ icon: Icon, label, arrow }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-4 py-2 text-xs text-charcoal hover:bg-cream-fill transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 text-slate" />
                    <span>{label}</span>
                  </div>
                  {arrow && <ChevronRight className="w-3 h-3 text-slate" />}
                </button>
              ))}
            </div>
            <div className="border-t border-card-border py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer text-left">
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-cream-fill transition-colors group cursor-pointer ${
            profileOpen ? 'bg-cream-fill' : ''
          }`}
          id="profile-trigger-btn"
        >
          <div className="w-8 h-8 bg-burnt-orange rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white font-semibold text-sm">{user.initial}</span>
          </div>
          {!collapsed && (
            <>
              <span className="text-sm font-medium text-charcoal truncate flex-1 text-left">
                {user.name}
              </span>
              <ChevronUp
                className={`w-4 h-4 text-slate flex-shrink-0 transition-transform ${
                  profileOpen ? 'rotate-0' : 'rotate-180'
                }`}
              />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
