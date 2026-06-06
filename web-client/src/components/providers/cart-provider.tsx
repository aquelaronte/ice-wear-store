"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string
  variants: Record<string, string>
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, "id" | "quantity">, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  totalItems: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

function makeId(slug: string, variants: Record<string, string>) {
  const variantKey = Object.entries(variants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join("|")
  return `${slug}__${variantKey}`
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback(
    (item: Omit<CartItem, "id" | "quantity">, quantity = 1) => {
      const id = makeId(item.slug, item.variants)
      setItems((prev) => {
        const existing = prev.find((i) => i.id === id)
        if (existing) {
          return prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i))
        }
        return [...prev, { ...item, id, quantity }]
      })
      setIsOpen(true)
    },
    [],
  )

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    )
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within a CartProvider")
  return ctx
}
