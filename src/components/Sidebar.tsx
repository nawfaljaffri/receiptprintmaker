import React, { useState, useEffect } from 'react';
import { Accordion } from './Accordion';
import { CustomSelect } from './CustomSelect';
import type { ReceiptData } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building, CalendarDays, ShoppingBag, Calculator, Palette, MessageSquare, Plus, Trash2, Sliders, Menu, ChevronLeft, GripVertical, QrCode } from 'lucide-react';
import { SavedReceiptsSection } from './sidebar/SavedReceiptsSection';

interface SidebarProps {
  data: ReceiptData;
  onChange: (data: ReceiptData) => void;
}

const Toggle: React.FC<{ checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string }> = ({ checked, onChange, name }) => (
  <label className="toggle-switch">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} />
    <span className="toggle-slider"></span>
  </label>
);

const LabeledToggle: React.FC<{ label: string, checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, name: string }> = ({ label, checked, onChange, name }) => (
  <div className="toggle-wrapper">
    <span className="form-label" style={{ marginBottom: 0 }}>{label}</span>
    <Toggle checked={checked} onChange={onChange} name={name} />
  </div>
);


const SortableSection: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative' as const,
    zIndex: transform ? 1 : 0
  };

  return (
    <div ref={setNodeRef} style={style} className="sortable-section">
      <div 
        {...attributes} 
        {...listeners} 
        className="sortable-section-grip"
      >
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ data, onChange }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = data.sectionOrder.indexOf(active.id);
      const newIndex = data.sectionOrder.indexOf(over.id);
      
      onChange({
        ...data,
        sectionOrder: arrayMove(data.sectionOrder, oldIndex, newIndex),
      });
    }
  };

  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const colors = localStorage.getItem('receipt_recent_colors');
    if (colors) setRecentColors(JSON.parse(colors));
  }, []);

  const saveColorToCache = (color: string) => {
    if (!recentColors.includes(color)) {
      const updated = [color, ...recentColors].slice(0, 10);
      setRecentColors(updated);
      localStorage.setItem('receipt_recent_colors', JSON.stringify(updated));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number' || type === 'range') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    onChange({ ...data, [name]: parsedValue });
  };

  const handleSelectChange = (name: string, value: string) => {
    onChange({ ...data, [name]: value });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
    saveColorToCache(e.target.value);
  };

  const applyColor = (name: string, color: string) => {
    onChange({ ...data, [name]: color });
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: 'New Item',
      quantity: 1,
      price: 0,
      secondaryName: data.itemLayout === 'comparative' ? 'Item B' : undefined,
      secondaryPrice: data.itemLayout === 'comparative' ? 0 : undefined,
    };
    onChange({ ...data, items: [...data.items, newItem] });
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    const newItems = data.items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange({ ...data, items: newItems });
  };

  const removeItem = (id: string) => {
    onChange({ ...data, items: data.items.filter(item => item.id !== id) });
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: isCollapsed ? 'none' : 'block' }}>ReceiptMaker</h1>
        <button className="btn-icon" onClick={() => setIsCollapsed(!isCollapsed)} title="Toggle Sidebar">
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <div className="sidebar-content" style={{ display: isCollapsed ? 'none' : 'block' }}>
        <SavedReceiptsSection currentData={data} onLoad={onChange} />

        
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
            {data.sectionOrder.map(sectionId => {
              switch (sectionId) {
                case 'header':
                  return (
                    <SortableSection key="header" id="header">
                      <Accordion title="Header & Store Info" icon={<Building size={16} />} headerAction={<Toggle name="showStoreInfo" checked={data.showStoreInfo} onChange={handleChange} />}>
                        <div className="form-group"><label className="form-label">Store Name</label><input className="form-input" name="storeName" value={data.storeName} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" name="storeAddress" value={data.storeAddress} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Phone</label><input className="form-input" name="storePhone" value={data.storePhone} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Website</label><input className="form-input" name="storeWebsite" value={data.storeWebsite} onChange={handleChange} /></div>
                      </Accordion>
                    </SortableSection>
                  );
                case 'details':
                  return (
                    <SortableSection key="details" id="details">
                      <Accordion title="Date & Details" icon={<CalendarDays size={16} />} headerAction={<Toggle name="showDateDetails" checked={data.showDateDetails} onChange={handleChange} />}>
                        <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-input" name="date" value={data.date} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Time</label><input type="time" className="form-input" name="time" value={data.time} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Order Number</label><input className="form-input" name="orderNumber" value={data.orderNumber} onChange={handleChange} /></div>
                        <div className="form-group"><label className="form-label">Server/Cashier Name</label><input className="form-input" name="cashierName" value={data.cashierName} onChange={handleChange} /></div>
                      </Accordion>
                    </SortableSection>
                  );
                case 'items':
                  return (
                    <SortableSection key="items" id="items">
                      <Accordion title="Items" icon={<ShoppingBag size={16} />}>
                        <div className="form-group">
                          <label className="form-label">Item Layout Mode</label>
                          <CustomSelect options={[{ label: 'Standard (1 Column)', value: 'standard' }, { label: 'Comparative (2 Columns)', value: 'comparative' }]} value={data.itemLayout} onChange={(val) => handleSelectChange('itemLayout', val)} />
                        </div>
                        {data.items.map((item) => (
                          <div key={item.id} className="item-edit-grid">
                            <div className="item-edit-grid-header">
                              <span>Qty: <input type="number" className="form-input" style={{width: '60px', display: 'inline', padding: '0.2rem'}} value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} min="1" /></span>
                              <button className="btn-icon" onClick={() => removeItem(item.id)}><Trash2 size={14} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                              <input className="form-input" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} placeholder={data.itemLayout === 'comparative' ? "Side A Name" : "Item name"} />
                              <input type="number" className="form-input" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))} step="0.01" placeholder="Price" />
                            </div>
                            {data.itemLayout === 'comparative' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <input className="form-input" value={item.secondaryName || ''} onChange={(e) => updateItem(item.id, 'secondaryName', e.target.value)} placeholder="Side B Name" />
                                <input type="number" className="form-input" value={item.secondaryPrice || 0} onChange={(e) => updateItem(item.id, 'secondaryPrice', parseFloat(e.target.value))} step="0.01" placeholder="Price" />
                              </div>
                            )}
                          </div>
                        ))}
                        <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={addItem}><Plus size={16} /> Add Item</button>
                      </Accordion>
                    </SortableSection>
                  );
                case 'totals':
                  return (
                    <SortableSection key="totals" id="totals">
                      <Accordion title="Totals & Tax" icon={<Calculator size={16} />} headerAction={<Toggle name="showTotals" checked={data.showTotals} onChange={handleChange} />}>
                        <div className="form-group"><label className="form-label">Tax Rate (%)</label><input type="number" className="form-input" name="taxRate" value={data.taxRate} onChange={handleChange} step="0.01" /></div>
                        <div className="form-group"><label className="form-label">Discount Amount</label><input type="number" className="form-input" name="discount" value={data.discount} onChange={handleChange} step="0.01" /></div>
                        <div className="form-group"><label className="form-label">Currency Symbol</label><input className="form-input" name="currencySymbol" value={data.currencySymbol} onChange={handleChange} /></div>
                      </Accordion>
                    </SortableSection>
                  );
                case 'footer':
                  return (
                    <SortableSection key="footer" id="footer">
                      <Accordion title="Footer & Extras" icon={<MessageSquare size={16} />} headerAction={<Toggle name="showFooter" checked={data.showFooter} onChange={handleChange} />}>
                        <div className="form-group"><label className="form-label">Footer Message</label><textarea className="form-textarea" name="footerMessage" value={data.footerMessage} onChange={handleChange} /></div>
                      </Accordion>
                    </SortableSection>
                  );
                case 'barcode':
                  return (
                    <SortableSection key="barcode" id="barcode">
                      <Accordion title="Barcode / QR" icon={<QrCode size={16} />} headerAction={<Toggle name="showBarcode" checked={data.showBarcode} onChange={handleChange} />}>
                        <div className="form-group">
                          <label className="form-label">Code Type</label>
                          <CustomSelect options={[{ label: 'Barcode', value: 'barcode' }, { label: 'QR Code', value: 'qrcode' }]} value={data.barcodeType || 'barcode'} onChange={(val) => handleSelectChange('barcodeType', val)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Code Value / URL</label>
                          <input className="form-input" name="barcodeValue" value={data.barcodeValue || ''} onChange={handleChange} placeholder="e.g. 123456789 or https://google.com" />
                        </div>
                      </Accordion>
                    </SortableSection>
                  );
                default:
                  return null;
              }
            })}
          </SortableContext>
        </DndContext>
