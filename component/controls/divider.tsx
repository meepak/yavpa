import React from 'react';
import { Svg, Line } from 'react-native-svg';

const Divider = ({ width, color, height=1, margin=10, horizontal=true }) => (
  horizontal ?
  <Svg width={width} height={height} style={{ marginVertical: margin }}>
    <Line
      x1="0"
      y1="0"
      x2={width}
      y2="0"
      stroke={color}
      strokeWidth={height}
    />
  </Svg>
    : <Svg width={width} height={height} style={{ marginHorizontal: margin }}>
      <Line
        x1={0}
        y1={0}
        x2={0}
        y2={height}
        stroke={color}
        strokeWidth={width}
      />
    </Svg>
);

export default Divider;