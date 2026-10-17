// The central Codex field maps: one map per entry kind, from a v0.4 entry to the record a kit block reads
// (`fromCodex(entries, CODEX_FIELDS.product)`). Every runtime and every hand-written app reads the same map, so a
// block's data contract lives in one place (xgen/schema/codex/blocks.json lists which block reads which map).
// Paths: top-level entry fields ("title", "excerpt") or "metadata.<field>.value" of a field declared for the kind in
// xgen/schema/codex/manifest.json; a pipe names a formatter of readPath: "|date" and "|ago" format in the locale, "|route" builds
// the address from the slug (no href in data), "|media" takes the file of the `media` entry of featured_media_id,
// "|author" the display name of the `user` entry of author_id, "|term:<taxonomy>" the name of the entry's term of that taxonomy.

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

/** the field maps by entry kind */
export const CODEX_FIELDS = { product: productFields, post: postFields, plan: planFields, review: reviewFields } as const;
export type CodexFieldKind = keyof typeof CODEX_FIELDS;
