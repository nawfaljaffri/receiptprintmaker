import React from 'react';
import { ReceiptDivider } from './ReceiptDivider';

interface ReceiptHeaderProps {
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeWebsite?: string;
  dividerStyle: 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';
}

export const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ storeName, storeAddress, storePhone, storeWebsite, dividerStyle }) => (
  <div className="receipt-header">
    <h2 className="store-name">{storeName}</h2>
    <p className="store-address">{storeAddress}</p>
    {storePhone && <p className="store-phone">{storePhone}</p>}
    {storeWebsite && <p className="store-website">{storeWebsite}</p>}
    <ReceiptDivider type={dividerStyle} />
  </div>
);
