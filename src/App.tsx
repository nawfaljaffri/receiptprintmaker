import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Moon, Sun, Image as ImageIcon, FileText, ImagePlus } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Receipt } from './components/Receipt';
import type { ReceiptData } from './types';
import { defaultReceiptData } from './types';

const getInitialData = (): ReceiptData => {
  const savedData = localStorage.getItem('receipt_current_draft');
  if (savedData) {
    try {
      return JSON.parse(savedData);
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

  useEffect(() => {
    localStorage.setItem('receipt_current_draft', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

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
      <Sidebar data={data} onChange={setData} />
      
      <div className="preview-area">
        <div className="preview-toolbar">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          <Receipt ref={receiptRef} data={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
