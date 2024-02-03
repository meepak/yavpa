import React, { useState, useRef, useEffect } from 'react';
import { View, PanResponder, Dimensions, Animated, Text } from 'react-native';
import Svg, { Line, Rect, } from 'react-native-svg';
import { ColorBoxProps } from "@cc/color-box/interface";

const ColorHunter = ({ initialColor = '#000000', onColorSelected }: ColorBoxProps) => {
  const [selectedColor, setSelectedColor] = useState(initialColor || 'hsl(0, 0%, 0%)');
  const arrowOpacity = useRef(new Animated.Value(0)).current;
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setSelectedColor(initialColor)
  }, [initialColor])

  useEffect(() => {
    if (!dragging && onColorSelected) {
      onColorSelected(selectedColor)
    }
  }, [dragging])
  // Function to calculate line color segments based on touch position
  const calculateLineColors = (hue, saturation, lightness) => {
    return {
      vertical: [
        `hsl(${hue}, ${saturation}%, ${(lightness + 20) % 100}%)`, // Above center
        `hsl(${hue}, ${saturation}%, ${(lightness + 10) % 100}%)`, // Just above center
        selectedColor, // Center
        `hsl(${hue}, ${saturation}%, ${(lightness - 10 + 100) % 100}%)`, // Just below center
        `hsl(${hue}, ${saturation}%, ${(lightness - 20 + 100) % 100}%)`, // Below center
      ],
      horizontal: [
        `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness}%)`, // Right of center
        `hsl(${(hue + 30) % 360}, ${saturation}%, ${lightness}%)`, // Just right of center
        selectedColor, // Center
        `hsl(${(hue - 30 + 360) % 360}, ${saturation}%, ${lightness}%)`, // Just left of center
        `hsl(${(hue - 60 + 360) % 360}, ${saturation}%, ${lightness}%)`, // Left of center
      ],
      diagonalLeft: [
        `hsl(${(hue + 45) % 360}, ${saturation}%, ${lightness}%)`,
        `hsl(${(hue + 22.5) % 360}, ${saturation}%, ${lightness}%)`,
        selectedColor,
        `hsl(${(hue - 22.5 + 360) % 360}, ${saturation}%, ${lightness}%)`,
        `hsl(${(hue - 45 + 360) % 360}, ${saturation}%, ${lightness}%)`,
      ],
      diagonalRight: [
        `hsl(${(hue - 45 + 360) % 360}, ${saturation}%, ${lightness}%)`,
        `hsl(${(hue - 22.5 + 360) % 360}, ${saturation}%, ${lightness}%)`,
        selectedColor,
        `hsl(${(hue + 22.5) % 360}, ${saturation}%, ${lightness}%)`,
        `hsl(${(hue + 45) % 360}, ${saturation}%, ${lightness}%)`,
      ],
    };
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        handleColorChange(e);
        setDragging(true);
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: handleColorChange,
      onPanResponderRelease: () => {
        setDragging(false);
        if (onColorSelected) {
          onColorSelected(selectedColor);
        }
        Animated.timing(arrowOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  function handleColorChange(e) {
    const { locationX, locationY } = e.nativeEvent;
    const { width, height } = Dimensions.get('window');

    const hue = Math.floor((locationX / width) * 360);
    const lightness = Math.floor((locationY / height) * 100);
    const saturation = 100;
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    setSelectedColor(color);
  }

  function getInverseColor(color: string) {
    if (typeof color === 'string') {
      const match = color.match(/\d+/g);
      if (match) {
        let hue = Math.floor(parseFloat(match[0]));
        const saturation = Math.floor(parseFloat(match[1]));
        let lightness = Math.floor(parseFloat(match[2]));

        // Adjust hue
        hue = (hue <= 180) ? hue + 180 : hue - 180;

        // Adjust lightness
        lightness = 100 - lightness;

        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      } else {
        console.error('Invalid color format. Expected format: hsl(hue, saturation%, lightness%)');
      }
    }
  }


  // Calculate the color segments for the lines
  const { width, height } = Dimensions.get('window');
  let hue = 0;
  let lightness = 0;

  if (typeof selectedColor === 'string') {
    const match = selectedColor.match(/\d+/g);
    if (match) {
      hue = Math.floor(parseFloat(match[0]));
      lightness = Math.floor(parseFloat(match[2]));
    } else {
      console.error('Invalid color format. Expected format: hsl(hue, saturation%, lightness%)');
    }
  } else {
    console.error('Invalid color type. Expected a string.');
  }
  const saturation = 100;
  const lineColors = calculateLineColors(hue, saturation, lightness);

  return (
    <View {...panResponder.panHandlers} style={{ flex: 1 }}>
      <Svg height="100%" width="100%">
        <Text style={{ color: getInverseColor(selectedColor), paddingLeft: 5 }}>
          {selectedColor.replace('(', '(\n').replace(')', '\n)').split(',').join(',\n')}
        </Text>
        <Text style={{ color: getInverseColor(selectedColor), position: 'absolute', bottom: -40, left: 10 }}>
          DRAG ME
          </Text>
        <Rect x="0" y="0" width="100%" height="100%" fill={selectedColor} />
      </Svg>
      {dragging && (
        <Animated.View style={{ opacity: arrowOpacity, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Svg height="100%" width="100%">
            {/* Vertical line segments */}
            {lineColors.vertical.slice().reverse().map((color, index) => (
              <Line key={index} x1="50%" y1={`${index * 20}%`} x2="50%" y2={`${(index + 1) * 20}%`} stroke={color} strokeWidth="4" />
            ))}

            {/* Horizontal line segments */}
            {lineColors.horizontal.slice().reverse().map((color, index) => (
              <Line key={index} x1={`${index * 20}%`} y1="50%" x2={`${(index + 1) * 20}%`} y2="50%" stroke={color} strokeWidth="4" />
            ))}

            {/* Diagonal line segments (left) */}
            {lineColors.diagonalLeft.map((color, index) => (
              <Line key={index} x1={`${index * 20}%`} y1={`${index * 20}%`} x2={`${(index + 1) * 20}%`} y2={`${(index + 1) * 20}%`} stroke={color} strokeWidth="4" />
            ))}

            {/* Diagonal line segments (right) */}
            {lineColors.diagonalRight.map((color, index) => (
              <Line key={index} x1={`${index * 20}%`} y1={`${(100 - index * 20)}%`} x2={`${(index + 1) * 20}%`} y2={`${(100 - (index + 1) * 20)}%`} stroke={color} strokeWidth="4" />
            ))}
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};

export default ColorHunter;
