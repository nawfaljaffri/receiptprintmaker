import React from 'react';

interface ReceiptDetailsProps {
  date: string;
  time: string;
  orderNumber: string;
  cashierName: string;
}

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ date, time, orderNumber, cashierName }) => (
  <>
    <div className="receipt-details">
      <div className="detail-row">
        <span>Date: {date}</span>
        <span>Time: {time}</span>
      </div>
      <div className="detail-row">
        <span>Order #: {orderNumber}</span>
        <span>Server: {cashierName}</span>
      </div>
    </div>
    <hr className="receipt-divider" />
  </>
);
