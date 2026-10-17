// The central Codex field maps: one map per entry kind, from a v0.4 entry to the record a kit block reads
// (`fromCodex(entries, CODEX_FIELDS.product)`). Every runtime and every hand-written app reads the same map, so a
// block's data contract lives in one place (xgen/schema/codex/blocks.json lists which block reads which map).
// Paths: top-level entry fields ("title", "excerpt") or "metadata.<field>.value" of a field declared for the kind in
// xgen/schema/codex/manifest.json; a pipe names a formatter of readPath: "|date" and "|ago" format in the locale, "|route" builds
// the address from the slug (no href in data), "|media" takes the file of the `media` entry of featured_media_id,
// "|author" the display name of the `user` entry of author_id, "|term:<taxonomy>" the name of the entry's term of that taxonomy
// ("|term-slug:<taxonomy>" its slug), "|number" the number in the locale with the entry's `metadata.unit`.

/** kind `product` -> Product (ProductGrid, ProductDetail, ProductCard) */
export const productFields = {
  id: "id",
  name: "title",
  summary: "metadata.summary.value",
  price: "metadata.price.value",
  currency: "metadata.currency.value",
  rating: "metadata.rating.value",
  reviews: "metadata.reviews.value",
  badge: "metadata.badge.value",
  category: "terms|term:product_category",
  inStock: "metadata.inStock.value",
  compareAt: "metadata.compare_at.value",
  href: "slug|route",
  image: "featured_media_id|media",
} as const;

/** kind `post` -> Post (PostHeader, PostGrid, PostCard) */
export const postFields = {
  id: "id",
  title: "title",
  excerpt: "excerpt",
  category: "terms|term:category",
  author: "author_id|author",
  date: "metadata.date.value|date",
  minutes: "metadata.minutes.value",
  icon: "metadata.icon.value",
  href: "slug|route",
  image: "featured_media_id|media",
} as const;

/** kind `plan` -> Plan (PricingTiers, PricingCard) */
export const planFields = {
  id: "id",
  name: "title",
  tagline: "metadata.tagline.value",
  price: "metadata.price.value",
  currency: "metadata.currency.value",
  seats: "metadata.seats.value",
  storage: "metadata.storage.value",
  highlighted: "metadata.highlighted.value",
  features: "metadata.features.value",
  yearly: "metadata.yearly.value",
} as const;

/** kind `review` -> Review (ProductReviews, Reviews) */
export const reviewFields = {
  id: "id",
  title: "title",
  author: "author_id|author",
  rating: "metadata.rating.value",
  text: "metadata.text.value",
  date: "metadata.date.value|date",
} as const;

/** kind `stat` -> Stat (StatsBand, PageTrail facts, StatTile): `value` is a number with an optional `unit`, formatted in the locale */
export const statFields = {
  id: "id",
  label: "title",
  value: "metadata.value.value|number",
  icon: "metadata.icon.value",
  hint: "metadata.hint.value",
} as const;

/** kind `faq` -> Faq (FaqList): `category` is the slug of the entry's term of the taxonomy faq_category (the key the tabs filter by) */
export const faqFields = {
  id: "id",
  question: "title",
  answer: "metadata.answer.value",
  category: "terms|term-slug:faq_category",
} as const;

/** kind `tab` -> FaqTab (FaqList category tabs): `value` is the slug of a faq_category term ("" = all) */
export const faqTabFields = {
  id: "id",
  title: "title",
  value: "metadata.value.value",
} as const;

/** kind `page` -> NavLink of a breadcrumb trail (PageTrail): the pages of a parent_id chain; `href` only where the app routes pages */
export const pageFields = {
  id: "id",
  name: "title",
  icon: "metadata.icon.value",
  href: "slug|route",
} as const;

/** kind `menu_item` -> NavLink (NavBar, SidebarNav, BottomNav, ShellSidebar, the sub nav, outlines and help links): a menu entry
 *  (Codex v0.4 Menu item: label = title, the address from the slug); `href` only where the app routes menu items, else no link */
export const menuItemFields = {
  id: "id",
  name: "title",
  icon: "metadata.icon.value",
  href: "slug|route",
} as const;

/** kind `menu_item` with children -> MegaGroup (SitemapFooter, FooterColumns, FooterCard, MegaMenu, FooterSplit): a group of a
 *  menu and the items under it (parent_id), resolved through the lookup CODEX.menus */
export const menuGroupFields = {
  id: "id",
  title: "title",
  icon: "metadata.icon.value",
  links: "id|menu",
  href: "slug|route",
} as const;

/** kind `menu_item` (location categories) -> Category (CategoryNav): a menu entry with the number of products under it */
export const menuCategoryFields = {
  id: "id",
  name: "title",
  icon: "metadata.icon.value",
  count: "metadata.count.value",
  href: "slug|route",
} as const;

/** the field maps by entry kind */
export const CODEX_FIELDS = {
  product: productFields, post: postFields, plan: planFields, review: reviewFields, stat: statFields, faq: faqFields, faqtab: faqTabFields, page: pageFields,
  menuItem: menuItemFields, menuGroup: menuGroupFields, menuCategory: menuCategoryFields,
} as const;
export type CodexFieldKind = keyof typeof CODEX_FIELDS;
