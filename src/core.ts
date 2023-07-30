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

  type PropsInContainer = Props & {
    container: HTMLElement;
  };

  class ReactWebComponent extends HTMLElement {
    private connected = false;
    private context?: Context;
    private _props = {} as PropsInContainer;
    container: HTMLElement;
    observer: MutationObserver;

    constructor() {
      super();
      this.observer = new MutationObserver((mutations) =>
        this.attributesChanged(mutations)
      );
      this.observer.observe(this, { attributes: true });

      if (options.shadow) {
        this.container = this.attachShadow({
          mode: options.shadow,
        }) as unknown as HTMLElement;
      } else {
        this.container = this;
      }

      this._props.container = this.container;
    }

    public set props(newValue: Props) {
      this._props = {
        ...this._props,
        ...newValue,
      };

      this.update();
    }

    public get props(): Props {
      return this._props;
    }

    connectedCallback() {
      this.connected = true;

      for (const prop of propNames) {
        this.setProps(prop);
      }

      this.mount();
    }

    disconnectedCallback() {
      this.connected = false;

      this.observer.disconnect();
      this.unmount();
    }

    private attributesChanged(mutations: MutationRecord[]) {
      mutations.forEach(({ attributeName }) => {
        this.setProps(attributeName as Extract<keyof Props, string>);
      });

      this.update();
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
      if (prop in reactProps) {
        this._props[prop] = value;
      } else if (value && transform?.parse) {
        //@ts-ignore
        this._props[prop] = transform.parse(value, this);
      }
    }

    private update() {
      if (!this.connected) return;
      if (!this.context) return;

      renderer.update(this.context, this.props);
    }

    private mount() {
      if (!this.connected) throw new Error(`${ReactComponent} is not in a DOM`);
      if (this.context) throw new Error(`${ReactComponent} is already mounted`);

      this.context = renderer.mount(this.container, ReactComponent, this.props);
    }

    private unmount() {
      if (!this.context) return;
      renderer.unmount(this.context);
    }
  }

  return ReactWebComponent;
}

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
