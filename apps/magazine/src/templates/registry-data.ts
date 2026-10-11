import { makeData, type TemplateData } from "./data";
const cache = new Map<string, TemplateData>();
/** the template data for one deck wordmark (built once) */
export const dataFor = (brand: string): TemplateData => {
  let d = cache.get(brand);
  if (!d) { d = makeData(brand); cache.set(brand, d); }
  return d;
};
