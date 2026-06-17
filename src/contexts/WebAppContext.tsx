import { createContext, useContext, useState } from 'react';

export type WebViewTab = 'home' | 'brief' | 'full';

interface WebAppContextValue {
  activeBoardId: string | undefined;
  setActiveBoardId: (id: string) => void;
  viewTab: WebViewTab;
  setViewTab: (tab: WebViewTab) => void;
  selectedSubGoalPos: number | null;
  setSelectedSubGoalPos: (pos: number | null) => void;
}

const WebAppContext = createContext<WebAppContextValue>({
  activeBoardId: undefined,
  setActiveBoardId: () => {},
  viewTab: 'home',
  setViewTab: () => {},
  selectedSubGoalPos: null,
  setSelectedSubGoalPos: () => {},
});

export function WebAppProvider({ children }: { children: React.ReactNode }) {
  const [activeBoardId, setActiveBoardId] = useState<string | undefined>(undefined);
  const [viewTab, setViewTab] = useState<WebViewTab>('home');
  const [selectedSubGoalPos, setSelectedSubGoalPos] = useState<number | null>(null);

  return (
    <WebAppContext.Provider
      value={{
        activeBoardId,
        setActiveBoardId,
        viewTab,
        setViewTab,
        selectedSubGoalPos,
        setSelectedSubGoalPos,
      }}
    >
      {children}
    </WebAppContext.Provider>
  );
}

export function useWebApp() {
  return useContext(WebAppContext);
}
