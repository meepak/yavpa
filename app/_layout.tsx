import React, { useState } from 'react';
import { View, StatusBar, TouchableWithoutFeedback, TouchableHighlight, Pressable, Button, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Background } from "@c/background";
import { HeaderBar } from "@c/screens/browse";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@u/types";
import { SvgDataProvider } from "@x/svg-data";
import { Slot } from "expo-router";
import MyList from "./my-list";
import MyIcon from "@c/my-icon";
import Header, { HeaderGradientBackground } from "@c/screens/file/header";
import MyPathLogo from '@c/logo/my-path-logo';

export default function BrowseLayout() {
    const insets = useSafeAreaInsets();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuAnim = useSharedValue(220); // assuming -220 is the width of the menu
    const animatedValue = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: menuAnim.value }],
        };
    });


    const backdropStyles = useAnimatedStyle(() => {
        animatedValue.value = interpolate(
            menuAnim.value,
            [0, 220],
            [0, 1] // adjust scale values as needed
        );

        return {
            opacity: animatedValue.value,
        };
    });

    React.useEffect(() => {
        menuAnim.value = withTiming(menuOpen ? 0 : -220, { duration: 200 });
    }, [menuOpen]);

    return (
        <>
            <StatusBar hidden />
            <SvgDataProvider>
                {/* <Background> */}
                    <GestureHandlerRootView style={{ flex: 1, flexDirection: 'row' }}>
                        {/* <HeaderGradientBackground> */}
                            <View style={{ left: 0, top: 0, width: 80, height: SCREEN_HEIGHT }}>
                                <TouchableOpacity onPress={() => setMenuOpen(true)}>
                                    <MyPathLogo animate={false} width={42} height={42} />
                                </TouchableOpacity>
                                {/* <MyIcon name='menu' size={30} color='white' onPress={() => setMenuOpen(true)} /> */}
                            </View>
                        {/* </HeaderGradientBackground> */}
                        <View style={{ flex: 1 }}>
                            <Slot />
                        </View>
                        <View style={{ top: 0, right: 0 }}>

                         {/* <View style={{ top: 0, left: 0, height: 100 + insets.top }}>
                  
                            <Header
                                controlPanelButtons={controlButtons}
                                title={svgData?.metaData?.name || ""}
                                onTitleChange={handleNameChange}
                                onScreenModeChanged={setCurrentScreenMode}
                                initialScreenMode={currentScreenMode}
                            />
                        </View>  */}
                        </View>
                        {menuOpen && (
                            <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
                                <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'black', zIndex: 98 }, backdropStyles]} />
                            </TouchableWithoutFeedback>
                        )}
                        <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: 220, height: SCREEN_HEIGHT, zIndex: 99 }, animatedStyles]}>
                            <MyList onSelected={() => setMenuOpen(false)}/>
                        </Animated.View>
                    </GestureHandlerRootView>
                {/* </Background> */}
            </SvgDataProvider>
        </>
    );
}