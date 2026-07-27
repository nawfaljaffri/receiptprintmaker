import { useState, useRef, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Moon, Sun, Image as ImageIcon, FileText, ImagePlus, Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Receipt } from './components/Receipt';
import type { ReceiptData } from './types';
import { defaultReceiptData } from './types';

const getInitialData = (): ReceiptData => {
  const savedData = localStorage.getItem('receipt_current_draft');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      // Merge with default data to ensure new properties exist
      return { ...defaultReceiptData, ...parsed, sectionOrder: parsed.sectionOrder || defaultReceiptData.sectionOrder };
    } catch (e) {
      console.error('Failed to parse saved draft', e);
    }
  }
  return defaultReceiptData;
};

function App() {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ReceiptData>(getInitialData);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(100);

  // Undo/Redo history stack
  const historyRef = useRef<ReceiptData[]>([getInitialData()]);
  const historyIndexRef = useRef(0);
  const skipHistoryRef = useRef(false); // prevent undo/redo from pushing to history

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  useEffect(() => {
    localStorage.setItem('receipt_current_draft', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard shortcuts: Cmd+Z / Cmd+Shift+Z
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSetData = useCallback((newData: ReceiptData) => {
    const merged = {
      ...defaultReceiptData,
      ...newData,
      sectionOrder: newData.sectionOrder || defaultReceiptData.sectionOrder
    };
    setData(merged);
    // Push to history (trim redo stack)
    if (!skipHistoryRef.current) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(merged);
      if (newHistory.length > 50) newHistory.shift(); // cap at 50
      historyRef.current = newHistory;
      historyIndexRef.current = newHistory.length - 1;
    }
  }, []);

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    skipHistoryRef.current = true;
    setData(historyRef.current[historyIndexRef.current]);
    skipHistoryRef.current = false;
  }, []);

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    skipHistoryRef.current = true;
    setData(historyRef.current[historyIndexRef.current]);
    skipHistoryRef.current = false;
  }, []);

  const getCanvas = async () => {
    if (!receiptRef.current) return null;
    
    // Create a temporary clone to render properly if we want a specific background color
    const element = receiptRef.current;
    
    setIsExporting(true);
    
    // We wait for react to render the isExporting state if needed (though we don't change receipt visually)
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(element, {
      backgroundColor: data.isTransparent ? null : data.backgroundColor,
      scale: 2, // Higher quality
      logging: false,
      useCORS: true,
    });

    setIsExporting(false);
    return canvas;
  };

  const exportAsPNG = async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `receipt_${data.orderNumber}.png`;
    link.click();
  };

  const exportAsJPEG = async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    
    const element = receiptRef.current;
    if (!element) return;
    
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 100));

    const jpegCanvas = await html2canvas(element, {
      backgroundColor: data.isTransparent ? '#ffffff' : data.backgroundColor,
      scale: 2,
      logging: false,
    });
    setIsExporting(false);

    const image = jpegCanvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = image;
    link.download = `receipt_${data.orderNumber}.jpg`;
    link.click();
  };

  const exportAsPDF = async () => {
    const canvas = await getCanvas();
    if (!canvas) return;
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions to match the receipt aspect ratio
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`receipt_${data.orderNumber}.pdf`);
  };

  return (
    <div className="app-container">
      <Sidebar data={data} onChange={handleSetData} />
      
      <div className="preview-area">
        <div className="preview-toolbar">
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              className="btn btn-icon"
              onClick={handleUndo}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              className="btn btn-icon"
              onClick={handleRedo}
              disabled={!canRedo}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>

            {/* Zoom divider */}
            <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 0.25rem' }} />

            <button
              className="btn btn-icon"
              onClick={() => setZoom(z => Math.max(50, z - 10))}
              disabled={zoom <= 50}
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <span style={{ fontSize: '0.75rem', minWidth: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              {zoom}%
            </span>
            <button
              className="btn btn-icon"
              onClick={() => setZoom(z => Math.min(200, z + 10))}
              disabled={zoom >= 200}
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>

            <div style={{ width: 1, height: 20, background: 'var(--border-color)', margin: '0 0.25rem' }} />

            <button className="btn btn-icon" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={exportAsPNG} disabled={isExporting}>
              <ImageIcon size={16} /> PNG
            </button>
            <button className="btn btn-primary" onClick={exportAsJPEG} disabled={isExporting}>
              <ImagePlus size={16} /> JPG
            </button>
            <button className="btn btn-primary" onClick={exportAsPDF} disabled={isExporting}>
              <FileText size={16} /> PDF
            </button>
          </div>
        </div>
        
        <div className="preview-content">
          {/* Zoom container: transforms scale but preserves scroll */}
          <div style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease',
          }}>
            <Receipt ref={receiptRef} data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
