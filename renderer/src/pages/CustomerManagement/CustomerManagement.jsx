import React, { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import "./customerManagement.css"

// Customer form initial state
const defaultCustomer = {
    id: null,
    name: "",
    phone: "",
    loyaltyCard: "",
}

export default function CustomerManagement() {
    const [customers, setCustomers] = useState([])
    const [search, setSearch] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [formCustomer, setFormCustomer] = useState(defaultCustomer)
    const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Fetch customers on mount
    useEffect(() => {
        fetchCustomers()
    }, [])

    // Fetch all customers
    async function fetchCustomers() {
        setLoading(true)
        setError("")
        try {
            let result = []
            if (window.posAPI && window.posAPI.getCustomers) {
                result = await window.posAPI.getCustomers()
            } else {
                // Fallback: stub data
                result = [
                    {
                        id: 1,
                        name: "John Doe",
                        phone: "1234567890",
                        loyaltyCard: "CARD123",
                    },
                    {
                        id: 2,
                        name: "Jane Smith",
                        phone: "0987654321",
                        loyaltyCard: "CARD456",
                    },
                ]
            }
            setCustomers(result)
        } catch (e) {
            setError("Failed to fetch customers")
        } finally {
            setLoading(false)
        }
    }

    // Fetch purchase history for a customer
    async function fetchHistory(customerId) {
        setLoading(true)
        setError("")
        try {
            let result = []
            if (window.posAPI && window.posAPI.getCustomerHistory) {
                result = await window.posAPI.getCustomerHistory(customerId)
            } else {
                // Fallback: stub data
                result = [
                    { id: 1, date: "2024-06-01", total: 50.0 },
                    { id: 2, date: "2024-06-10", total: 30.0 },
                ]
            }
            setHistory(result)
        } catch (e) {
            setError("Failed to fetch purchase history")
        } finally {
            setLoading(false)
        }
    }

    // Handle selecting a customer
    function handleSelectCustomer(customer) {
        setSelectedCustomer(customer)
        setShowForm(false)
        fetchHistory(customer.id)
    }

    // Handle add/edit button
    function handleAddEdit(customer = null) {
        setShowForm(true)
        setFormCustomer(customer ? { ...customer } : { ...defaultCustomer })
    }

    // Handle form change
    function handleFormChange(e) {
        const { name, value } = e.target
        setFormCustomer((prev) => ({ ...prev, [name]: value }))
    }

    // Handle form submit
    async function handleFormSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            let result
            if (formCustomer.id) {
                // Edit
                if (window.posAPI && window.posAPI.updateCustomer) {
                    result = await window.posAPI.updateCustomer(formCustomer)
                } else {
                    // Update in local state for stub
                    setCustomers((prev) =>
                        prev.map((c) =>
                            c.id === formCustomer.id ? { ...formCustomer } : c
                        )
                    )
                }
            } else {
                // Add
                if (window.posAPI && window.posAPI.addCustomer) {
                    result = await window.posAPI.addCustomer(formCustomer)
                } else {
                    // Add to local state for stub
                    setCustomers((prev) => [
                        ...prev,
                        { ...formCustomer, id: Date.now() },
                    ])
                }
            }
            setShowForm(false)
            fetchCustomers()
        } catch (e) {
            setError("Failed to save customer")
        } finally {
            setLoading(false)
        }
    }

    // Filtered customers
    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.phone.includes(search) ||
            (c.loyaltyCard && c.loyaltyCard.includes(search))
    )

    return (
        <div className="customer-management-page">
            <Sidebar />
            <div className="customer-management-container">
                <div className="customer-list-panel">
                    <div className="customer-list-header">
                        <input
                            type="text"
                            placeholder="Search by name, phone, or card..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="customer-search-input"
                        />
                        <button
                            onClick={() => handleAddEdit()}
                            className="add-customer-btn">
                            + Add Customer
                        </button>
                    </div>
                    <ul className="customer-list">
                        {filteredCustomers.map((customer) => (
                            <li
                                key={customer.id}
                                className={
                                    selectedCustomer &&
                                    selectedCustomer.id === customer.id
                                        ? "selected"
                                        : ""
                                }
                                onClick={() => handleSelectCustomer(customer)}>
                                <div className="customer-name">
                                    {customer.name}
                                </div>
                                <div className="customer-phone">
                                    {customer.phone}
                                </div>
                                <div className="customer-card">
                                    {customer.loyaltyCard}
                                </div>
                                <button
                                    className="edit-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddEdit(customer)
                                    }}>
                                    Edit
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="customer-main-panel">
                    {showForm ? (
                        <form
                            className="customer-form"
                            onSubmit={handleFormSubmit}>
                            <h2>
                                {formCustomer.id
                                    ? "Edit Customer"
                                    : "Add Customer"}
                            </h2>
                            <label>
                                Name:
                                <input
                                    name="name"
                                    value={formCustomer.name}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>
                            <label>
                                Phone:
                                <input
                                    name="phone"
                                    value={formCustomer.phone}
                                    onChange={handleFormChange}
                                    required
                                />
                            </label>
                            <label>
                                Loyalty Card:
                                <input
                                    name="loyaltyCard"
                                    value={formCustomer.loyaltyCard}
                                    onChange={handleFormChange}
                                />
                            </label>
                            <div className="form-actions">
                                <button type="submit" disabled={loading}>
                                    {formCustomer.id ? "Update" : "Add"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    disabled={loading}>
                                    Cancel
                                </button>
                            </div>
                            {error && <div className="form-error">{error}</div>}
                        </form>
                    ) : selectedCustomer ? (
                        <div className="customer-history-panel">
                            <h2>{selectedCustomer.name}'s Purchase History</h2>
                            <div>Phone: {selectedCustomer.phone}</div>
                            <div>
                                Loyalty Card: {selectedCustomer.loyaltyCard}
                            </div>
                            <ul className="purchase-history-list">
                                {history.length === 0 ? (
                                    <li>No purchases found.</li>
                                ) : (
                                    history.map((h) => (
                                        <li key={h.id}>
                                            <span>{h.date}</span> -{" "}
                                            <span>${h.total.toFixed(2)}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                            <button onClick={() => setSelectedCustomer(null)}>
                                Back to List
                            </button>
                        </div>
                    ) : (
                        <div className="empty-state">
                            Select a customer to view history or add a new
                            customer.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
