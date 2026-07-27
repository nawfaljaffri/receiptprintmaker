import React from 'react';

interface ReceiptFooterProps {
  footerMessage: string;
}

export const ReceiptFooter: React.FC<ReceiptFooterProps> = ({ footerMessage }) => (
  <>
    <hr className="receipt-divider" />
    <div className="receipt-footer">
      {footerMessage}
    </div>
  </>
);
