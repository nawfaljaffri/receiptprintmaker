import React, { forwardRef, useMemo } from 'react';
import Barcode from 'react-barcode';
import QRCode from 'react-qr-code';
import type { ReceiptData } from '../types';
import { ReceiptHeader } from './receipt/ReceiptHeader';
import { ReceiptDetails } from './receipt/ReceiptDetails';
import { ReceiptItems } from './receipt/ReceiptItems';
import { ReceiptTotals } from './receipt/ReceiptTotals';
import { ReceiptFooter } from './receipt/ReceiptFooter';

interface ReceiptProps {
  data: ReceiptData;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data }, ref) => {
  const {
    storeName,
    storeAddress,
    storePhone,
    storeWebsite,
    date,
    time,
    orderNumber,
    cashierName,
    items,
    taxRate,
    discount,
    currencySymbol,
    footerMessage,
    showStoreInfo,
    showDateDetails,
    showTotals,
    showFooter,
    showBarcode,
    paperStyle,
    fontFamily,
    backgroundColor,
    textColor,
    isTransparent,
    receiptWidth,
    itemLayout,
    effectNoise,
    effectBleed,
    effectFade,
    effectCreases,
    effectScratches,
    effectWarp,
    dividerStyle,
    sectionOrder,
    barcodeType,
    barcodeValue
  } = data;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;

  const renderBarcode = useMemo(() => {
    if (!showBarcode || !barcodeValue) return null;
    
    return (
      <div className="barcode-container" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem', overflow: 'hidden' }}>
        {barcodeType === 'qrcode' ? (
          <QRCode 
            value={barcodeValue} 
            size={120} 
            level="M"
            bgColor="transparent" 
            fgColor="currentColor" 
          />
        ) : (
          <Barcode 
            value={barcodeValue} 
            width={barcodeValue.length > 10 ? 1.5 : 2}
            height={50} 
            displayValue={false} 
            background="transparent" 
            lineColor="currentColor" 
            margin={0}
          />
        )}
      </div>
    );
  }, [showBarcode, barcodeType, barcodeValue]);

  // Width: for 'auto', let CSS max-width cap it so character dividers don't overflow
  let actualWidth: string | undefined = undefined; // uses CSS default (320px)
  if (receiptWidth === '58mm') actualWidth = '220px';
  if (receiptWidth === '80mm') actualWidth = '302px';

  // Exponential scaling for smoother slider control
  const warpIntensity = Math.pow(effectWarp / 100, 2);
  const blurIntensity = Math.pow(effectBleed / 100, 2);
  const noiseIntensity = Math.pow(effectNoise / 100, 2);

  const warpScale = warpIntensity * 12; // up to 12px of displacement
  const blurAmount = blurIntensity * 1.5;
  const noiseSlope = noiseIntensity * 2; // max slope of 2

  const inkFilterEnabled = effectBleed > 0 || effectNoise > 0;
  const warpFilterEnabled = effectWarp > 0;

  const dynamicStyles: React.CSSProperties = {
    fontFamily: fontFamily === 'monospace' ? "'JetBrains Mono', monospace" : `'${fontFamily}', sans-serif`,
    backgroundColor: isTransparent ? 'transparent' : backgroundColor,
    color: textColor,
    width: actualWidth,
    // Apply the warp filter to the ENTIRE receipt wrapper so edges distort too
    filter: warpFilterEnabled ? 'url(#paper-warp)' : 'none',
    transform: 'translateZ(0)', // Force hardware acceleration for Safari SVG performance
    // Realistic effects custom properties
    '--receipt-bg-color': isTransparent ? 'transparent' : backgroundColor,
    '--effect-crease-opacity': effectCreases / 100,
    '--effect-scratch-opacity': effectScratches / 100,
    '--effect-fade-opacity': effectFade / 100,
  } as React.CSSProperties;

  // Memoize the expensive SVG filter definitions so Safari doesn't recompile them on every keystroke
  const svgFilterDefs = useMemo(() => {
    if (!inkFilterEnabled && !warpFilterEnabled) return null;
    return (
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
        <defs>
          {warpFilterEnabled && (
            <filter id="paper-warp" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="warpNoise" />
              <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={warpScale} xChannelSelector="R" yChannelSelector="G" />
            </filter>
          )}

          {inkFilterEnabled && (
            <filter id="ink-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={blurAmount} result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="
                1 0 0 0 0  
                0 1 0 0 0  
                0 0 1 0 0  
                0 0 0 18 -7" result="bleed" />
              <feComposite in="SourceGraphic" in2="bleed" operator="over" result="thickInk" />

              <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="2" result="noise" />
              <feColorMatrix type="matrix" values="
                0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0.33 0.33 0.33 0 0
                0 0 0 1 0" in="noise" result="monoNoise" />
              
              <feComponentTransfer in="monoNoise" result="controlledNoise">
                <feFuncR type="linear" slope={noiseSlope} />
                <feFuncG type="linear" slope={noiseSlope} />
                <feFuncB type="linear" slope={noiseSlope} />
              </feComponentTransfer>

              <feBlend in="thickInk" in2="controlledNoise" mode="screen" result="textured" />
              <feComposite in="textured" in2="thickInk" operator="in" />
            </filter>
          )}
        </defs>
      </svg>
    );
  }, [inkFilterEnabled, warpFilterEnabled, warpScale, blurAmount, noiseSlope]);

  return (
    <div 
      ref={ref} 
      className={`receipt-wrapper style-${paperStyle} ${isTransparent ? 'transparent-bg' : ''}`}
      style={dynamicStyles}
    >
      {svgFilterDefs}

      {/* Creases and Scratches overlay layers */}
      <div className="effect-layer effect-crease"></div>
      <div className="effect-layer effect-scratch"></div>

      <div className="receipt-content" style={{ filter: inkFilterEnabled ? 'url(#ink-filter)' : 'none' }}>
        {sectionOrder.map((sectionId) => {
          switch (sectionId) {
            case 'header':
              return showStoreInfo ? (
                <ReceiptHeader 
                  key="header"
                  storeName={storeName} 
                  storeAddress={storeAddress} 
                  storePhone={storePhone} 
                  storeWebsite={storeWebsite} 
                  dividerStyle={dividerStyle}
                />
              ) : null;
            case 'details':
              return showDateDetails ? (
                <ReceiptDetails 
                  key="details"
                  date={date} 
                  time={time} 
                  orderNumber={orderNumber} 
                  cashierName={cashierName} 
                  dividerStyle={dividerStyle}
                />
              ) : null;
            case 'items':
              return (
                <ReceiptItems 
                  key="items"
                  items={items} 
                  itemLayout={itemLayout} 
                  currencySymbol={currencySymbol} 
                />
              );
            case 'totals':
              return showTotals ? (
                <ReceiptTotals 
                  key="totals"
                  subtotal={subtotal} 
                  tax={tax} 
                  taxRate={taxRate} 
                  discount={discount} 
                  total={total} 
                  currencySymbol={currencySymbol} 
                  dividerStyle={dividerStyle}
                />
              ) : null;
            case 'footer':
              return showFooter && footerMessage ? (
                <ReceiptFooter 
                  key="footer"
                  footerMessage={footerMessage} 
                  dividerStyle={dividerStyle}
                />
              ) : null;
            case 'barcode':
              return <React.Fragment key="barcode">{renderBarcode}</React.Fragment>;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
