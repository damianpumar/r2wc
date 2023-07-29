import type { Transform } from "./index";

const string: Transform<string> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => (typeof value === "string" ? JSON.parse(value) : value),
};

export default string;
