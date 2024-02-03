import React from 'react';
import { Svg, Line } from 'react-native-svg';

const Divider = ({ width, color }) => (
  <Svg width={width} height="1" style={{marginVertical: 10}}>
    <Line
      x1="0"
      y1="0"
      x2={width}
      y2="0"
      stroke={color}
      strokeWidth="1"
    />
  </Svg>
);

export default Divider;