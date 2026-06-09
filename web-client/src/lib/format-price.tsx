const priceFormatter = Intl.NumberFormat("es-CO");

export function formatPrice(price: number) {
  return `$${priceFormatter.format(price / 100)}`;
}
