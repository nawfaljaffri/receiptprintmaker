import React from 'react';

interface ReceiptHeaderProps {
  storeName: string;
  storeAddress: string;
  storePhone?: string;
  storeWebsite?: string;
}

export const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ storeName, storeAddress, storePhone, storeWebsite }) => (
  <>
    <div className="receipt-header">
      <div className="store-name">{storeName}</div>
      <div className="store-info">{storeAddress}</div>
      {storePhone && <div className="store-info">{storePhone}</div>}
      {storeWebsite && <div className="store-info">{storeWebsite}</div>}
    </div>
    <hr className="receipt-divider" />
  </>
);
