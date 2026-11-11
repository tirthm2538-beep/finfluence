'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  HistogramSeries,
  ColorType,
  CrosshairMode,
  IChartApi,
} from 'lightweight-charts';
import { OhlcCandle } from '../../types/portfolio';

interface TradingViewStockChartProps {
  candles: OhlcCandle[];
  symbol: string;
  isDark?: boolean;
  chartType?: 'candlestick' | 'area';
  height?: number;
}

export function TradingViewStockChart({
  candles,
  symbol,
  isDark = false,
  chartType = 'candlestick',
  height = 320,
}: TradingViewStockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [activeCandle, setActiveCandle] = useState<OhlcCandle | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return;

    const container = chartContainerRef.current;

    // Palette configuration matching FinFluence themes
    const bgColor = isDark ? '#020617' : '#ffffff';
    const textColor = isDark ? '#94a3b8' : '#475569';
    const gridColor = isDark ? 'rgba(30, 41, 59, 0.45)' : 'rgba(227, 222, 203, 0.55)';
    const borderColor = isDark ? '#1e293b' : '#e3decb';

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor,
        fontFamily: 'inherit',
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.5)',
          width: 1,
          style: 3,
        },
        horzLine: {
          color: isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.5)',
          width: 1,
          style: 3,
        },
      },
      timeScale: {
        borderColor,
        timeVisible: false,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.22, // space for volume bars below
        },
      },
    });

    chartRef.current = chart;

    // 1. Add Main Series (Candlestick or Area)
    if (chartType === 'candlestick') {
      const candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      const formattedData = candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      candleSeries.setData(formattedData);
    } else {
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: '#10b981',
        topColor: isDark ? 'rgba(16, 185, 129, 0.35)' : 'rgba(5, 150, 105, 0.35)',
        bottomColor: isDark ? 'rgba(16, 185, 129, 0.0)' : 'rgba(5, 150, 105, 0.0)',
        lineWidth: 2,
      });

      const formattedData = candles.map((c) => ({
        time: c.time as any,
        value: c.close,
      }));

      areaSeries.setData(formattedData);
    }

    // 2. Add Volume Histogram Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // overlay pane
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map((c) => ({
      time: c.time as any,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
    }));

    volumeSeries.setData(volumeData);

    // Initial fit
    chart.timeScale().fitContent();

    // Default active candle to the latest
    if (candles.length > 0) {
      setActiveCandle(candles[candles.length - 1]);
    }

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        if (candles.length > 0) setActiveCandle(candles[candles.length - 1]);
        return;
      }
      const match = candles.find((c) => c.time === param.time);
      if (match) {
        setActiveCandle(match);
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width: newWidth } = entries[0].contentRect;
      if (newWidth > 0) {
        chartRef.current.applyOptions({ width: newWidth });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, isDark, chartType, height]);

  const latest = activeCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="w-full flex flex-col bg-white border border-[#e3decb] rounded-2xl overflow-hidden shadow-xs dark:bg-slate-950 dark:border-slate-800">
      {/* TradingView Bar Readout Header */}
      {latest && (
        <div className="flex flex-wrap items-center justify-between px-3.5 py-2 border-b border-[#e5e1d5] bg-[#faf8f2] text-xs dark:bg-slate-900/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">{symbol}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{latest.time}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <div>
              <span className="text-slate-500 mr-1">O:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">₹{latest.open.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">H:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{latest.high.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">L:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">₹{latest.low.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1">C:</span>
              <span
                className={`font-black ${
                  latest.close >= latest.open
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ₹{latest.close.toFixed(2)}
              </span>
            </div>
            <div className="hidden sm:inline">
              <span className="text-slate-500 mr-1">Vol:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {latest.volume.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div ref={chartContainerRef} className="w-full relative" style={{ height: `${height}px` }} />
    </div>
  );
}
