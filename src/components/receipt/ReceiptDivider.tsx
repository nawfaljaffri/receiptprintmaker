import React from 'react';

interface ReceiptDividerProps {
  type: 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';
}

export const ReceiptDivider: React.FC<ReceiptDividerProps> = ({ type }) => {
  if (type === 'empty') {
    return <div style={{ height: '1rem' }} aria-hidden="true" />;
  }
  
  if (type === 'asterisk') {
    return (
      <div 
        aria-hidden="true" 
        style={{ 
          textAlign: 'center', 
          overflow: 'hidden', 
          whiteSpace: 'nowrap',
          margin: '0.75rem 0',
          letterSpacing: '2px',
          opacity: 0.6
        }}
      >
        {Array(100).fill('*').join('')}
      </div>
    );
  }

  // Map other types to border styles
  const borderStyles: Record<string, string> = {
    dashed: '1px dashed currentColor',
    solid: '1px solid currentColor',
    double: '3px double currentColor',
    dotted: '2px dotted currentColor',
  };

  return (
    <div 
      aria-hidden="true" 
      style={{
        borderBottom: borderStyles[type] || borderStyles.dashed,
        margin: '1rem 0',
        opacity: 0.4
      }} 
    />
  );
};
