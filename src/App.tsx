import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { EditorView } from './components/Editor/EditorView';
import { RoundVideoModal } from './components/Editor/RoundVideoModal';

const AppContent: React.FC = () => {
  const { currentView, theme } = useApp();
  const [isRoundVideoOpen, setIsRoundVideoOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [currentView]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'telegram'
          ? 'bg-[#17212b] text-[#f5f5f5]'
          : theme === 'light'
          ? 'bg-[#f1f5f9] text-[#0f172a]'
          : 'bg-[#0b131e] text-[#f8fafc]'
      }`}
    >
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-start w-full">
        {currentView === 'dashboard' ? (
          <DashboardView onOpenRoundVideo={() => setIsRoundVideoOpen(true)} />
        ) : (
          <EditorView />
        )}
      </main>

      {/* Round Video Modal */}
      <RoundVideoModal
        isOpen={isRoundVideoOpen}
        onClose={() => setIsRoundVideoOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
