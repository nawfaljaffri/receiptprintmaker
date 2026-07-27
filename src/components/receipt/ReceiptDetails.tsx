import React from 'react';
import { ReceiptDivider } from './ReceiptDivider';

interface ReceiptDetailsProps {
  date: string;
  time: string;
  orderNumber: string;
  cashierName: string;
  dividerStyle: 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';
}

export const ReceiptDetails: React.FC<ReceiptDetailsProps> = ({ date, time, orderNumber, cashierName, dividerStyle }) => (
  <div className="receipt-details">
    <div className="details-row">
      <span>Date: {date}</span>
      <span>Time: {time}</span>
    </div>
    <div className="details-row">
      <span>Order #: {orderNumber}</span>
      <span>Server: {cashierName}</span>
    </div>
    <ReceiptDivider type={dividerStyle} />
  </div>
);
