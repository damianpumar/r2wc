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

Note that by using React 18, `r2wc` will use the new root API. If your application needs the legacy API, please use React 17

In the above case, the web-greeting custom element is not making use of the `name` property from our `Greeting` component.

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
