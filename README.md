# React Awesome Slider Navigation HOC strategies
React awesome slider fullpage strategies and usage examples.


The `Navigation` HOC exposes a number of methods for dealing with fullpage navigation. The code bellow is a basic concept example, if you want a functional one just check out the NextJS folder.


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

// Wrapp the aplication with the navigation Provider passing down to current page slug.
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
