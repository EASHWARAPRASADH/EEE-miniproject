import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/encode', label: 'Encode Payload' },
    { path: '/decode', label: 'Decode Payload' },
    { path: '/analysis', label: 'Steganalysis' },
    { path: '/models', label: 'AI Models' },
    { path: '/keys', label: 'Key Management' },
    { path: '/settings', label: 'Settings' },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[220px] border-r border-border bg-secondary p-6">
        <div className="font-[800] text-[18px] tracking-[-0.5px] mb-12 flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded" />
          STEGANO-X
        </div>
        <nav className="flex-1">
          <ul className="space-y-0">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 py-3 text-[14px] font-medium cursor-pointer transition-colors ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="mt-auto text-[11px] text-muted-foreground uppercase">
          SYSTEM VERSION 4.4.2<br />
          GPU ACCELERATED
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-50 flex items-center justify-between px-4">
        <div className="font-[800] text-[18px] tracking-[-0.5px] flex items-center gap-2">
          <div className="w-6 h-6 bg-foreground rounded" />
          STEGANO-X
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background z-40 p-4 border-b border-border">
          <nav>
            <ul className="space-y-0">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 py-3 text-[14px] font-medium cursor-pointer transition-colors ${
                        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-6 md:p-10 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
