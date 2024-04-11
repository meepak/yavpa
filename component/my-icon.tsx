import React, { Component, forwardRef } from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Svg, Path } from 'react-native-svg';
import { getIcon } from '@u/icons';
import { MY_BLACK } from '@u/types';

export interface MyIconStyle {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  marginBottom?: number;
  marginLeft?: number;
  paddingRight?: number;
  transform?: string;
}

export interface MyIconProps {
  name: string;
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: MyIconStyle;
  activeOpacity?: number;
  hitSlop?: { top: number, left: number, bottom: number, right: number };
}

const MyIcon = forwardRef((props: MyIconProps, ref: React.Ref<any>) => {
  const { name, onPress, onPressIn, onPressOut, size, color, fill, strokeWidth, style, activeOpacity, hitSlop } = props;
  const { paths, transform, viewBox } = getIcon(name);
  let width = parseFloat(viewBox.split(' ')[2]);
  let height = parseFloat(viewBox.split(' ')[3]);
  const iconWidth = style?.size || size || width;
  const iconHeight = iconWidth * height / width;

  return (
    <TouchableOpacity
      ref={ref}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={hitSlop}
      activeOpacity={activeOpacity || 0.55}
    >
      <Svg
        width={iconWidth}
        height={iconHeight}
        viewBox={viewBox}
        style={{
          marginBottom: style?.marginBottom || 0,
          marginLeft: style?.marginLeft || 0,
          paddingRight: style?.paddingRight || 0
        }}
      >
        {paths.map((path, index) => (
          <Path
            key={index}
            d={path}
            stroke={style?.color || color || '#FFFFFF'}
            strokeWidth={style?.strokeWidth || strokeWidth || 1}
            fill={style?.fill || fill || 'transparent'}
            transform={style?.transform || transform}
          />
        ))}
      </Svg>
    </TouchableOpacity>
  );
});

export default MyIcon;