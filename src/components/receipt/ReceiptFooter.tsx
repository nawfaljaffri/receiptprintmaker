import React from 'react';
import { ReceiptDivider } from './ReceiptDivider';

interface ReceiptFooterProps {
  footerMessage: string;
  dividerStyle: 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';
}

export const ReceiptFooter: React.FC<ReceiptFooterProps> = ({ footerMessage, dividerStyle }) => (
  <>
    <ReceiptDivider type={dividerStyle} />
    <div className="receipt-footer">
      {footerMessage}
    </div>
  </>
);
