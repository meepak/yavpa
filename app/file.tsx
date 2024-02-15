import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_VIEWBOX } from "@u/constants";
import { ScreenModeType, ScreenModes, createSvgData } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { SvgDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "component/file";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";



const FileScreen = () => {
    const insets = useSafeAreaInsets();
    // const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata
    const [controlButtons, setControlButtons] = useState([
        {
            name: "Loading...",
            onPress: () => { },
        },
    ]);
    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL
    const { svgData, setSvgData } = useContext(SvgDataContext);

    const canvasScale = useSharedValue(1);

    React.useEffect(() => {
        // testing auto save to file (if not in preview mode) put as option??
        console.log('saving...', svgData.metaData.guid)
        saveSvgToFile(svgData);
    }, [svgData]);

    const handleScreenModeChanged = (mode: ScreenModeType) => {
        setCurrentScreenMode(mode);
        setSvgData((prev) => ({
            ...prev,
            metaData: {
                ...prev.metaData,
                lastScreenMode: mode.name,
            },
        }));
        // saveSvgToFile(svgData); //enable this later and disable useEffect hook saving

    }

    useEffect(() => {
        return () => {
            // console.log("reset svg data from context, component unmounted")
            resetSvgData();
        };
    }, []);

    // const canvasLoaded = (layout: any) => {
    //     if (canvasSize.width == 0 || canvasSize.height == 0) {
    //         // Update svgData once we have the actual values
    //         //comment below line if we want canvas for new drawing only?? TO BE TESTED
    //         setSvgData((prev) => ({ ...prev, metaData: { ...prev.metaData, viewBox: `0 0 ${layout.width} ${layout.height}` } }));
    //         setCanvasSize({ width: layout.width, height: layout.height });
    //     }
    // }


    async function openSvgDataFile(guid: string) {
        const svgDataFromFile = await getFile(guid);
        if (svgDataFromFile && 'pathData' in svgDataFromFile) {
            console.log('File found with GUID: ', guid, 'name: ', svgDataFromFile.metaData.name)

            // set the current viewbox
            // const fittedViewBox = getViewBoxTrimmed(svgDataFromFile.pathData);
            if (svgDataFromFile.metaData.viewBox !== DEFAULT_VIEWBOX) {
                // scale the path data to fit the new viewbox
                // console.log('setting new viewbox from ', svgDataFromFile.metaData.viewBox, 'to', DEFAULT_VIEWBOX)
                svgDataFromFile.metaData.viewBox = DEFAULT_VIEWBOX;
            }

            // TODO make sure this doesn't trigger resaving.. it is doing at the moment
            setSvgData(() => svgDataFromFile);
            // find ScreenMode from name
            console.log('lastScreenMode: ', svgDataFromFile.metaData.lastScreenMode)
            let screenMode = ScreenModes.find((mode) => mode.name === svgDataFromFile.metaData.lastScreenMode);
            if (screenMode) {
                console.log('crrent screen mode is set to ', screenMode)
                setCurrentScreenMode(screenMode as ScreenModeType);
            }
        } else {
            // TODO  handle error
            console.log('No file found with GUID: ', guid);
            resetSvgData();
        }
    }

    const resetSvgData = () => {
        setSvgData(createSvgData(CANVAS_WIDTH, CANVAS_HEIGHT));
    };



    const handleNameChange = (name: string) => {
        setSvgData((existingData) => ({
            metaData: {
                ...existingData.metaData,
                name: name,
            },
            pathData: existingData.pathData,
        }));
        // saveSvgToFile(svgData); //enable this later and disable useEffect hook saving
    }

    // console.log(controlButtons)
    const getCurrentScreen = React.useCallback(() => {
        switch (currentScreenMode.name) {
            case ScreenModes[1].name: // Preview
                return <PreviewScreen initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen initControls={setControlButtons} />
        }
    }, [currentScreenMode]);

    React.useEffect(() => {
        if (guid) {
            // console.log(`Load file with GUID: ${guid}`);
            openSvgDataFile(guid);

        } else {
            resetSvgData()
        }
    }, [guid]);



    // const pinch = Gesture.Pinch()
    // .onUpdate((e) => {
    //     // enable edit mode
    //     console.log('pinched', e.scale);
    //     if(e.scale > 0.5 && e.scale < 2.5) {
    //         canvasScale.value = e.scale;
    //     }
    // })
    // .onEnd(() => {
    //     // setCanvasScale((prev) => prev * e.scale);
    // });


    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent />
            <View style={{ top: 0, left: 0, height: 100 + insets.top }}>
                <Header
                    controlPanelButtons={controlButtons}
                    title={svgData?.metaData?.name || ""}
                    onTitleChange={handleNameChange}
                    onScreenModeChanged={handleScreenModeChanged}
                    initialScreenMode={currentScreenMode}
                />
            </View>
            {
                currentScreenMode.name === ScreenModes[0].name ||
                    currentScreenMode.name === ScreenModes[1].name
                    ? <View
                        style={{
                            flex: 1,
                            alignContent: "center",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: 'transparent',
                        }}
                    >

                        {/* <GestureDetector gesture={pinch}> */}
                        <Animated.View
                            style={{
                                width: CANVAS_WIDTH + 5,
                                height: CANVAS_HEIGHT + 5,
                                borderWidth: 0,
                                elevation: 5,
                                padding: 5,
                                // transform: [{ scale: canvasScale }],
                                // backgroundColor: 'rgba(255,255,255,1)',
                            }}
                            pointerEvents={"box-none"}>
                            {getCurrentScreen()}
                        </Animated.View>
                        {/* </GestureDetector> */}
                    </View>
                    :
                    <View
                    style={{
                        flex: 1,
                        alignContent: "center",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: 'transparent',
                    }}
                >

                        {getCurrentScreen()}
                    </View>
            }
        </View>
    );
};

export default FileScreen;
