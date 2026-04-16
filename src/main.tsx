import { createRoot } from 'react-dom/client';
import '@rcaferati/react-awesome-slider/styles.css';
import '@rcaferati/react-awesome-slider/custom-animations/cube-animation.css';
import '@rcaferati/react-awesome-slider/custom-animations/fall-animation.css';
import '@rcaferati/react-awesome-slider/custom-animations/fold-out-animation.css';
import '@rcaferati/react-awesome-slider/custom-animations/open-animation.css';
import '@rcaferati/react-awesome-slider/custom-animations/scale-out-animation.css';
import '@rcaferati/react-awesome-button/themes/theme-c137.css';
import './index.css';
import { FullpageApp } from './app/FullpageApp';

createRoot(document.getElementById('root')!).render(<FullpageApp />);
