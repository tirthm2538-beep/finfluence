'use client';

import React from 'react';
import { PortfolioHistoryPoint } from '../../types/portfolio';

interface PortfolioChartProps {
  history: PortfolioHistoryPoint[];
  isPositive?: boolean;
}

export function PortfolioChart({ history, isPositive = true }: PortfolioChartProps) {
  if (!history || history.length === 0) return null;

  const width = 360;
  const height = 90;
  const paddingX = 16;
  const paddingTop = 12;
  const paddingBottom = 20;

  const values = history.map((h) => h.value);
  const minVal = Math.min(...values) * 0.998;
  const maxVal = Math.max(...values) * 1.002;
  const range = maxVal - minVal || 1;

  const points = history.map((item, idx) => {
    const x = paddingX + (idx / (history.length - 1)) * (width - paddingX * 2);
    const y = paddingTop + (1 - (item.value - minVal) / range) * (height - paddingTop - paddingBottom);
    return { x, y, ...item };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  const strokeColor = isPositive ? '#10b981' : '#f43f5e'; // emerald-500 or rose-500
  const gradientId = isPositive ? 'chartGreenGrad' : 'chartRedGrad';

  return (
    <div className="w-full bg-slate-950/60 rounded-xl border border-slate-800/60 p-2 relative overflow-hidden">
      <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1 px-1">
        <span className="font-medium text-slate-300">Simulated Portfolio Trend</span>
        <span className="text-[8px] bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded text-slate-400">
          Practice Chart
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-20 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal reference baseline */}
        <line
          x1={paddingX}
          y1={paddingTop + (height - paddingTop - paddingBottom) / 2}
          x2={width - paddingX}
          y2={paddingTop + (height - paddingTop - paddingBottom) / 2}
          stroke="#334155"
          strokeDasharray="3 3"
          strokeWidth="0.8"
        />

        {/* Gradient Area Fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Trend Line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={idx === points.length - 1 ? '3.5' : '2'}
              fill={idx === points.length - 1 ? strokeColor : '#1e293b'}
              stroke={strokeColor}
              strokeWidth="1.5"
            />
            {/* Date label */}
            <text
              x={pt.x}
              y={height - 4}
              fontSize="8"
              fill="#94a3b8"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {pt.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
