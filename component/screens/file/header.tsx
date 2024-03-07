import React, { useContext, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ControlPanel } from "component/controls";
import { MAX_HEADER_HEIGHT, SCREEN_HEIGHT, ScreenModes } from "@u/types";
import MyIcon from "@c/my-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyPathLogo from "@c/logo/my-path-logo";
import { LinearGradient } from "expo-linear-gradient";
import { SvgDataContext } from "@x/svg-data";

const HeaderGradientBackground = ({ children }) => (<>
    <LinearGradient
        colors={['#015ccd', '#a805ee', '#1d0f98']}
        style={{
            ...StyleSheet.absoluteFillObject,
            zIndex: -1,
        }} />
    {children}
</>)

const Header = ({
    title,
    onTitleChange,
    controlPanelButtons,
    initialScreenMode,
    onScreenModeChanged
}) => {
    const insets = useSafeAreaInsets();
    const [name, setName] = useState(title);
    const [screenMode, setScreenMode] = useState(initialScreenMode || ScreenModes[0]);
    const { svgData } = useContext(SvgDataContext);
    const [sorry, setSorry] = useState(false);


    const router = useRouter();

    useEffect(() => {
        setName(title);
    }, [title]);

    useEffect(() => {
        setScreenMode(initialScreenMode);
    }, [initialScreenMode])



    const handleScreenModeButtonPress = () => {
        // console.log('screen mode button pressed')
        const currentScreenModeIndex = ScreenModes.findIndex((mode) => mode.name === screenMode.name);
        if (ScreenModes[currentScreenModeIndex].name === "Draw") {
            if (svgData.pathData.length === 0) {
                setSorry(true);
                setTimeout(() => setSorry(false), 7000);
                return;
            }
        }
        const newScreenModeIndex = (currentScreenModeIndex + 1) % ScreenModes.length;
        const newScreenMode = ScreenModes[newScreenModeIndex];
        setScreenMode(newScreenMode);
        onScreenModeChanged && onScreenModeChanged(newScreenMode);
    };

    const handleBackButtonPress = () => {
        // console.log('baack pressed')
        if (router.canGoBack()) {
            router.back()
        }
        else {
            router.navigate("/browse")
        }
    }

    return (
        <>
            <HeaderGradientBackground>
                <View
                    style={{
                        top: insets.top,
                        right: insets.right,
                        // marginRight: 10,
                        // marginLeft: 5,
                        // flexDirection: "column",
                        // alignItems: "center",
                        // alignContent: "center",
                        // justifyContent: "space-between",
                        width: 120,
                        height: SCREEN_HEIGHT,
                    }}
                >
                    <TouchableOpacity onPress={handleBackButtonPress}>
                        <MyIcon name="back" color="#FFFFFF" strokeWidth={2} size={32} />
                    </TouchableOpacity>
                    <TextInput
                        style={{
                            flex: 1,
                            height: 40,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontSize: 22,
                            fontWeight: "300",
                            textAlign: "left",
                            borderWidth: 0,
                            paddingLeft: 10,
                        }}
                        onChangeText={setName}
                        onEndEditing={(e) => {
                            if (onTitleChange) {
                                onTitleChange(e.nativeEvent.text);
                            }
                        }}
                        value={name}
                        placeholder="Title"
                        enterKeyHint="done"
                        placeholderTextColor="rgba(255, 255, 255, 0.7)" />
                    <View style={{ bottom: -5, }}>
                        <MyPathLogo animate={false} width={48} height={48} />
                    </View>

                </View>
                <View style={{ marginTop: 30, bottom: -5, justifyContent: 'flex-end' }}>
                    <ControlPanel
                        buttons={controlPanelButtons}
                        paddingLeft={50}
                        paddingRight={10} />

                </View>
            </HeaderGradientBackground>
            <TouchableOpacity
                style={{ position: 'absolute', left: 10, bottom: -10 }}
                onPress={handleScreenModeButtonPress}
            >
                <View
                    pointerEvents="auto"
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: "#0000FF",
                        width: 55,
                        height: 55,
                        borderRadius: 30,
                    }}>
                    <MyIcon
                        name={screenMode.icon}
                        color="#FFFFFF" />
                </View>
            </TouchableOpacity >

                {
                    sorry ?
                        <View 
                        style={{ 
                            justifyContent: 'center', 
                            alignSelf: 'center', 
                            zIndex: -10, 
                            opacity: 0.5,
                            top: MAX_HEADER_HEIGHT,
                        }}>
                            {/* TODO PUT animated text */}
                            <Text style={{ alignSelf: 'center', color: 'black', fontSize: 21, fontWeight: 'bold' }}>
                                Sorry!
                            </Text> 
                            <Text style={{ alignSelf: 'center', color: 'black', fontSize: 21, fontWeight: 'bold' }}>
                                Empty screen can't be animated.
                            </Text>
                        </View>
                        : null
                }
        </>
    );
}

export { HeaderGradientBackground, Header as default };