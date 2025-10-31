// @ts-ignore;
import React from 'react';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
export function SkillRadar({
  data
}) {
  return <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="skill" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar name="匹配度" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>;
}