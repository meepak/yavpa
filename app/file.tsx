import { CANVAS_HEIGHT, CANVAS_WIDTH, ScreenModes, SvgDataType } from "@u/types";
import { ScreenModeType } from "@u/types";
import { createSvgData, precise } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { SvgDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "@c/screens/file";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import FilmStripView from "@c/film-strip-view";
import { Gesture, GestureDetector } from "react-native-gesture-handler";


const FileScreen = () => {
    const insets = useSafeAreaInsets();

    const [canvasScale, setCanvasScale] = useState(1);
    const { svgData, setSvgData } = useContext(SvgDataContext);
    const [controlButtons, setControlButtons] = useState([
        {
            name: "Loading...",
            onPress: () => { },
        },
    ]);
    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL
    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata
    const prevSvgDataRef = useRef<SvgDataType>();

    const saveSvgDataToFile = async () => {
        await saveSvgToFile(prevSvgDataRef.current, svgData);
    };

    useEffect(() => {
        prevSvgDataRef.current = svgData;
        return () => {
            // console.log("reset svg data from context, component unmounted")
            resetSvgData();
        };
    }, []);

    //****************************IMPORTANT********************************** */
    // If you are updating svgData through context and if it requires saving to file
    // set the updated_at date to blank, so that it will be saved to file
    // For svg data only lets do deep difference as it affects 
    // rendering directly as well as saving of file in disk
    useEffect(() => {
        console.log('svgData change triggered useEffect.. ');
        // if there is no guid or updated_at is not blank then no need to save
        if (!svgData.metaData.guid || svgData.metaData.updated_at !== "") {
            console.log('No guid or updated_at is not blank');
            return;
        }
            saveSvgDataToFile();
    }, [svgData]);
    //**************************************************************************** */


    useEffect(() => {
        if (guid) {
            // console.log(`Open file with GUID: ${guid}`);
            openSvgDataFile(guid);

        } else { //create new file
            // console.log('Create new file');
            const newSvgData = createSvgData();
            newSvgData.metaData.guid = Crypto.randomUUID();
            setSvgData(newSvgData);
        }
    }, [guid]);


    async function openSvgDataFile(guid: string) {
        const svgDataFromFile = await getFile(guid);
        if (svgDataFromFile && svgDataFromFile.metaData.guid === guid) {
            // console.log('File found with GUID: ', guid);
            setSvgData(svgDataFromFile);
        } else {
            // console.log('No file found with GUID: ', guid);
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


    const pinch = Gesture.Pinch();
    const pan = Gesture.Pan();
    pan.minPointers(2);
    pan.maxPointers(2);
    pan.onChange((e) => {
        // console.log('pan change', e.translationX, e.translationY);
    });
    pan.initialize();

    const zoomPan = Gesture.Race(pinch, pan);
    pinch.hitSlop(20);
    pinch.onBegin((e) => {
        // console.log('pinch begin', e.scale);
        pinch.shouldCancelWhenOutside(false);
    });
    pinch.onChange((e) => {
        // console.log('pinch change', e.scale);
        if (e.scale > 0.4 && e.scale < 4) {
            setCanvasScale(e.scale);
        }

    });
    pinch.onUpdate((e) => {
        // enable edit mode
        // if (e.scale > 0.4 && e.scale < 4) {
        //     setCanvasScale(e.scale);
        // }
    })


    // console.log(controlButtons)
    const getCurrentScreen = React.useCallback(() => {
        switch (currentScreenMode.name) {
            case ScreenModes[1].name: // Preview
                return <PreviewScreen zoom={canvasScale} svgData={svgData} setSvgData={setSvgData} initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen zoom={canvasScale} initControls={setControlButtons} externalGesture={{ pinch: pinch, pan: pan }} />
                break;
        }
    }, [currentScreenMode]);



    const ZoomScaleText = () => (
        canvasScale !== 1 &&
        <TouchableOpacity
            onPress={() => setCanvasScale(1)}
            style={{
                width: 90,
                height: 40,
                position: 'absolute',
                bottom: 30,
                right: 0,
                zIndex: 99,
            }}>
            <View style={{
                backgroundColor: 'rgba(0,0,255,0.65)',
                paddingVertical: 5,
                paddingLeft: 5,
                paddingRight: 15,
                alignItems: 'flex-end',
                width: 90,
            }}>
                <Text style={{
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    opacity: 1,
                }}>
                    {precise(canvasScale * 100, 0) + '%'}
                </Text>
            </View>
        </TouchableOpacity>
    );
    const ViewDecoration = (currentScreenMode.name === ScreenModes[1].name) ? FilmStripView : React.Fragment;

    return (
        <View style={{ flex: 1 }}>
            <StatusBar style={"light"} translucent={true} />
            <View style={{ top: 0, left: 0, height: 100 + insets.top }}>
                <Header
                    controlPanelButtons={controlButtons}
                    title={svgData?.metaData?.name || ""}
                    onTitleChange={handleNameChange}
                    onScreenModeChanged={setCurrentScreenMode}
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
                            <ZoomScaleText />

                            <GestureDetector gesture={zoomPan}>
                                <View
                                    style={{
                                        width: CANVAS_WIDTH,
                                        height: CANVAS_HEIGHT,
                                        transform: [{ scale: canvasScale }],
                                        borderWidth: 1,
                                        borderColor: 'rgba(0,0,0,0.5)',
                                        // ...elevations[7],
                                        // shadowColor: "#000000",
                                        // backgroundColor: 'rgba(255,255,255,0.5)',
                                        // shadowOffset: {
                                        //   width: 0,
                                        //   height: 7,
                                        // },
                                        // shadowOpacity: 0.44,
                                        // shadowRadius: 6.27,
                                        // elevation: 7,

                                    }}>
                                    {getCurrentScreen()}
                                </View>
                            </GestureDetector>

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
