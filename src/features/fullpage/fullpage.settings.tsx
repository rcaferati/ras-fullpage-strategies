import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_ANIMATION,
  type FullpageAnimation,
} from './fullpage.navigation';

type FullpageSettingsValue = {
  animation: FullpageAnimation;
  setAnimation: (next: FullpageAnimation) => void;
};

const FullpageSettingsContext = createContext<FullpageSettingsValue | null>(
  null
);

export function FullpageSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [animation, setAnimation] =
    useState<FullpageAnimation>(DEFAULT_ANIMATION);

  const value = useMemo(
    () => ({
      animation,
      setAnimation,
    }),
    [animation]
  );

  return (
    <FullpageSettingsContext.Provider value={value}>
      {children}
    </FullpageSettingsContext.Provider>
  );
}

export function useFullpageSettings(): FullpageSettingsValue {
  const value = useContext(FullpageSettingsContext);

  if (!value) {
    throw new Error(
      'useFullpageSettings must be used inside FullpageSettingsProvider'
    );
  }

  return value;
}
