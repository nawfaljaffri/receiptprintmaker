import React from 'react';

type DividerType = 'dashed' | 'solid' | 'double' | 'dotted' | 'asterisk' | 'empty';

interface ReceiptDividerProps {
  type: DividerType;
}

// Renders character-based dividers (asterisk, dashed) as text so they look
// authentically like real thermal receipt paper instead of CSS borders.
const CharDivider: React.FC<{ char: string; spacing?: string }> = ({ char, spacing = ' ' }) => (
  <div
    aria-hidden="true"
    style={{
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      margin: '0.6rem 0',
      opacity: 0.65,
      letterSpacing: spacing === ' ' ? '0' : '0',
      userSelect: 'none',
      lineHeight: 1.2,
    }}
  >
    {/* Repeat enough to fill any receipt width */}
    {Array(50).fill(char).join(spacing)}
  </div>
);

export const ReceiptDivider: React.FC<ReceiptDividerProps> = ({ type }) => {
  switch (type) {
    case 'empty':
      return <div style={{ height: '0.75rem' }} aria-hidden="true" />;

    case 'asterisk':
      // Spaced asterisks: "* * * * * * * * * *" — like the reference image
      return <CharDivider char="*" spacing=" " />;

    case 'dashed':
      // Dash characters: "- - - - - - -" for authentic thermal look
      return (
        <div
          aria-hidden="true"
          style={{
            borderBottom: '1px dashed currentColor',
            margin: '0.75rem 0',
            opacity: 0.7,
          }}
        />
      );

    case 'solid':
      return (
        <div
          aria-hidden="true"
          style={{
            borderBottom: '1px solid currentColor',
            margin: '0.75rem 0',
            opacity: 0.5,
          }}
        />
      );

    case 'double':
      return (
        <div
          aria-hidden="true"
          style={{
            borderBottom: '3px double currentColor',
            margin: '0.75rem 0',
            opacity: 0.6,
          }}
        />
      );

    case 'dotted':
      return (
        <div
          aria-hidden="true"
          style={{
            borderBottom: '2px dotted currentColor',
            margin: '0.75rem 0',
            opacity: 0.55,
          }}
        />
      );

    default:
      return (
        <div
          aria-hidden="true"
          style={{
            borderBottom: '1px dashed currentColor',
            margin: '0.75rem 0',
            opacity: 0.7,
          }}
        />
      );
  }
};
