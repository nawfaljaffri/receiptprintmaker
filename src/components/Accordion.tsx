import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headerAction?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false, headerAction }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="accordion-item">
      <div className="accordion-header" onClick={(e) => {
        // Prevent toggle if clicking on the action itself
        if ((e.target as HTMLElement).closest('.header-action')) return;
        setIsOpen(!isOpen);
      }}>
        <div className="accordion-title">
          {icon && <span className="accordion-icon">{icon}</span>}
          <span className="accordion-title-text">{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {headerAction && <div className="header-action" onClick={(e) => e.stopPropagation()}>{headerAction}</div>}
          {isOpen ? <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />}
        </div>
      </div>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};
