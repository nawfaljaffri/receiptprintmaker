import React, { useState, useEffect } from 'react';
import { Save, Download, Trash2, Clock } from 'lucide-react';
import { Accordion } from '../Accordion';
import type { ReceiptData } from '../../types';
import html2canvas from 'html2canvas';

interface SavedReceipt {
  id: string;
  name: string;
  date: string;
  data: ReceiptData;
}

interface SavedReceiptsProps {
  currentData: ReceiptData;
  onLoad: (data: ReceiptData) => void;
}

export const SavedReceiptsSection: React.FC<SavedReceiptsProps> = ({ currentData, onLoad }) => {
  const [savedReceipts, setSavedReceipts] = useState<SavedReceipt[]>([]);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('receipt_saved_history');
    if (saved) setSavedReceipts(JSON.parse(saved));
  }, []);

  const handleSaveReceipt = () => {
    if (!saveName.trim()) return;
    const newSave: SavedReceipt = {
      id: Date.now().toString(),
      name: saveName.trim(),
      date: new Date().toLocaleString(),
      data: { ...currentData }
    };
    const updated = [newSave, ...savedReceipts];
    setSavedReceipts(updated);
    localStorage.setItem('receipt_saved_history', JSON.stringify(updated));
    setSaveName('');
  };

  const loadReceipt = (id: string) => {
    const target = savedReceipts.find(r => r.id === id);
    if (target) {
      onLoad(target.data);
    }
  };

  const deleteReceipt = (id: string) => {
    const updated = savedReceipts.filter(r => r.id !== id);
    setSavedReceipts(updated);
    localStorage.setItem('receipt_saved_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all saved receipts?")) {
      setSavedReceipts([]);
      localStorage.removeItem('receipt_saved_history');
    }
  };

  const quickDownload = async (saved: SavedReceipt) => {
    onLoad(saved.data);
    setTimeout(async () => {
      const element = document.querySelector('.receipt-wrapper') as HTMLElement;
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: saved.data.isTransparent ? null : saved.data.backgroundColor,
          scale: 2,
          logging: false,
        });
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `receipt_${saved.name.replace(/\s+/g, '_')}.png`;
        link.href = url;
        link.click();
      }
    }, 100);
  };

  return (
    <Accordion title="Saved Receipts" icon={<Save size={16} />}>
      <div className="form-group" style={{ display: 'flex', gap: '0.5rem' }}>
        <input 
          type="text" 
          className="form-input" 
          placeholder="Name your receipt..." 
          value={saveName} 
          onChange={(e) => setSaveName(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={handleSaveReceipt}>Save</button>
      </div>

      {savedReceipts.length > 0 && (
        <div className="saved-receipts-list">
          {savedReceipts.map(saved => (
            <div key={saved.id} className="saved-receipt-item" onClick={() => loadReceipt(saved.id)}>
              <div className="saved-receipt-info">
                <div className="saved-receipt-name">{saved.name}</div>
                <div className="saved-receipt-date">
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {saved.date}
                </div>
              </div>
              <div className="saved-receipt-actions">
                <button 
                  className="btn-icon" 
                  onClick={(e) => { e.stopPropagation(); quickDownload(saved); }}
                  title="Quick Download"
                >
                  <Download size={14} />
                </button>
                <button 
                  className="btn-icon text-danger" 
                  onClick={(e) => { e.stopPropagation(); deleteReceipt(saved.id); }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <button className="btn" style={{ width: '100%', marginTop: '0.5rem' }} onClick={clearHistory}>
            Clear All History
          </button>
        </div>
      )}
    </Accordion>
  );
};
