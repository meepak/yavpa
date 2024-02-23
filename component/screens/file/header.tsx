import React, { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ControlPanel } from "component/controls";
import { isIOS } from "@u/helper";
import { ScreenModes } from "@u/types";
import MyIcon from "@c/my-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyPathLogo from "@c/logo/my-path-logo";
import { LinearGradient } from "expo-linear-gradient";

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
                        marginVertical: 7,
                        marginRight: 10,
                        marginLeft: 5,
                        flexDirection: "row",
                        alignItems: "center",
                        alignContent: "center",
                        justifyContent: "space-between",
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
                        <MyPathLogo animate={false} width={42} height={42} />
                    </View>

                </View>
                <View style={{ marginTop: 30 }}>
                    <ControlPanel
                        buttons={controlPanelButtons}
                        paddingLeft={50}
                        paddingRight={20} />

                </View>
            </HeaderGradientBackground>
            <TouchableOpacity
                style={{ position: 'absolute', left: 10, bottom: isIOS ? 15 : -2 }}
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
            </TouchableOpacity>

        </>
    );
}

export { HeaderGradientBackground, Header as default };