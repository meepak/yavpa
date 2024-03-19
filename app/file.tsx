import { CANVAS_HEIGHT, CANVAS_PADDING_HORIZONTAL, CANVAS_PADDING_VERTICAL, CANVAS_WIDTH, FOOTER_HEIGHT, HEADER_HEIGHT, SCREEN_WIDTH, ScreenModes } from "@u/types";
import { ScreenModeType } from "@u/types";
import { createSvgData, precise } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { SvgDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "@c/screens/file";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";
import MyFilmStripView from "@c/my-film-strip-view";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import MyBlueButton from "@c/my-blue-button";
import MyEdgeButton from "@c/my-edge-button";
import Footer from "@c/screens/file/footer";
import { ContextMenu, PathsAsLayers } from "@c/controls";


const FileScreen = () => {
    // const insets = useSafeAreaInsets();

    // const [canvasScale, setCanvasScale] = useState(1);
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
    // set the updatedAt date to blank, so that it will be saved to file
    useEffect(() => {
        const saveData = async () => {
            await saveSvgToFile(svgData);
            // setSvgData({ ...svgData, metaData: { ...svgData.metaData, updatedAt: Date.now().toString() } });
        };

        if (svgData && svgData.metaData && svgData.metaData.guid != "" && svgData.metaData.updatedAt === "") {
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

    // const handleScreenModeChanged = (mode: ScreenModeType) => {
    //     setCurrentScreenMode(mode);
    // }



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
        setSvgData((prev) => ({ ...prev, metaData: { ...prev.metaData, name, updatedAt: "" } }));
    }




    // console.log(controlButtons)
    const getCurrentScreen = React.useCallback(() => {
        switch (currentScreenMode.name) {
            case ScreenModes[1].name: // Preview
            console.log('svgData', svgData.metaData.animation);
                return <PreviewScreen svgData={svgData} setSvgData={setSvgData} initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen initControls={setControlButtons} />
                break;
        }
    }, [currentScreenMode]);



    // const ZoomScaleText = () => (
    //     canvasScale !== 1 &&
    //     <MyBlueButton
    //         text={() => <Text style={{
    //             color: '#FFFFFF',
    //             fontSize: 18,
    //             fontWeight: 'bold',
    //             textTransform: 'uppercase',
    //             letterSpacing: 1,
    //             opacity: 1,
    //         }}>
    //             {precise(canvasScale * 100, 0) + '%'}
    //         </Text>
    //         }
    //         aligned="right"
    //         onPress={() => setCanvasScale(1)}
    //         bottom={insets.bottom + 16}
    //     />
    // );
    const ViewDecoration = (currentScreenMode.name === ScreenModes[1].name) ? MyFilmStripView : React.Fragment;

    return (
        <>
            <StatusBar style={"light"} translucent={true} />
            <Header
                controlPanelButtons={controlButtons}
                title={svgData?.metaData?.name || ""}
                onTitleChange={handleNameChange}
                onScreenModeChanged={setCurrentScreenMode}
                initialScreenMode={currentScreenMode}
            />
            {/*
            WILL INTRODUCE EDGE BUTTONS IN NEW VERSION!!
                currentScreenMode.name === ScreenModes[0].name &&
                <ContextMenu
                anchor= {(<MyEdgeButton
                    myIcon={{ name: 'layers', size: 24 }}
                    text="Layers"
                    leftOrRight="right"
                    onPress={() => { }}
                    top={HEADER_HEIGHT * 1.35}
                    />)}

                        width={180}
                        height={400}
                        showBackground={false}
                        xPosition={SCREEN_WIDTH - 200}
                        yPosition={HEADER_HEIGHT * 1.35}
                        positionOverride={true}
                        yOffsetFromAnchor={10}
                        animationIn={"slideInRight"}
                        animationOut={"slideOutRight"}

                    >
                        <PathsAsLayers svgData={svgData} setSvgData={(value) => setSvgData} />
                    </ContextMenu>

                */}
            {
                currentScreenMode.name === ScreenModes[0].name ||
                    currentScreenMode.name === ScreenModes[1].name
                    ?
                    <ViewDecoration>
                        <View
                            style={{
                                flex: 1,
                                alignContent: "flex-start",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                backgroundColor: 'transparent',
                                paddingTop: CANVAS_PADDING_VERTICAL,
                                paddingHorizontal: CANVAS_PADDING_HORIZONTAL / 2,
                                // paddingRight: CANVAS_PADDING_HORIZONTAL / 2, // TO CREATE ROOM FOR EDGE BUTTON
                                overflow: 'hidden',
                            }}
                        >
                            {/* <Text style={{
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
                            </Text> */}
                            <View
                                style={{
                                    width: CANVAS_WIDTH,
                                    height: CANVAS_HEIGHT,
                                    borderWidth: 2,
                                    borderColor: 'rgba(0,0,0,0.5)',
                                    // ...elevations[7],
                                    // shadowColor: {MY_BLACK},
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
                        </View>
                    </ViewDecoration>
                    :
                    <>
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
                    </>
            }
            {
                currentScreenMode.name === ScreenModes[1].name ?
                    <MyBlueButton
                        icon={{ desc: 'EXPORT', name: 'export', size: 24, left: 0, top: 0 }}
                        onPress={() => setCurrentScreenMode(ScreenModes[2])}
                        bottom={FOOTER_HEIGHT/2} // TODO adjust if this is blocking footer message
                        aligned="right"
                    // {...elevations[10]}
                    /> : null
            }
            <Footer />
        </>
    );
};

export default FileScreen;
