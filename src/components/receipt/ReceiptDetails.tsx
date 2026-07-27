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
    {/* Two-column grid so label+value pairs never collide */}
    <div className="details-grid">
      <span className="detail-label">Date:</span>
      <span className="detail-value">{date}</span>
      <span className="detail-label">Time:</span>
      <span className="detail-value">{time}</span>
      <span className="detail-label">Order #:</span>
      <span className="detail-value">{orderNumber}</span>
      <span className="detail-label">Server:</span>
      <span className="detail-value">{cashierName}</span>
    </div>
    <ReceiptDivider type={dividerStyle} />
  </div>
);
