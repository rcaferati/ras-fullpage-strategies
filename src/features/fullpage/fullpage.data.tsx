import { AwesomeButton } from '@rcaferati/react-awesome-button';
import themeC137 from '@rcaferati/react-awesome-button/themes/theme-c137';
import { useMemo, type CSSProperties } from 'react';
import { useFullpageNavigation } from './fullpage.adapter';
import {
  Background,
  ContentPanel,
  Lettering,
  MouseIndicator,
  PageScroller,
  Section,
} from './fullpage.components';
import {
  ROOT_SLUG,
  type FullpageSlug,
  slugToPath,
} from './fullpage.navigation';

export type FullpageSlide = {
  slug: FullpageSlug;
  className: string;
  preload?: string[];
  children: React.ReactNode;
};

const fullpageButtonStyle = {
  '--button-default-height': '54px',
  '--button-large-height': '54px',
} as CSSProperties;

function HomeSlide() {
  const { navigate } = useFullpageNavigation();

  return (
    <Section wrapper={false} backgroundColor="#292c35">
      <ContentPanel
        main={
          <Lettering
            title="INDEX"
            text={[
              'This is a single full page fixed screen.',
              'Use the button bellow to navigate to the next page',
            ]}
          />
        }
        action={
          <div className="button">
            <AwesomeButton
              cssModule={themeC137}
              size="large"
              style={fullpageButtonStyle}
              onPress={() => {
                navigate(slugToPath('page-two'));
              }}
            >
              Goto the next page
            </AwesomeButton>
          </div>
        }
      />
    </Section>
  );
}

function ThirdSlide() {
  const { navigate } = useFullpageNavigation();

  return (
    <Section wrapper={false} backgroundColor="#ff6f5e">
      <Background src="https://caferati.me/images/series/bojack-0.png" />
      <ContentPanel
        main={
          <Lettering
            title="PAGE-THREE"
            text={['This is a screen with preloaded background image.']}
          />
        }
        action={
          <div className="button">
            <AwesomeButton
              cssModule={themeC137}
              size="large"
              style={fullpageButtonStyle}
              onPress={() => {
                navigate(slugToPath('page-two'));
              }}
            >
              Goto the prev page
            </AwesomeButton>
          </div>
        }
      />
    </Section>
  );
}

export function useFullpageSlides(): FullpageSlide[] {
  return useMemo(
    () => [
      {
        slug: ROOT_SLUG,
        className: 'slide page-one',
        children: <HomeSlide />,
      },
      {
        slug: 'page-two',
        className: 'sectioned page-two',
        children: (
          <PageScroller>
            <Section wrapper={false} backgroundColor="#4158b4">
              <ContentPanel
                main={
                  <Lettering
                    title="PAGE-TWO"
                    text={[
                      'This is multiple section page, scroll down to view more content.',
                    ]}
                  />
                }
                action={<MouseIndicator />}
              />
            </Section>
            <Section backgroundColor="#617be3">
              <Lettering
                title="PAGE-SECTION"
                text={['This is a continued page section.']}
              />
            </Section>
          </PageScroller>
        ),
      },
      {
        slug: 'page-three',
        preload: ['https://caferati.me/images/series/bojack-0.png'],
        className: 'slide page-three',
        children: <ThirdSlide />,
      },
    ],
    []
  );
}
