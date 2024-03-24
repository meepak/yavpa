import { BLUE_BUTTON_WIDTH, CANVAS_HEIGHT, CANVAS_PADDING_HORIZONTAL, CANVAS_PADDING_VERTICAL, CANVAS_WIDTH, FOOTER_HEIGHT, HEADER_HEIGHT, SCREEN_WIDTH, ScreenModes } from "@u/types";
import { createMyPathData } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { MyPathDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "@c/screens/file";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as Crypto from "expo-crypto";
import MyFilmStripView from "@c/my-film-strip-view";
import MyBlueButton from "@c/my-blue-button";
// import Footer from "@c/screens/file/footer";
import myConsole from "@c/my-console-log";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import DrawingDynamicOptions from "@c/screens/file/draw/dynamic-options";


const FileScreen = () => {
    // const insets = useSafeAreaInsets();

    // const [canvasScale, setCanvasScale] = useState(1);
    const { myPathData, setMyPathData } = useContext(MyPathDataContext);
    const [controlButtons, setControlButtons] = useState([
        {
            name: "Loading...",
            onPress: () => { },
        },
    ]);
    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL
    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata

    const insets = useSafeAreaInsets();

    //****************************IMPORTANT********************************** */
    // If you are updating myPathData through context and if it requires saving to file
    // set the updatedAt date to blank, so that it will be saved to file
    useEffect(() => {
        const saveData = async () => {
            await saveSvgToFile(myPathData);
            // setMyPathData({ ...myPathData, metaData: { ...myPathData.metaData, updatedAt: Date.now().toString() } });
        };

        if (myPathData && myPathData.metaData && myPathData.metaData.guid != "" && myPathData.metaData.updatedAt === "") {
            saveData();
        }
    }, [myPathData]);
    //**************************************************************************** */

    useEffect(() => {
        return () => {
            // myConsole.log("reset svg data from context, component unmounted")
            resetMyPathData();
        };
    }, []);


    React.useEffect(() => {
        if (guid) {
            myConsole.log(`Open file with GUID: ${guid}`);
            openMyPathDataFile(guid);

        } else { //create new file
            // myConsole.log('Create new file');
            const newMyPathData = createMyPathData();
            newMyPathData.metaData.guid = Crypto.randomUUID();
            setMyPathData(newMyPathData);
        }
    }, [guid]);

    // const handleScreenModeChanged = (mode: ScreenModeType) => {
    //     setCurrentScreenMode(mode);
    // }



    async function openMyPathDataFile(guid: string) {
        const myPathDataFromFile = await getFile(guid);
        if (myPathDataFromFile && myPathDataFromFile.metaData.guid === guid) {
            myConsole.log('File found with GUID: ', guid);
            setMyPathData(myPathDataFromFile);
        } else {
            myConsole.log('No file found with GUID: ', guid);
            resetMyPathData();
        }
    }

    const resetMyPathData = () => {
        setMyPathData(createMyPathData());
    };

    const handleNameChange = (name: string) => {
        if (name === myPathData.metaData.name) {
            return;
        }
        myConsole.log('name changed to ', name);
        setMyPathData((prev) => ({ ...prev, metaData: { ...prev.metaData, name, updatedAt: "" } }));
    }




    // myConsole.log(controlButtons)
    const getCurrentScreen = React.useCallback(() => {
        switch (currentScreenMode.name) {
            case ScreenModes[1].name: // Preview
            myConsole.log('myPathData', myPathData.metaData.animation);
                return <PreviewScreen myPathData={myPathData} setMyPathData={setMyPathData} initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen myPathData={myPathData} setMyPathData={setMyPathData} initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen myPathData={myPathData} setMyPathData={setMyPathData} initControls={setControlButtons} />
                break;
        }
    }, [currentScreenMode]);


    const DisplayScreenName = () => {
        const positions = [
            { top: 30, left: 30 },
            { bottom: 10, right: 30 },
        ];
        return (
        <>
            {positions.map((position, index) => (
                <Text
                    key={index}
                    style={{
                        position: 'absolute',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: 64,
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        zIndex: -1,
                        ...position,
                    }}
                >
                    {currentScreenMode.name.toUpperCase()}
                </Text>
            ))}
        </>
    )};

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
                title={myPathData?.metaData?.name || ""}
                onTitleChange={handleNameChange}
                onScreenModeChanged={setCurrentScreenMode}
                initialScreenMode={currentScreenMode}
            />
            <>
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
                        <PathsAsLayers myPathData={myPathData} setMyPathData={(value) => setMyPathData} />
                    </ContextMenu>

                */}
            </>
            {
               ( currentScreenMode.name === ScreenModes[0].name ||
                    currentScreenMode.name === ScreenModes[1].name)
                    ?
                    <ViewDecoration>
                        <View style={{ flex: 1 }}>
                            <>
                        {/* <View style = {{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'red',
                            maxWidth: SCREEN_WIDTH - BLUE_BUTTON_WIDTH - 10,
                            maxHeight: CANVAS_PADDING_VERTICAL - 5,
                            overflow: 'hidden',
                        }}>
                            <DrawingDynamicOptions screenMode={currentScreenMode} />
                        </View> */}
                            </>
                        <View
                            style={{
                                flex: 1,
                                    alignContent: "flex-start",
                                    justifyContent: "flex-start",
                                alignItems: "center",
                                backgroundColor: 'transparent',
                                paddingTop: CANVAS_PADDING_VERTICAL,
                                // paddingHorizontal: CANVAS_PADDING_HORIZONTAL / 2,
                                // paddingRight: CANVAS_PADDING_HORIZONTAL / 2, // TO CREATE ROOM FOR EDGE BUTTON
                                overflow: 'hidden',
                            }}
                        >
                            <DisplayScreenName />
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
                        bottom={insets.bottom + 16}
                        aligned="right"
                    // {...elevations[10]}
                    /> : null
            }
            {/* <Footer /> */}
        </>
    );
};

export default FileScreen;
