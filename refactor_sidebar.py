import re

with open('src/components/Sidebar.tsx', 'r') as f:
    content = f.read()

# Add imports
imports = """import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Building, CalendarDays, ShoppingBag, Calculator, Palette, MessageSquare, Plus, Trash2, Sliders, Menu, ChevronLeft, GripVertical, QrCode } from 'lucide-react';"""

content = re.sub(r"import \{ Building.*?\} from 'lucide-react';", imports, content)

# Add SortableSection
sortable_section = """
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
"""

content = content.replace("export const Sidebar", sortable_section + "\nexport const Sidebar")

# Add sensors and drag handler inside Sidebar
sidebar_start = "export const Sidebar: React.FC<SidebarProps> = ({ data, onChange }) => {"
sidebar_setup = """export const Sidebar: React.FC<SidebarProps> = ({ data, onChange }) => {
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
"""
content = content.replace(sidebar_start, sidebar_setup)

# We need to extract the Accordions and wrap them.
# I will just write the whole Accordions part manually because it's easier.

accordions_replacement = """
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
"""

# We need to replace everything from `<Accordion title="Header & Store Info"` down to `</Accordion>` for Footer, and then insert the other accordions (styling, effects).
# Let's find the boundaries using regex or string splitting.

start_index = content.find('<Accordion \n          title="Header & Store Info"')
if start_index == -1:
    start_index = content.find('<Accordion title="Header & Store Info"')

end_index = content.find('<Accordion title="Styling & Format"')

if start_index != -1 and end_index != -1:
    content = content[:start_index] + accordions_replacement + content[end_index:]

# Also add divider dropdown inside Styling & Format
styling_addition = """
          <div className="form-group">
            <label className="form-label">Divider Style</label>
            <CustomSelect 
              options={[
                { label: 'Dashed', value: 'dashed' },
                { label: 'Solid', value: 'solid' },
                { label: 'Double', value: 'double' },
                { label: 'Dotted', value: 'dotted' },
                { label: 'Asterisk (* * *)', value: 'asterisk' },
                { label: 'Empty (Space)', value: 'empty' }
              ]} 
              value={data.dividerStyle || 'dashed'} 
              onChange={(val) => handleSelectChange('dividerStyle', val)} 
            />
          </div>
"""

content = content.replace('<Accordion title="Styling & Format" icon={<Palette size={16} />}>', '<Accordion title="Styling & Format" icon={<Palette size={16} />}>' + styling_addition)

with open('src/components/Sidebar.tsx', 'w') as f:
    f.write(content)

