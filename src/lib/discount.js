/**
 * Returns the discounted price if the product has an active, non-expired discount.
 * Returns null if there is no discount or it has expired.
 */
export function getDiscountedPrice(product) {
  if (!product.discountType || !product.discountValue || !product.discountExpiry) return null;
  if (new Date(product.discountExpiry) < new Date()) return null;

  if (product.discountType === "percent") {
    return Math.round(product.price * (1 - product.discountValue / 100));
  }
  // absolute
  return Math.max(0, product.price - product.discountValue);
}

/**
 * Returns the effective price (discounted if active, else regular).
 */
export function getEffectivePrice(product) {
  return getDiscountedPrice(product) ?? product.price;
}
