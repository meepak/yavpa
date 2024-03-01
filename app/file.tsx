import { CANVAS_HEIGHT, CANVAS_WIDTH, ScreenModes } from "@u/types";
import { ScreenModeType } from "@u/types";
import { createSvgData } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { SvgDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "@c/screens/file";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import elevations from "@u/elevation";
import FilmStripView from "@c/film-strip-view";



const FileScreen = () => {
    const insets = useSafeAreaInsets();
    const { svgData, setSvgData } = useContext(SvgDataContext);
    const [controlButtons, setControlButtons] = useState([
        {
            name: "Loading...",
            onPress: () => { },
        },
    ]);
    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL
    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata

    //****************************IMPORTANT********************************** */
    // If you are updating svgData through context and if it requires saving to file
    // set the updated_at date to blank, so that it will be saved to file
    useEffect(() => {
        const saveData = async () => {
            await saveSvgToFile(svgData);
            // setSvgData({ ...svgData, metaData: { ...svgData.metaData, updated_at: Date.now().toString() } });
        };

        if (svgData && svgData.metaData && svgData.metaData.guid != "" && svgData.metaData.updated_at === "") {
            saveData();
        }
    }, [svgData]);
    //**************************************************************************** */

    useEffect(() => {
        return () => {
            // console.log("reset svg data from context, component unmounted")
            resetSvgData();
        };
    }, []);

    useEffect(() => {
        return () => {
            // console.log("reset svg data from context, component unmounted")
            resetSvgData();
        };
    }, []);

    React.useEffect(() => {
        if (guid) {
            console.log(`Open file with GUID: ${guid}`);
            openSvgDataFile(guid);

        } else { //create new file
            // console.log('Create new file');
            const newSvgData = createSvgData();
            newSvgData.metaData.guid = Crypto.randomUUID();
            setSvgData(newSvgData);
        }
    }, [guid]);

    const handleScreenModeChanged = (mode: ScreenModeType) => {
        setCurrentScreenMode(mode);
    }



    async function openSvgDataFile(guid: string) {
        const svgDataFromFile = await getFile(guid);
        if (svgDataFromFile && svgDataFromFile.metaData.guid === guid) {
            console.log('File found with GUID: ', guid);
            setSvgData(svgDataFromFile);
        } else {
            console.log('No file found with GUID: ', guid);
            resetSvgData();
        }
    }

    const resetSvgData = () => {
        setSvgData(createSvgData());
    };

    const handleNameChange = (name: string) => {
        if (name === svgData.metaData.name) {
            return;
        }
        console.log('name changed to ', name);
        setSvgData((prev) => ({ ...prev, metaData: { ...prev.metaData, name, updated_at: "" } }));
    }

    // console.log(controlButtons)
    const getCurrentScreen = React.useCallback(() => {
        switch (currentScreenMode.name) {
            case ScreenModes[1].name: // Preview
                return <PreviewScreen svgData={svgData} setSvgData={setSvgData} initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen initControls={setControlButtons} />
                break;
        }
    }, [currentScreenMode]);




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


    const ViewDecoration = (currentScreenMode.name === ScreenModes[1].name)? FilmStripView : React.Fragment;

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
                    ?
                    <ViewDecoration>
                        <View
                            style={{
                                flex: 1,
                                alignContent: "center",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: 'transparent',
                                overflow: 'hidden',
                            }}
                        >
                            <Text style={{
                                position: 'absolute',
                                top: 30,
                                left: 30,
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: 42,
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                                zIndex: -1,
                            }}>
                                {currentScreenMode.name.toUpperCase()}
                            </Text>

                            {/* <GestureDetector gesture={pinch}> */}
                            <Animated.View
                                style={{
                                    width: CANVAS_WIDTH + 5,
                                    height: CANVAS_HEIGHT + 5,
                                    borderWidth: 0,
                                    padding: 5,
                                    ...elevations[5]
                                }}
                                pointerEvents={"box-none"}>
                                {getCurrentScreen()}
                            </Animated.View>
                            {/* </GestureDetector> */}

                        </View>
                    </ViewDecoration>
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
