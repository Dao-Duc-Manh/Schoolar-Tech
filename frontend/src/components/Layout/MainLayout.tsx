import type { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { AIChatWidget } from '@/components/AI';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 min-w-0">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-surface lg:pl-64 flex flex-col">
          <div className="p-6 lg:p-8 min-w-0 flex-1">
            {children}
          </div>
          <Footer />
        </main>
      </div>
      {/* AI Chat Widget */}
      <AIChatWidget />
    </div>
  );
}
