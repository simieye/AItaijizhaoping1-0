// @ts-ignore;
import React from 'react';

// @ts-ignore;
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
export function DEIRadarChart({
  data
}) {
  return <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="category" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar name="当前水平" dataKey="current" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
        <Radar name="行业基准" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>;
}