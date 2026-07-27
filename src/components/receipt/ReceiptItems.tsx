import React from 'react';
import type { ReceiptItem } from '../../types';

interface ReceiptItemsProps {
  items: ReceiptItem[];
  itemLayout: 'standard' | 'comparative';
  currencySymbol: string;
}

export const ReceiptItems: React.FC<ReceiptItemsProps> = ({ items, itemLayout, currencySymbol }) => (
  <div className="items-list">
    {items.map((item) => (
      <div key={item.id} className={itemLayout === 'comparative' ? 'item-row comparative' : 'item-row'}>
        {itemLayout === 'comparative' ? (
          <>
            <div className="comparative-col">
              <span>{item.quantity} x {item.name}</span>
              <span>{currencySymbol}{(item.quantity * item.price).toFixed(2)}</span>
            </div>
            <div className="comparative-col">
              <span>{item.quantity} x {item.secondaryName || ''}</span>
              <span>{currencySymbol}{(item.quantity * (item.secondaryPrice || 0)).toFixed(2)}</span>
            </div>
          </>
        ) : (
          <>
            <span className="item-name">
              {item.quantity} x {item.name}
            </span>
            <span className="item-price">
              {currencySymbol}{(item.quantity * item.price).toFixed(2)}
            </span>
          </>
        )}
      </div>
    ))}
  </div>
);
