import { create } from "zustand"

const useCartStore = create((set, get) => ({
    // Cart state
    cart: {},
    paidAmount: 0,
    change: 0,
    selectedProducts: [],

    // Queue state
    queue: [],

    // Cart actions
    updateCart: (product, change) => {
        set((state) => {
            const quantity = (state.cart[product.id]?.quantity || 0) + change

            if (quantity <= 0) {
                const newCart = { ...state.cart }
                delete newCart[product.id]
                return { cart: newCart }
            }

            // Prevent adding more than stock_quantity
            if (
                product.stock_quantity !== undefined &&
                quantity > product.stock_quantity
            ) {
                return state
            }

            return {
                cart: {
                    ...state.cart,
                    [product.id]: { ...product, quantity },
                },
            }
        })
    },

    setPaidAmount: (amount) => {
        set({ paidAmount: amount })
    },

    setChange: (amount) => {
        set({ change: amount })
    },

    addSelectedProduct: (product) => {
        set((state) => {
            const exists = state.selectedProducts.find(
                (p) => p.id === product.id
            )
            if (exists) return state // Don't add duplicates
            return {
                selectedProducts: [...state.selectedProducts, product],
            }
        })
    },

    removeSelectedProduct: (productId) => {
        set((state) => ({
            selectedProducts: state.selectedProducts.filter(
                (p) => p.id !== productId
            ),
        }))
    },

    clearCart: () => {
        set({
            cart: {},
            paidAmount: 0,
            change: 0,
            selectedProducts: [],
        })
    },

    // Queue actions
    addToQueue: () => {
        const state = get()
        if (Object.keys(state.cart).length === 0) return

        set((state) => ({
            queue: [
                ...state.queue,
                {
                    cart: state.cart,
                    paidAmount: state.paidAmount,
                    change: state.change,
                    selectedProducts: state.selectedProducts,
                    timestamp: Date.now(),
                },
            ],
        }))

        // Clear current cart after adding to queue
        get().clearCart()
    },

    loadQueuedCart: (idx) => {
        set((state) => {
            const queued = state.queue[idx]
            if (!queued) return state

            return {
                cart: queued.cart,
                paidAmount: queued.paidAmount,
                change: queued.change,
                selectedProducts: queued.selectedProducts,
                queue: state.queue.filter((_, i) => i !== idx),
            }
        })
    },

    removeFromQueue: (idx) => {
        set((state) => ({
            queue: state.queue.filter((_, i) => i !== idx),
        }))
    },

    clearQueue: () => {
        set({ queue: [] })
    },

    // Computed values
    getSubtotal: () => {
        const state = get()
        return Object.values(state.cart).reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        )
    },

    getTax: () => {
        const subtotal = get().getSubtotal()
        return +(subtotal * 0.05).toFixed(2)
    },

    getTotal: () => {
        const subtotal = get().getSubtotal()
        const tax = get().getTax()
        return +(subtotal + tax).toFixed(2)
    },

    // Utility actions
    resetAll: () => {
        set({
            cart: {},
            paidAmount: 0,
            change: 0,
            selectedProducts: [],
            queue: [],
        })
    },
}))

export default useCartStore
