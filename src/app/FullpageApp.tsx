import { useState } from 'react';
import { NavigationProvider } from '../features/fullpage/fullpage.adapter';
import { FullpageLayout } from '../features/fullpage/fullpage.components';
import {
  normalizePathname,
  type FullpagePath,
} from '../features/fullpage/fullpage.navigation';
import { FullpageSettingsProvider } from '../features/fullpage/fullpage.settings';
import { FullpageSlider } from '../features/fullpage/fullpage.slider';

export function FullpageApp() {
  const [initialPath] = useState<FullpagePath>(() =>
    normalizePathname(window.location.pathname)
  );

  return (
    <FullpageSettingsProvider>
      <NavigationProvider slug={initialPath}>
        <FullpageLayout>
          <FullpageSlider />
        </FullpageLayout>
      </NavigationProvider>
    </FullpageSettingsProvider>
  );
}
