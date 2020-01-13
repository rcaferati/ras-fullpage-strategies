# React Awesome Slider Navigation HOC strategies
React awesome slider fullpage strategies and usage examples. For more information about the slider itself please access the main repository at [rcaferati/react-awesome-slider](https://github.com/rcaferati/ras-fullpage-strategies)

## Live preview
Access the live preview at: [fullpage.caferati.me](https://fullpage.caferati.me)
[<img width="600" alt="react-awesome-slider demo" src="https://github.com/rcaferati/react-awesome-slider/blob/master/demo/public/images/fullscreen.gif?raw=true">](https://fullpage.caferati.me/)

The `Navigation` HOC exposes a number of methods for dealing with fullpage navigation. The code bellow is a basic concept example, if you want a functional one just check out the [NextJS example folder](https://github.com/rcaferati/ras-fullpage-strategies/tree/master/nextjs-example).

| Method                  | Type                     | Description                                                                        |
| :---------------------- | :----------------------- | :-------------------------------------------------------------------------------- |
| Provider                |  `Context Provider`      | A context provider component for the application to be wrapped in.                |
| withNavigationContext   |  `Context Consumer`      | A navigation context consumer for accessing the navigation object as a prop.      |
| withNavigationHandlers  |  `Navigation Handlers`   | A HOC to add the navigation handlers to your AwesomeSlider instance.              |
| Link                    |  `Link Component`        | A Link component for handling page linking.                                        |

```JS
import AwesomeSlider from "react-awesome-slider"
import 'react-awesome-slider/dist/styles.css';

import { 
  Provider,
  Link,
  withNavigationContext,
  withNavigationHandlers
} from "react-awesome-slider/dist/navigation";

// Wrapp the AwesomeSlider component with the navigationHandlers
const NavigationSlider = withNavigationHandlers(AwesomeSlider);

// Create an AwesomeSlider instance with some content
const Slider = () => {
  return (
    <NavigationSlider
      className="awesome-slider"
      media={[
        {
          slug: "page-one",
          className: "page-one",
          children: () => <p>Page One</p>
        },
        {
          slug: "page-two",
          className: "page-two",
          children: () => <p>Page Two</p>
        }
      ]}
    />
   )
}

// Page header navigation
const Header = () => {
  return (
    <Header>
      <nav>
        <Link href="page-one">Page One</Link>
        <Link href="page-two">Page Two</Link>
      </nav>
    </Header>
  )
}

// Wrapp the aplication with the navigation Provider passing down the current page slug.
const App = () => {
  const slug = "[THE INITIAL RENDERED SLUG]";

  return (
    <Provider slug={slug}>
      <Header />
      <NavigationSlider />
    </Provider>
  )
}

```
