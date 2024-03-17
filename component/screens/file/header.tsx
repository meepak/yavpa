import React, { useContext, useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { ControlPanel } from "component/controls";
import { MAX_HEADER_HEIGHT, SCREEN_HEIGHT, ScreenModeInstruction, ScreenModes } from "@u/types";
import MyIcon from "@c/my-icon";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyPathLogo from "@c/logo/my-path-logo";
import { LinearGradient } from "expo-linear-gradient";
import { SvgDataContext } from "@x/svg-data";
import MyList from "@c/my-list";
import MyBlueButton from "@c/my-blue-button";
import { ToastContext } from "@x/toast-context";

/*
<></> --> takes full parent's space by default
<View</View> --> takes only required space by default
<View style={{ flex: 1 }}></View> is same as <></>
*/
const HeaderGradientBackground = ({ children }) => (
    <>
        <View style={{ ...StyleSheet.absoluteFillObject, opacity: 1 }}>
            <LinearGradient
                colors={['#4f236d', '#040827', '#040827']}
                start={[1, 0.25]} // left, top
                end={[0, 1]}  // right, bottom
                style={StyleSheet.absoluteFillObject}
            />
            {/* <LinearGradient
                colors={['#da857900', '#0573b401', '#042f6bAA', '#fdf9b411']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 1 }}
                locations={[1, 0.8, 0.6, 0]}
                style={StyleSheet.absoluteFillObject}
            /> */}
        </View>
        {children}
    </>
)

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
    // const [buttonInstruction, setButtonInstruction] = useState("");
    const router = useRouter();
    const showToast = useContext(ToastContext);

    useEffect(() => {
        setName(title);
    }, [title]);


    const handleScreenModeButtonPress = () => {
        // console.log('screen mode button pressed')
        const currentScreenModeIndex = ScreenModes.findIndex((mode) => mode.name === screenMode.name);
        if (currentScreenModeIndex >= 0 && ScreenModes[currentScreenModeIndex].name === "Draw") {
            // get count of visible paths
            const pathsOnScreen = svgData.pathData.reduce((acc, path) => path.visible ? acc + 1 : acc, 0);
            if (pathsOnScreen === 0) {
                showToast("Please draw something first!");
                return;
            }
        }
        const newScreenModeIndex = (currentScreenModeIndex + 1) % ScreenModes.length;
        const newScreenMode = ScreenModes[newScreenModeIndex];
        setScreenMode(newScreenMode);
        console.log('new screen mode', newScreenMode.name);
        // setButtonInstruction(ScreenModeInstruction[newScreenMode.name]);
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

    // to get the same top position iOS  has insets.top included within header size
    // whereas in android it's not???
    // flatlist has to be bring down by 15 in iOS to align with bottom line
    const getBlueButtonIconProps = (screenMode) => {

        // replae Draw with Press to Animate
        // replace Preview with Press to Export
        // replace Export with Press to Edit
        let desc = screenMode.name;
        let name = screenMode.icon;
        if (screenMode.name === "Draw") {
            desc = "press to PREVIEW";
        } else if (screenMode.name === "Preview") {
            desc = "press to EXPORT";
        } else if (screenMode.name === "Export") {
            desc = "press to DRAW";
        } else if (screenMode.name === "locked") {
            desc = "Press to UNLOCK";
        }
        return { desc, name };
    }
    const textInputHeight = 40;
    const blueButtonTop = MAX_HEADER_HEIGHT - insets.top;
    return (
        <View
            style={{
                height: MAX_HEADER_HEIGHT + insets.top, // allow same header area in all devices
            }}
        >
            <HeaderGradientBackground>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View
                        style={{
                            top: insets.top,
                            marginRight: 10,
                            marginLeft: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "space-between",
                            backgroundColor: 'transparent',
                        }}
                    >
                        <TouchableOpacity onPress={handleBackButtonPress} activeOpacity={0.75}>
                            <MyIcon name="back" color="#FFFFFF" strokeWidth={2} size={28} />
                        </TouchableOpacity>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View>
                                <TextInput
                                    style={{
                                        flex: 1,
                                        height: textInputHeight,
                                        color: "rgba(255, 255, 255, 0.7)",
                                        fontSize: 22,
                                        fontWeight: "300",
                                        textAlign: "center",
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
                                    placeholderTextColor="rgba(255, 255, 255, 0.8)"
                                />
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ bottom: -5, }}>
                            <MyList
                                anchor={<MyPathLogo animate={false} width={48} height={48} />}
                                width={150}
                                height={SCREEN_HEIGHT - MAX_HEADER_HEIGHT - insets.top}
                            />
                        </View>

                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                        <ControlPanel
                            buttons={controlPanelButtons}
                            paddingLeft={85}
                            paddingRight={10}
                        />
                    </View>
                </View>
            </HeaderGradientBackground>
            <MyBlueButton
                icon={getBlueButtonIconProps(screenMode)}
                onPress={handleScreenModeButtonPress}
                aligned="left"
                top={MAX_HEADER_HEIGHT}
            />
        </View>
    );
}

export { HeaderGradientBackground, Header as default };