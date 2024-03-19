import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import MyGradientBackground from '@c/my-gradient-background';
import { FOOTER_HEIGHT } from '@u/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate, Easing } from 'react-native-reanimated';
import { SvgDataContext } from '@x/svg-data';
import { precise } from '@u/helper';

const Footer = () => {
    const insets = useSafeAreaInsets();
    const { svgData } = useContext(SvgDataContext);
    const screenWidth = Dimensions.get('window').width;

    const defaultMessage = "This is a development preview. Tips: Long press to delete the sketch. Double tap to select the path. Scroll the menu items to explore options.";

    const [message, setMessage] = useState(defaultMessage);

    const scrollAnimation = useSharedValue(0);

    const messageWidth = message.length * 8; // Adjust multiplier as needed to get the right width

    useEffect(() => {
        return () => {
            scrollAnimation.value = 0; // Reset the animation
        }
    }, []);


    useEffect(() => {
        scrollAnimation.value = 0; // Reset the animation
        scrollAnimation.value = withRepeat(withTiming(-messageWidth, { duration: 6666 * 500/(message.length), easing: Easing.linear }), -1, false);
    }, [message]);

    useEffect(() => {
        if(svgData.pathData.length === 0) {
            return;
        }

        const totals = svgData.pathData.reduce((acc, path) => {
            acc.totalPaths += 1;
            acc.totalVisiblePaths += path.visible ? 1 : 0;
            acc.totalSelectedPaths += path.selected ? 1 : 0;
            acc.totalPathLength += path.path.length;
            acc.totalPathTime += path.time;
            acc.totalVisiblePathsLength += path.visible ? path.path.length : 0;
            acc.totalSelectedPathsLength += path.selected ? path.path.length : 0;

            return acc;
        }, {
            totalPaths: 0,
            totalVisiblePaths: 0,
            totalSelectedPaths: 0,
            totalPathLength: 0,
            totalPathTime: 0,
            totalVisiblePathsLength: 0,
            totalSelectedPathsLength: 0,
        });

        const {
            totalPaths,
            totalVisiblePaths,
            totalSelectedPaths,
            totalPathLength,
            totalPathTime,
            totalVisiblePathsLength,
            totalSelectedPathsLength
        } = totals;

        if (totalPaths > 0) {
            let msg =  totalPaths + " Path | ";
            msg += "Length: " + totalPathLength + " | ";
            msg += "Time: " + precise(totalPathTime) + " | ";
            msg += "Hidden: " + (totalPaths - totalVisiblePaths) + " | ";
            msg += "Selected: " + (totalSelectedPaths) + " | ";
            msg += "Selected Length: " + totalSelectedPathsLength + " | ";

            // console.log(msg);
            setMessage(defaultMessage + " | " + msg);
        }
    },[svgData])

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
        <View style={{
            position: 'absolute',
            bottom: insets.bottom,
            left: 0,
            right: 0,
            height: FOOTER_HEIGHT,
            justifyContent: 'center',
            borderTopWidth: 1,
            borderTopColor: '#4f236d',
            zIndex: 99,
        }}>
            <MyGradientBackground reverse={true}>
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
            </MyGradientBackground>
        </View>
    );
};


export default Footer;
