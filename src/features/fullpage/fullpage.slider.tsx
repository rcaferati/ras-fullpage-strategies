import { useEffect, useRef } from 'react';
import {
  AwesomeSlider,
  withNavigationHandlers,
} from './fullpage.adapter';
import { useFullpageSlides } from './fullpage.data';
import { StartupScreen } from './fullpage.components';
import { useFullpageSettings } from './fullpage.settings';

const NavigationSlider = withNavigationHandlers(AwesomeSlider);

export function FullpageSlider() {
  const slides = useFullpageSlides();
  const { animation } = useFullpageSettings();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    document.body.classList.remove('animated', 'visible');

    return () => {
      document.body.classList.remove('animated', 'visible');
    };
  }, []);

  return (
    <NavigationSlider
      startupScreen={<StartupScreen />}
      startupDelay={1375}
      animation={animation}
      className="awesome-slider"
      onTransitionEnd={() => {
        if (!isFirstLoad.current) {
          return;
        }

        document.body.classList.add('animated');
        document.body.classList.add('visible');
        isFirstLoad.current = false;
      }}
      media={slides}
    />
  );
}
