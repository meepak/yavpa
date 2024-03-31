import React, { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate, Easing } from 'react-native-reanimated';

interface TickerProps {
    message: string;
}

const MyTicker: React.FC<TickerProps> = ({ message }) => {
    const scrollAnimation = useSharedValue(0);
    const messageWidth = message.length * 8; // Adjust multiplier as needed to get the right width

    useEffect(() => {
        scrollAnimation.value = 0; // Reset the animation
        scrollAnimation.value = withRepeat(withTiming(-messageWidth, { duration: 6666 * 500 / (message.length), easing: Easing.linear }), -1, false);
    }, [message]);

    const animatedStyle = useAnimatedStyle(() => {
        const x = interpolate(
            scrollAnimation.value,
            [-messageWidth, 0],
            [-messageWidth, 0]
        );

        return {
            transform: [{ translateX: x }],
        };
    });

    return (
        <Animated.View
            style={[{
                flexDirection: 'row',
                width: messageWidth * 2, // Double the width to accommodate two instances of the message
            }, animatedStyle]}
        >
            <Text numberOfLines={1} style={{ color: '#FFFFFF', width: messageWidth }}>
                {message}
            </Text>
            <Text numberOfLines={1} style={{ color: '#FFFFFF', width: messageWidth }}>
                {message}
            </Text>
        </Animated.View>
    );
};

export default MyTicker;