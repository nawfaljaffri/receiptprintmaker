import React from 'react';

type DividerType = 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'equals' | 'empty';

interface ReceiptDividerProps {
  type: DividerType;
}

/**
 * Character-based dividers fill their container width via overflow:hidden.
 * The receipt-wrapper must have overflow:hidden for this to work correctly.
 */
const CharDivider: React.FC<{ char: string; opacity?: number }> = ({ char, opacity = 0.65 }) => (
  <div
    style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      lineHeight: 1.2,
      opacity,
      userSelect: 'none',
      width: '100%',
    }}
    aria-hidden="true"
  >
    {/* 300 characters — always fills any receipt width and clips */}
    {char.repeat(300)}
  </div>
);

export const ReceiptDivider: React.FC<ReceiptDividerProps> = ({ type }) => {
  switch (type) {
    case 'empty':
      return <div style={{ height: '0.5rem' }} aria-hidden="true" />;

    case 'asterisk':
      return (
        <div className="divider-wrap">
          <CharDivider char="*" opacity={0.6} />
        </div>
      );

    case 'equals':
      return (
        <div className="divider-wrap">
          <CharDivider char="=" opacity={0.7} />
        </div>
      );

    case 'dashed':
      return (
        <div className="divider-wrap">
          <CharDivider char="-" opacity={0.5} />
        </div>
      );

    case 'solid':
      return (
        <div className="divider-wrap">
          <div style={{ borderBottom: '1px solid currentColor', opacity: 0.5 }} />
        </div>
      );

    case 'double':
      return (
        <div className="divider-wrap">
          <div style={{ borderBottom: '3px double currentColor', opacity: 0.6 }} />
        </div>
      );

    case 'dotted':
      return (
        <div className="divider-wrap">
          <div style={{ borderBottom: '2px dotted currentColor', opacity: 0.5 }} />
        </div>
      );

    default:
      return (
        <div className="divider-wrap">
          <CharDivider char="-" opacity={0.5} />
        </div>
      );
  }
};
