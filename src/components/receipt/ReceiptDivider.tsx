import React from 'react';

type DividerType = 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';

interface ReceiptDividerProps {
  type: DividerType;
}

/**
 * Renders a receipt-authentic divider. The outer .divider-wrap
 * provides consistent breathing room (0.3rem top+bottom) so
 * divider margins are never set inside individual types.
 */
export const ReceiptDivider: React.FC<ReceiptDividerProps> = ({ type }) => {
  if (type === 'empty') {
    return <div style={{ height: '0.6rem' }} aria-hidden="true" />;
  }

  if (type === 'asterisk') {
    // Tight asterisks like a real receipt: ******************
    // Using a div with overflow:hidden so it fills width but never wraps
    return (
      <div className="divider-wrap" aria-hidden="true">
        <div style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          opacity: 0.7,
          userSelect: 'none',
        }}>
          {/* 200 asterisks — will always fill the width */}
          {'*'.repeat(200)}
        </div>
      </div>
    );
  }

  if (type === 'dashed') {
    // Dash characters — authentic thermal paper feel
    return (
      <div className="divider-wrap" aria-hidden="true">
        <div style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          lineHeight: 1,
          opacity: 0.55,
          userSelect: 'none',
          letterSpacing: '1px',
        }}>
          {'-'.repeat(200)}
        </div>
      </div>
    );
  }

  // CSS border types for solid, double, dotted
  const borderStyles: Record<string, string> = {
    solid: '1px solid currentColor',
    double: '3px double currentColor',
    dotted: '2px dotted currentColor',
  };

  return (
    <div className="divider-wrap" aria-hidden="true">
      <div
        style={{
          borderBottom: borderStyles[type] || borderStyles.solid,
          opacity: 0.5,
        }}
      />
    </div>
  );
};
