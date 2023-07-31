# R2WC 🎯

## Basic Use 🚀

For basic usage, we will use this simple React component:

```js
const Greeting = () => {
  return <h1>Hello, World!</h1>;
};
```

With our React component complete, all we have to do is call `r2wc` and [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) to create and define our custom element:

```js
import { r2wc } from "r2wc";

const WebGreeting = r2wc(Greeting);

customElements.define("web-greeting", WebGreeting);
```

Now we can use `<web-greeting>` like any other HTML element!

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting></web-greeting>
</body>
```

## Working with Attributes

By default, custom elements created by `r2wc` only pass properties to the underlying React component. To make attributes work, you must specify your component's props.

```js
const Greeting = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

const WebGreeting = r2wc(Greeting, {
  props: {
    name: "string",
  },
});
```

Now `r2wc` will know to look for `name` attributes
as follows:

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting name="Justin"></web-greeting>
</body>
```

## Working with complex attributes and functions callback

#### React component

```jsx
const component = r2wc(App, {
  props: {
    onCountUpdated: "function",
    title: "string",
    complex: "json",
  },
});
customElements.define("app-component", component);
```

#### React consumer

```jsx
function App() {
  useScript("http://localhost:3000/index.es.js");

  const [count, setCount] = useState(0);
  const func = (count: number) => {
    setCount(count);
  };
  const [title, setTitle] = useState("");
  const [complex, setComplex] = useState({
    name: "",
    value: "",
  });

  useEffect(() => {
    setTitle(count % 2 === 0 ? "Foo" : "Bar");
    setComplex({
      name: `Counter is: ${count}`,
      value: `Value: ${count}`,
    });
  }, [count]);

  return (
    <>
      <h2>Consumer</h2>
      <app-component
        onCountUpdated={func}
        title={title}
        complex={complex}
      ></app-component>
    </>
  );
}
```

#### Vanilla js

```html
<body>
  <div id="root">
    <h2>Consumer</h2>
    <app-component
      id="app"
      on-count-updated="onUpdated"
      title=""
      complex="{}"
    ></app-component>
  </div>

  <script>
    window.onload = () => {
      onUpdated(0);
    };

    const app = document.getElementById("app");

    function onUpdated(count) {
      console.log(count);

      app.props = {
        title: count % 2 === 0 ? "Foo" : "Bar",
        complex: {
          name: `Counter is: ${count}`,
          value: `Value: ${count}`,
        },
      };
    }
  </script>
  <script src="http://localhost:3000/index.es.js"></script>
</body>
```

## Setup 🔨

To install from npm:

```
npm install r2wc
```

## Contributing 🙏

Contributions are always welcome!

## FAQ ？

Based on https://github.com/bitovi/react-to-web-component

## License ⚖️

[MIT](https://choosealicense.com/licenses/mit/)

```

```
