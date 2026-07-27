import React, { forwardRef, useMemo } from 'react';
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
    effectWarp
  } = data;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax - discount;

  // Memoize barcode so it doesn't recalculate and cause lag on every keystroke
  const renderBarcode = useMemo(() => {
    if (!showBarcode) return null;
    
    const bars = [];
    let x = 0;
    let key = 0;
    while (x < 300) {
      const width = Math.random() > 0.5 ? 2 : Math.random() > 0.5 ? 4 : 6;
      if (Math.random() > 0.3) {
        bars.push(<rect key={key++} x={x} y={0} width={width} height={40} />);
      }
      x += width + (Math.random() > 0.5 ? 2 : 4);
    }
    return (
      <div className="barcode-container">
        <svg className="barcode-svg" viewBox="0 0 300 40" preserveAspectRatio="none">
          {bars}
        </svg>
      </div>
    );
  }, [showBarcode]); // It only recalculates if showBarcode toggles, meaning it stays static during editing

  let actualWidth = 'auto';
  if (receiptWidth === '58mm') actualWidth = '280px';
  if (receiptWidth === '80mm') actualWidth = '380px';

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
    fontFamily: fontFamily === 'monospace' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
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
        {showStoreInfo && (
          <ReceiptHeader 
            storeName={storeName} 
            storeAddress={storeAddress} 
            storePhone={storePhone} 
            storeWebsite={storeWebsite} 
          />
        )}

        {showDateDetails && (
          <ReceiptDetails 
            date={date} 
            time={time} 
            orderNumber={orderNumber} 
            cashierName={cashierName} 
          />
        )}

        <ReceiptItems 
          items={items} 
          itemLayout={itemLayout} 
          currencySymbol={currencySymbol} 
        />

        {showTotals && (
          <ReceiptTotals 
            subtotal={subtotal} 
            tax={tax} 
            taxRate={taxRate} 
            discount={discount} 
            total={total} 
            currencySymbol={currencySymbol} 
          />
        )}

        {showFooter && footerMessage && (
          <ReceiptFooter footerMessage={footerMessage} />
        )}

        {renderBarcode}
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