<Accordion title="Styling & Format" icon={<Palette size={16} />}>
          <div className="form-group">
            <label className="form-label">Divider Style</label>
            <CustomSelect 
              options={[
                { label: 'Dashed ( - - - )', value: 'dashed' },
                { label: 'Equals ( = = = )', value: 'equals' },
                { label: 'Solid ( ——— )', value: 'solid' },
                { label: 'Double ( ═══ )', value: 'double' },
                { label: 'Dotted ( · · · )', value: 'dotted' },
                { label: 'Asterisk ( *** )', value: 'asterisk' },
                { label: 'Empty (Space)', value: 'empty' }
              ]} 
              value={data.dividerStyle || 'dashed'} 
              onChange={(val) => handleSelectChange('dividerStyle', val)} 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Paper Style</label>
            <CustomSelect 
              options={[
                { label: 'Thermal Printer', value: 'thermal' },
                { label: 'Clean Modern', value: 'clean' }
              ]} 
              value={data.paperStyle} 
              onChange={(val) => handleSelectChange('paperStyle', val)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Receipt Width</label>
            <CustomSelect 
              options={[
                { label: 'Auto (Fit Content)', value: 'auto' },
                { label: '58mm (Narrow)', value: '58mm' },
                { label: '80mm (Standard)', value: '80mm' }
              ]} 
              value={data.receiptWidth || 'auto'} 
              onChange={(val) => handleSelectChange('receiptWidth', val)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Font Family</label>
            <CustomSelect 
              options={[
                { label: 'Monospace (Classic)', value: 'monospace' },
                { label: 'Sans Serif (Modern)', value: 'sans' }
              ]} 
              value={data.fontFamily} 
              onChange={(val) => handleSelectChange('fontFamily', val)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Background Color</label>
            <div className="color-input-row">
              <div className="color-picker-box">
                <input type="color" name="backgroundColor" value={data.backgroundColor} onChange={handleColorChange} />
              </div>
              <input type="text" className="form-input" name="backgroundColor" value={data.backgroundColor} onChange={handleColorChange} />
            </div>
            {recentColors.length > 0 && (
              <div className="color-swatches" style={{ marginTop: '0.5rem' }}>
                {recentColors.map(color => (
                  <div key={color} className="color-swatch" style={{ backgroundColor: color }} onClick={() => applyColor('backgroundColor', color)} />
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Text Color</label>
            <div className="color-input-row">
              <div className="color-picker-box">
                <input type="color" name="textColor" value={data.textColor} onChange={handleColorChange} />
              </div>
              <input type="text" className="form-input" name="textColor" value={data.textColor} onChange={handleColorChange} />
            </div>
            {recentColors.length > 0 && (
              <div className="color-swatches" style={{ marginTop: '0.5rem' }}>
                {recentColors.map(color => (
                  <div key={color} className="color-swatch" style={{ backgroundColor: color }} onClick={() => applyColor('textColor', color)} />
                ))}
              </div>
            )}
          </div>

          <LabeledToggle label="Transparent Background (PNG export)" name="isTransparent" checked={data.isTransparent} onChange={handleChange} />
        </Accordion>

        <Accordion title="Effects" icon={<Sliders size={16} />}>
          <div className="form-group">
            <label className="form-label">
              <span>Ink Patchiness / Grain</span>
              <span>{data.effectNoise}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectNoise" min="0" max="100" value={data.effectNoise} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Text Bleed / Blur</span>
              <span>{data.effectBleed}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectBleed" min="0" max="100" value={data.effectBleed} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Thermal Fade</span>
              <span>{data.effectFade}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectFade" min="0" max="100" value={data.effectFade} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Paper Creases</span>
              <span>{data.effectCreases}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectCreases" min="0" max="100" value={data.effectCreases} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Printer Scratches</span>
              <span>{data.effectScratches}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectScratches" min="0" max="100" value={data.effectScratches} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Paper Warp / Distortion</span>
              <span>{data.effectWarp}%</span>
            </label>
            <input type="range" style={{ width: '100%' }} name="effectWarp" min="0" max="100" value={data.effectWarp} onChange={handleChange} />
          </div>
        </Accordion>

      </div>
    </div>
  );
};
