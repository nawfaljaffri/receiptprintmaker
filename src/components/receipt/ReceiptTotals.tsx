import React from 'react';

interface ReceiptTotalsProps {
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  currencySymbol: string;
}

export const ReceiptTotals: React.FC<ReceiptTotalsProps> = ({ subtotal, tax, taxRate, discount, total, currencySymbol }) => (
  <>
    <hr className="receipt-divider" />
    <div className="receipt-totals">
      <div className="total-row">
        <span>Subtotal</span>
        <span>{currencySymbol}{subtotal.toFixed(2)}</span>
      </div>
      <div className="total-row">
        <span>Tax ({taxRate}%)</span>
        <span>{currencySymbol}{tax.toFixed(2)}</span>
      </div>
      {discount > 0 && (
        <div className="total-row">
          <span>Discount</span>
          <span>-{currencySymbol}{discount.toFixed(2)}</span>
        </div>
      )}
      <div className="total-row grand-total">
        <span>Total</span>
        <span>{currencySymbol}{Math.max(0, total).toFixed(2)}</span>
      </div>
    </div>
  </>
);
