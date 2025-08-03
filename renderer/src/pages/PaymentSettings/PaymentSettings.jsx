import { useState, useEffect } from "react";
import "./paymentsettings.css";
import Sidebar from "../../components/Sidebar";

const paymentMethodsList = [
  { key: "cash", label: "Cash" },
  { key: "ec", label: "EC" },
  { key: "visa", label: "Visa" },
  { key: "voucher", label: "Voucher" }
];

const loyaltyTiers = [
  { key: "bronze", label: "Bronze" },
  { key: "silver", label: "Silver" },
  { key: "gold", label: "Gold" },
  { key: "platinum", label: "Platinum" },
];

export default function PaymentSettings() {
  const [paymentMethods, setPaymentMethods] = useState({});
  const [cardFees, setCardFees] = useState({});
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "",
    footer: "",
    showCompanyInfo: false,
    showTax: false,
    customNotes: "",
    paperSize: "A4",
    autoEmail: false,
  });

  // ✅ Load from JSON on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const data = await window.posAPI.getPaymentSettings();
      if (data) {
        setPaymentMethods(data.paymentMethods || {});
        setCardFees({
          bronze: data.loyaltyDiscountSettings?.bronze?.discountPercentage || 0,
          silver: data.loyaltyDiscountSettings?.silver?.discountPercentage || 0,
          gold: data.loyaltyDiscountSettings?.gold?.discountPercentage || 0,
          platinum: data.loyaltyDiscountSettings?.platinum?.discountPercentage || 0,
        });
        setInvoiceSettings(data.invoiceSettings || {});
      }
    };
    fetchSettings();
  }, []);

  const handlePaymentMethodChange = (key) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCardFeeChange = (tier, value) => {
    setCardFees((prev) => ({ ...prev, [tier]: value }));
  };

  const handleInvoiceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInvoiceSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const settings = {
      paymentMethods,
      loyaltyDiscountSettings: {
        bronze: {
          discountPercentage: parseInt(cardFees.bronze),
          discountType: "percentage",
        },
        silver: {
          discountPercentage: parseInt(cardFees.silver),
          discountType: "percentage",
        },
        gold: {
          discountPercentage: parseInt(cardFees.gold),
          discountType: "percentage",
        },
        platinum: {
          discountPercentage: parseInt(cardFees.platinum),
          discountType: "percentage",
        },
      },
    //   invoiceSettings,
    };

    const result = await window.posAPI.updatePaymentSettings(settings);
    if (result.success) {
      alert("✅ Settings saved successfully!");
    } else {
      alert("❌ Error saving settings: " + result.error);
    }
  };

  return (
    <div className='payment-settings-container'>
      <Sidebar />
      <div className='payment-settings-content'>
        <h2>💳 Payment Settings</h2>
        <form className='payment-settings-form' onSubmit={handleSubmit}>
          {/* Payment Methods */}
          <fieldset className='ps-fieldset'>
            <legend>Payment Methods</legend>
            <div className='ps-methods-list'>
              {paymentMethodsList.map((method) => (
                <label key={method.key} className='ps-checkbox-label'>
                  <input
                    type='checkbox'
                    checked={!!paymentMethods[method.key]}
                    onChange={() => handlePaymentMethodChange(method.key)}
                  />
                  {method.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Loyalty Discount */}
          <fieldset className='ps-fieldset'>
            <legend>Loyalty Discount (%)</legend>
            <table className='ps-fee-table'>
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
                        type='number'
                        min='0'
                        max='100'
                        value={cardFees[tier.key] || 0}
                        onChange={(e) =>
                          handleCardFeeChange(tier.key, e.target.value)
                        }
                        className='ps-fee-input'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </fieldset>

          {/* Invoice Settings */}
          <fieldset className='ps-fieldset'>
            <legend>Invoice Settings</legend>
            <div className='ps-invoice-group'>
              <label>
                Invoice Prefix
                <input
                  type='text'
                  name='prefix'
                  value={invoiceSettings.prefix}
                  onChange={handleInvoiceChange}
                  className='ps-invoice-input'
                />
              </label>
              <label>
                Invoice Footer
                <input
                  type='text'
                  name='footer'
                  value={invoiceSettings.footer}
                  onChange={handleInvoiceChange}
                  className='ps-invoice-input'
                />
              </label>
              <label className='ps-switch-label'>
                <input
                  type='checkbox'
                  name='showCompanyInfo'
                  checked={invoiceSettings.showCompanyInfo}
                  onChange={handleInvoiceChange}
                />
                Show Company Info
              </label>
              <label className='ps-switch-label'>
                <input
                  type='checkbox'
                  name='showTax'
                  checked={invoiceSettings.showTax}
                  onChange={handleInvoiceChange}
                />
                Show Tax on Invoice
              </label>
              <label>
                Custom Notes
                <input
                  type='text'
                  name='customNotes'
                  value={invoiceSettings.customNotes}
                  onChange={handleInvoiceChange}
                  className='ps-invoice-input'
                />
              </label>
            </div>
          </fieldset>

          <button type='submit' className='ps-save-btn'>
            💾 Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
