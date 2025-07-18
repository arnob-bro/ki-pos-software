import React, { useState } from "react"
import "./paymentsettings.css"
import Sidebar from "../../components/Sidebar"

const paymentMethodsList = [
  { key: "cash", label: "Cash" },
  { key: "ec", label: "EC" },
  { key: "visa", label: "Visa" },
  { key: "voucher", label: "Voucher" },
  { key: "prepaid", label: "Prepaid" },
]

const loyaltyTiers = [
  { key: "bronze", label: "Bronze" },
  { key: "silver", label: "Silver" },
  { key: "gold", label: "Gold" },
]

export default function PaymentSettings() {
  const [paymentMethods, setPaymentMethods] = useState({
    cash: true,
    ec: true,
    visa: true,
    voucher: false,
    prepaid: false,
  })
  const [cardFees, setCardFees] = useState({
    bronze: 0,
    silver: 0,
    gold: 0,
  })
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "INV-",
    footer: "Thank you for your purchase!",
    showCompanyInfo: true,
    showTax: true,
    customNotes: "",
    paperSize: "A4",
    autoEmail: false,
  })

  const handlePaymentMethodChange = (key) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleCardFeeChange = (tier, value) => {
    setCardFees((prev) => ({ ...prev, [tier]: value }))
  }

  const handleInvoiceChange = (e) => {
    const { name, value, type, checked } = e.target
    setInvoiceSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: Connect to backend API
    alert("Settings saved! (Not yet connected to backend)")
  }

  return (
    <div className="payment-settings-container">
      <Sidebar />
      <div className="payment-settings-content">
        <h2>💳 Payment Settings</h2>
        <form className="payment-settings-form" onSubmit={handleSubmit}>
          {/* Payment Methods */}
          <fieldset className="ps-fieldset">
            <legend>Payment Methods</legend>
            <div className="ps-methods-list">
              {paymentMethodsList.map((method) => (
                <label key={method.key} className="ps-checkbox-label">
                  <input
                    type="checkbox"
                    checked={paymentMethods[method.key]}
                    onChange={() => handlePaymentMethodChange(method.key)}
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Card Fee / Loyalty Tiers */}
          <fieldset className="ps-fieldset">
            <legend>Card Fee / Loyalty Discount</legend>
            <table className="ps-fee-table">
              <thead>
                <tr>
                  <th>Loyalty Tier</th>
                  <th>Discount (%)</th>
                </tr>
              </thead>
              <tbody>
                {loyaltyTiers.map((tier) => (
                  <tr key={tier.key}>
                    <td>{tier.label}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={cardFees[tier.key]}
                        onChange={(e) => handleCardFeeChange(tier.key, e.target.value)}
                        className="ps-fee-input"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </fieldset>

          {/* Invoice Settings */}
          <fieldset className="ps-fieldset">
            <legend>Invoice Settings</legend>
            <div className="ps-invoice-group">
              <label>
                Invoice Prefix
                <input
                  type="text"
                  name="prefix"
                  value={invoiceSettings.prefix}
                  onChange={handleInvoiceChange}
                  className="ps-invoice-input"
                />
              </label>
              <label>
                Invoice Footer
                <input
                  type="text"
                  name="footer"
                  value={invoiceSettings.footer}
                  onChange={handleInvoiceChange}
                  className="ps-invoice-input"
                />
              </label>
              <label className="ps-switch-label">
                <input
                  type="checkbox"
                  name="showCompanyInfo"
                  checked={invoiceSettings.showCompanyInfo}
                  onChange={handleInvoiceChange}
                />
                Show Company Info
              </label>
              <label className="ps-switch-label">
                <input
                  type="checkbox"
                  name="showTax"
                  checked={invoiceSettings.showTax}
                  onChange={handleInvoiceChange}
                />
                Show Tax on Invoice
              </label>
              <label>
                Custom Notes
                <input
                  type="text"
                  name="customNotes"
                  value={invoiceSettings.customNotes}
                  onChange={handleInvoiceChange}
                  className="ps-invoice-input"
                />
              </label>
              {/* <label>
                Paper Size
                <select
                  name="paperSize"
                  value={invoiceSettings.paperSize}
                  onChange={handleInvoiceChange}
                  className="ps-invoice-input"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                  <option value="receipt">Receipt</option>
                </select>
              </label> */}
              {/* <label className="ps-switch-label">
                <input
                  type="checkbox"
                  name="autoEmail"
                  checked={invoiceSettings.autoEmail}
                  onChange={handleInvoiceChange}
                />
                Auto-email Invoice
              </label> */}
            </div>
          </fieldset>

          <button type="submit" className="ps-save-btn">💾 Save Settings</button>
        </form>
      </div>
    </div>
  )
}
