import type { R2WCType } from "./transforms";

import transforms from "./transforms";

type PropName<Props> = Extract<keyof Props, string>;
type PropNames<Props> = Array<PropName<Props>>;

export interface R2WCOptions<Props> {
  shadow?: "open" | "closed";
  props?: PropNames<Props> | Record<PropName<Props>, R2WCType>;
}

export interface R2WCRenderer<Props, Context> {
  mount: (
    container: HTMLElement,
    ReactComponent: React.ComponentType<Props>,
    props: Props
  ) => Context;
  update: (context: Context, props: Props) => void;
  unmount: (context: Context) => void;
}

const REACT_PROPS = "__reactProps";

/**
 * Converts a React component into a Web Component.
 * @param {ReactComponent}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: "string" | "number" | "boolean" | "function" | "json" }
 */
export default function r2wc<Props, Context>(
  ReactComponent: React.ComponentType<Props>,
  options: R2WCOptions<Props>,
  renderer: R2WCRenderer<Props, Context>
): CustomElementConstructor {
  if (!options.props) {
    options.props = ReactComponent.propTypes
      ? (Object.keys(ReactComponent.propTypes) as PropNames<Props>)
      : [];
  }

  const propNames = (
    Array.isArray(options.props)
      ? options.props.slice()
      : (Object.keys(options.props) as PropNames<Props>)
  ).filter((prop) => {
    return prop !== "container";
  });

  const propTypes = {} as Record<PropName<Props>, R2WCType>;
  const mapPropAttribute = {} as Record<PropName<Props>, string>;
  const mapAttributeProp = {} as Record<string, PropName<Props>>;

  for (const prop of propNames) {
    propTypes[prop] = Array.isArray(options.props)
      ? "string"
      : options.props[prop];

    const attribute = toDashedStyle(prop);

    mapPropAttribute[prop] = attribute;
    mapAttributeProp[attribute] = prop;
  }

  class ReactWebComponent extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(mapAttributeProp);
    }

    private connected = true;
    private context?: Context;
    props: Props = {} as Props;
    container: HTMLElement;

    constructor() {
      super();

      if (options.shadow) {
        this.container = this.attachShadow({
          mode: options.shadow,
        }) as unknown as HTMLElement;
      } else {
        this.container = this;
      }

      // @ts-ignore: There won't always be a container in the definition
      this.props.container = this.container;
    }

    connectedCallback() {
      this.connected = true;
      this.render();

      for (const prop of propNames) {
        this.setProps(prop);
      }

      this.update();
    }

    disconnectedCallback() {
      this.connected = false;

      if (this.context) {
        renderer.unmount(this.context);
      }
    }

    attributeChangedCallback(attribute: Extract<keyof Props, string>) {
      this.setProps(attribute);

      this.render();
    }

    private setProps(prop: Extract<keyof Props, string>) {
      const propsForReact = Object.keys(this).find((f) => {
        return f.includes(REACT_PROPS);
      });

      //@ts-ignore
      const reactProps = propsForReact ? this[propsForReact] : {};

      const attribute = mapPropAttribute[prop];
      const value = reactProps[prop] ?? this.getAttribute(attribute);
      const type = propTypes[prop];
      const transform = transforms[type];
      if (reactProps[prop]) {
        this.props[prop] = value;
      } else if (value && transform?.parse) {
        //@ts-ignore
        this.props[prop] = transform.parse(value, this);
      }
    }

    private render() {
      if (!this.connected) return;

      if (!this.context) {
        this.mount();
      } else {
        this.update();
      }
    }

    private update() {
      if (!this.context) return;

      renderer.update(this.context, this.props);
    }

    private mount() {
      this.context = renderer.mount(this.container, ReactComponent, this.props);
    }
  }

  return ReactWebComponent;
}

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
