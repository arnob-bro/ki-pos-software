import { useCallback, useEffect, useRef, useState } from "react"
import "./pos.css"
import Sidebar from "../../components/Sidebar"
import useCartStore from "../../stores/cartStore"
import useLanguageStore from "../../stores/languageStore"
import useUserStore from "../../stores/userStore"
import ProductAPI from "../../apis/ProductAPI"
import TransactionAPI from "../../apis/TransactionAPI"

function POS() {
    const language = useLanguageStore((state) => state.language)
    const t = (en, de) => (language === "de" ? de : en)
    const [products, setProducts] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [barcodeSearch, setBarcodeSearch] = useState("")
    const [filteredProducts, setFilteredProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const searchInputRef = useRef(null)
    const debounceTimeout = useRef()
    const [showQueueDropdown, setShowQueueDropdown] = useState(false)
    const [payment_method, setPaymentMethod] = useState("cash")
    const [checkoutStatus, setCheckoutStatus] = useState(null) // 'success', 'error', null
    const [isCheckingOut, setIsCheckingOut] = useState(false)

    // Cart store
    const {
        cart,
        paidAmount,
        change,
        selectedProducts,
        queue,
        updateCart,
        setPaidAmount,
        setChange,
        addSelectedProduct,
        removeSelectedProduct,
        clearCart,
        addToQueue,
        loadQueuedCart,
        getSubtotal,
        getTax,
        getTotal,
        removeFromQueue,
    } = useCartStore()
    const currentUser = useUserStore((state) => state.user)

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const result = await ProductAPI.listProducts(1, 50)
            setProducts(result.products || result)
            setFilteredProducts(result.products || result)
        } catch (e) {
            setProducts([])
            setFilteredProducts([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Search products from backend
    useEffect(() => {
        fetchProducts()
    }, [fetchProducts])

    // debounce for search
    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current)
        }

        if (!searchTerm.trim()) {
            setFilteredProducts(products)
            setShowDropdown(false)
            setLoading(false)
            return
        }

        // Set loading state for search
        setLoading(true)

        // Don't show dropdown immediately - wait for search results
        debounceTimeout.current = setTimeout(async () => {
            try {
                const result = await ProductAPI.searchProducts(searchTerm, 50)
                const searchResults = result.products || []
                setFilteredProducts(searchResults)
                // Only show dropdown if we have results and search term still exists
                setShowDropdown(
                    searchResults.length > 0 && searchTerm.trim().length > 0
                )
            } catch (e) {
                setFilteredProducts([])
                setShowDropdown(false)
            } finally {
                setLoading(false)
            }
        }, 300) // debounce time is 300 here

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        }
    }, [searchTerm, products])

    // Hide dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchInputRef.current &&
                !searchInputRef.current.contains(event.target)
            ) {
                setShowDropdown(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Update change when paid amount or total changes
    useEffect(() => {
        const total = getTotal()
        setChange(Math.max(0, paidAmount - total))
    }, [paidAmount, getTotal, setChange])

    const subtotal = getSubtotal()
    const tax = getTax()
    const total = getTotal()

    const handleCheckout = async (payment_method) => {
        if (Object.keys(cart).length === 0 || isCheckingOut) return

        setIsCheckingOut(true)
        setCheckoutStatus(null)

        const transactionData = {
            user_id: currentUser.id,
            payment_method,
            total_amount: total,
            vat_amount: tax,
            discount_amount: 0,
            items: Object.values(cart).map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                vat_amount: 0,
                discount_applied: 0,
            })),
        }

        console.log(
            "DEBUG: Sending transaction data:",
            JSON.stringify(transactionData, null, 2)
        )

        try {
            const result = await TransactionAPI.addTransaction(
                transactionData,
                currentUser
            )
            console.log("DEBUG: Transaction result:", result)

            // Clear cart and reset UI state
            clearCart()
            setSearchTerm("")
            setBarcodeSearch("")
            setShowDropdown(false)
            setShowQueueDropdown(false)
            setCheckoutStatus("success")

            // Refresh products
            await fetchProducts()

            // Clear success message after 3 seconds
            setTimeout(() => {
                setCheckoutStatus(null)
            }, 3000)
        } catch (e) {
            console.error("DEBUG: Checkout error:", e)
            console.error("DEBUG: Error message:", e.message)
            console.error("DEBUG: Error stack:", e.stack)
            setCheckoutStatus("error")

            // Clear error message after 5 seconds
            setTimeout(() => {
                setCheckoutStatus(null)
            }, 5000)
        } finally {
            setIsCheckingOut(false)
        }
    }

    // Load cart from queue
    const handleLoadQueuedCart = (idx) => {
        loadQueuedCart(idx)
        setShowQueueDropdown(false)
    }

    const handleClearCartOnly = () => {
        clearCart()
        setSearchTerm("")
        setBarcodeSearch("")
        setShowDropdown(false)
        // Do not clear the queue
    }

    const handleRemoveQueueItem = (idx, e) => {
        e.stopPropagation()
        removeFromQueue(idx)
    }

    return (
        <div className="pos">
            <Sidebar />

            <div className="main">
                <div className="topbar">
                    {/* Topbar middle (left side) - Currently only logo here*/}
                    <div></div>
                    {/* temp div karon input field shoracchi */}
                    <div className="brand-logo">Brand-logo</div>

                    {/* Topbar Right side */}
                    <div className="cashier-section">
                        <button
                            onClick={handleClearCartOnly}
                            style={{
                                padding: "4px 6px",
                                backgroundColor: "gray",
                                color: "white",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                            }}>
                            RESET
                        </button>

                        <div>
                            Cashier:{" "}
                            <span className="cashier-name">John Doe</span>
                        </div>
                        {/* Queue Button */}
                        <div style={{ position: "relative" }}>
                            <button
                                className="queue-btn"
                                onClick={() => setShowQueueDropdown((v) => !v)}
                                style={{
                                    position: "relative",
                                    marginLeft: 10,
                                }}>
                                <span>Queue</span>
                                <span
                                    style={{
                                        background: "#222",
                                        color: "#fff",
                                        borderRadius: "50%",
                                        padding: "2px 8px",
                                        marginLeft: 4,
                                        fontSize: "0.9em",
                                    }}>
                                    {queue.length}
                                </span>
                            </button>
                            {showQueueDropdown && (
                                <div
                                    className="queue-dropdown"
                                    style={{
                                        position: "absolute",
                                        top: "120%",
                                        right: 0,
                                        background: "#fff",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                        borderRadius: 8,
                                        zIndex: 100,
                                        minWidth: 260,
                                        padding: 8,
                                    }}>
                                    {queue.length === 0 && (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                                padding: 12,
                                            }}>
                                            No carts in queue
                                        </div>
                                    )}
                                    {queue.map((q, idx) => (
                                        <div
                                            key={q.timestamp}
                                            className="queue-card"
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: 6,
                                                padding: 10,
                                                marginBottom: 8,
                                                background: "#f9f9f9",
                                                cursor: "pointer",
                                                position: "relative",
                                            }}
                                            onClick={() =>
                                                handleLoadQueuedCart(idx)
                                            }>
                                            {/* Delete button at top right */}
                                            <button
                                                style={{
                                                    position: "absolute",
                                                    top: 6,
                                                    right: 6,
                                                    background: "#dc3545",
                                                    color: "#fff",
                                                    border: "none",
                                                    borderRadius: "50%",
                                                    width: 24,
                                                    height: 24,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    fontSize: 16,
                                                    zIndex: 2,
                                                }}
                                                title="Remove from queue"
                                                onClick={(e) =>
                                                    handleRemoveQueueItem(
                                                        idx,
                                                        e
                                                    )
                                                }>
                                                ×
                                            </button>
                                            <div
                                                style={{
                                                    fontWeight: "bold",
                                                    fontSize: "1em",
                                                }}>
                                                Cart #{idx + 1} -{" "}
                                                {Object.values(q.cart).reduce(
                                                    (sum, item) =>
                                                        sum + item.quantity,
                                                    0
                                                )}{" "}
                                                items
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.95em",
                                                    color: "#555",
                                                }}>
                                                {Object.values(q.cart)[0]
                                                    ?.name || "No items"}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.9em",
                                                    color: "#888",
                                                }}>
                                                Total: $
                                                {Object.values(q.cart)
                                                    .reduce(
                                                        (sum, item) =>
                                                            sum +
                                                            item.price *
                                                                item.quantity,
                                                        0
                                                    )
                                                    .toFixed(2)}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.85em",
                                                    color: "#aaa",
                                                }}>
                                                {new Date(
                                                    q.timestamp
                                                ).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="content">
                    {/* Status Breadcrumb */}
                    {checkoutStatus && (
                        <div
                            style={{
                                position: "fixed",
                                bottom: "20px",
                                right: "50%",
                                padding: "12px 20px",
                                borderRadius: "8px",
                                color: "white",
                                fontWeight: "bold",
                                zIndex: 1000,
                                backgroundColor:
                                    checkoutStatus === "success"
                                        ? "#28a745"
                                        : "#dc3545",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}>
                            {checkoutStatus === "success"
                                ? "Transaction successful!"
                                : "Checkout failed! Please try again."}
                        </div>
                    )}

                    {/* Product names and barcode search in main area */}
                    <div className="content-middle-area">
                        <div>
                            <div className="input-fields">
                                <div className="input-field-row">
                                    <div className="input-group">
                                        <label htmlFor="customer-mobile">
                                            Customer mobile no.
                                        </label>
                                        <input
                                            id="customer-mobile"
                                            className="input-element"
                                            placeholder="Mobile number"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label htmlFor="membership">
                                            Membership Code
                                        </label>
                                        <input
                                            id="customer-mobile"
                                            className="input-element"
                                            placeholder="Membership"
                                        />
                                    </div>
                                </div>

                                <div className="input-field-row">
                                    {/* Prooduct Search and Barcode Search */}
                                    <div
                                        className="input-group"
                                        ref={searchInputRef}
                                        style={{ position: "relative" }}>
                                        <label htmlFor="search">Product</label>

                                        <input
                                            id="search"
                                            className="input-element"
                                            placeholder="Search product"
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                // Don't show dropdown immediately - let the debounced search handle it
                                            }}
                                            autoComplete="off"
                                        />

                                        {/* DropDown - for product search */}
                                        {showDropdown && searchTerm.trim() && (
                                            <ul className="product-dropdown">
                                                {loading ? (
                                                    <li
                                                        className="dropdown-item"
                                                        style={{
                                                            color: "#888",
                                                            textAlign: "center",
                                                        }}>
                                                        Searching...
                                                    </li>
                                                ) : filteredProducts.length >
                                                  0 ? (
                                                    filteredProducts.map(
                                                        (p) => (
                                                            <li
                                                                key={p.id}
                                                                className="dropdown-item"
                                                                onClick={() => {
                                                                    addSelectedProduct(
                                                                        p
                                                                    )
                                                                    setShowDropdown(
                                                                        false
                                                                    )
                                                                    setSearchTerm(
                                                                        ""
                                                                    ) // Clear search term after selection
                                                                }}>
                                                                {p.name}{" "}
                                                                <span
                                                                    style={{
                                                                        color: "#888",
                                                                        fontSize:
                                                                            "0.9em",
                                                                    }}>
                                                                    ({p.id})
                                                                </span>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li
                                                        className="dropdown-item"
                                                        style={{
                                                            color: "#888",
                                                            textAlign: "center",
                                                        }}>
                                                        No products found
                                                    </li>
                                                )}
                                            </ul>
                                        )}
                                    </div>
                                    {/* Barcode Search - search functionality not implemented */}
                                    <div className="input-group">
                                        <label htmlFor="barcode-search">
                                            Barcode
                                        </label>
                                        <input
                                            id="barcode-search"
                                            className="input-element"
                                            placeholder="Scan barcode"
                                            value={barcodeSearch}
                                            onChange={(e) =>
                                                setBarcodeSearch(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="product-grid">
                            {loading && (
                                <div>
                                    {t(
                                        "Loading products...",
                                        "Produkte werden geladen..."
                                    )}
                                </div>
                            )}
                            {!loading && selectedProducts.length === 0 && (
                                <div
                                    style={{
                                        color: "#888",
                                        textAlign: "center",
                                        marginTop: "2em",
                                    }}>
                                    {t(
                                        "Please search and select products to display.",
                                        "Bitte suchen und wählen Sie Produkte aus, um sie anzuzeigen."
                                    )}
                                </div>
                            )}
                            {selectedProducts.length > 0 && (
                                <table className="product-table">
                                    <thead>
                                        <tr>
                                            <th>{t("ID", "ID")}</th>
                                            <th>{t("Name", "Name")}</th>
                                            <th>
                                                {t(
                                                    "Category ID",
                                                    "Kategorie-ID"
                                                )}
                                            </th>
                                            <th>{t("Barcode", "Barcode")}</th>
                                            <th>{t("Price", "Preis")}</th>
                                            <th>
                                                {t("VAT Rate", "MwSt-Satz")}
                                            </th>
                                            <th>{t("Stock", "Lager")}</th>
                                            <th>{t("Quantity", "Menge")}</th>
                                            <th>{t("Actions", "Aktionen")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map((product) => (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>{product.name}</td>
                                                <td>{product.category_id}</td>
                                                <td>{product.barcode}</td>
                                                <td>
                                                    ${product.price.toFixed(2)}
                                                </td>
                                                <td>{product.vat_rate}%</td>
                                                <td>
                                                    {product.stock_quantity}
                                                </td>
                                                <td>
                                                    <div className="qty-controls">
                                                        <button
                                                            onClick={() =>
                                                                updateCart(
                                                                    product,
                                                                    -1
                                                                )
                                                            }
                                                            disabled={
                                                                !cart[
                                                                    product.id
                                                                ]
                                                            }>
                                                            -
                                                        </button>
                                                        <span className="table-quantity">
                                                            {cart[product.id]
                                                                ?.quantity || 0}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                updateCart(
                                                                    product,
                                                                    1
                                                                )
                                                            }
                                                            disabled={
                                                                cart[product.id]
                                                                    ?.quantity >=
                                                                product.stock_quantity
                                                            }>
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            removeSelectedProduct(
                                                                product.id
                                                            )
                                                        }}
                                                        style={{
                                                            background:
                                                                "#ff4444",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            padding: "6px 9px",
                                                            cursor: "pointer",
                                                            fontSize: "1rem",
                                                        }}>
                                                        {t(
                                                            "Remove",
                                                            "Entfernen"
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                    <div className="cart-summary">
                        <div className="receipt-content">
                            <div className="receipt-style">
                                {/* Receipt Header */}
                                <div
                                    style={{
                                        textAlign: "center",
                                        marginBottom: "10px",
                                    }}>
                                    <div
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: "1.2em",
                                        }}>
                                        Supermarket XYZ
                                    </div>
                                    <div>Tel: 123-456-7890</div>
                                    <div
                                        style={{
                                            fontSize: "0.95em",
                                            marginTop: "4px",
                                        }}>
                                        {new Date().toLocaleDateString()}{" "}
                                        {new Date().toLocaleTimeString()}
                                    </div>
                                </div>

                                <hr style={{ margin: "10px 0" }} />

                                {/* Cart Items */}
                                <div
                                    style={{
                                        fontSize: "1em",
                                        marginBottom: "10px",
                                    }}>
                                    {Object.values(cart).length === 0 && (
                                        <div
                                            style={{
                                                color: "#888",
                                                textAlign: "center",
                                            }}>
                                            {t(
                                                "No items in cart",
                                                "Keine Artikel im Warenkorb"
                                            )}
                                        </div>
                                    )}
                                    {Object.values(cart).map((item, idx) => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                marginBottom: 2,
                                            }}>
                                            <span>
                                                {item.quantity} x {item.name}
                                            </span>
                                            <span>
                                                $
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <hr style={{ margin: "10px 0" }} />

                                {/* Totals */}
                                <div style={{ fontSize: "1em" }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}>
                                        <span>Subtotal:</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}>
                                        <span>Tax:</span>
                                        <span>${tax}</span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontWeight: "bold",
                                        }}>
                                        <span>Total:</span>
                                        <span>${total}</span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}>
                                        <span>Paid:</span>
                                        <span>${paidAmount.toFixed(2)}</span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                        }}>
                                        <span>Change:</span>
                                        <span>${change.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="payment-section">
                            <div className="add-to-queue-pay-btns">
                                {/* CASH - CARD - VOUCHER */}

                                <div className="pay-options">
                                    <label htmlFor="payment-options">
                                        Payment:
                                    </label>
                                    <select
                                        id="payment-options"
                                        onChange={(e) =>
                                            setPaymentMethod(e.target.value)
                                        }
                                        defaultValue="cash">
                                        <option value="" disabled>
                                            Select Payment Method
                                        </option>
                                        <option value="cash">Cash</option>
                                        <option value="ec">EC</option>
                                        <option value="visa">Visa</option>
                                        <option value="voucher">Voucher</option>
                                    </select>
                                </div>

                                {/* TOTAL - PAID - CHANGE */}
                                <div className="transaction-amount-section">
                                    <div>
                                        <span>Total Amount : </span>
                                        <span>${total}</span>
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="paid-amount"
                                            className="paid-amount-label">
                                            Paid Amount :
                                        </label>
                                        <input
                                            id="paid-amount"
                                            type="number"
                                            value={paidAmount || ""}
                                            onChange={(e) =>
                                                setPaidAmount(
                                                    parseFloat(
                                                        e.target.value
                                                    ) || 0
                                                )
                                            }
                                        />
                                    </div>
                                    <div>
                                        <span>Change Amount : </span>
                                        <span>
                                            $
                                            {(paidAmount - total).toFixed(2) ||
                                                0}
                                        </span>
                                    </div>
                                </div>

                                <div className="add-to-queue-print-btns">
                                    <button
                                        className="add-to-queue"
                                        onClick={addToQueue}
                                        disabled={total === 0}
                                        style={{
                                            marginTop: 8,
                                            marginBottom: 8,
                                        }}>
                                        Add to queue
                                    </button>
                                    <button
                                        className="checkout-btn"
                                        disabled={
                                            !payment_method ||
                                            total === 0 ||
                                            isCheckingOut
                                        }
                                        onClick={() =>
                                            handleCheckout(payment_method)
                                        }>
                                        {isCheckingOut
                                            ? "Processing..."
                                            : "Checkout"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default POS
