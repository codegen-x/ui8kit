// The language of the visit, shared by the storefront and the detail page (lib/i18n.ts keeps it on this device), and the last
// storefront route, the detail page's way back.
import { readLocale } from "./i18n";

export const visit = $state<{ locale: ReturnType<typeof readLocale>; back: string }>({ locale: readLocale(), back: "#/search" });
