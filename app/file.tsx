import { BLUE_BUTTON_WIDTH, CANVAS_HEIGHT, CANVAS_PADDING_HORIZONTAL, CANVAS_PADDING_VERTICAL, CANVAS_WIDTH, FOOTER_HEIGHT, HEADER_HEIGHT, MY_BLACK, SCREEN_WIDTH, ScreenModes } from "@u/types";
import { createMyPathData, hrFormatTime } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { MyPathDataContext } from "@x/svg-data";
import { DrawScreen, ExportScreen, Header, PreviewScreen } from "@c/screens/file";
import { useLocalSearchParams } from "expo-router";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import * as Crypto from "expo-crypto";
import MyFilmStripView from "@c/my-film-strip-view";
import MyBlueButton from "@c/my-blue-button";
// import Footer from "@c/screens/file/footer";
import myConsole from "@c/my-console-log";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Footer from "@c/screens/file/footer";
import { StatusBar } from "expo-status-bar";
import { useUserPreferences } from "@x/user-preferences";
import elevations from "@u/elevation";
// import DrawingDynamicOptions from "@c/screens/file/draw/dynamic-options";


const FileScreen = () => {
    // const insets = useSafeAreaInsets();

    // const [forceRerenderAt, setForceRerenderAt] = useState(Date.now());
    // const [canvasScale, setCanvasScale] = useState(1);

    const {defaultStorageDirectory} = useUserPreferences();
    const { loadNewFile, myPathData, setMyPathData } = useContext(MyPathDataContext);
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
            await saveSvgToFile(defaultStorageDirectory, myPathData);
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
        const myPathDataFromFile = await getFile(defaultStorageDirectory, guid);
        if (myPathDataFromFile && myPathDataFromFile.metaData.guid === guid) {
            myConsole.log('File found with GUID: ', guid);
            loadNewFile(myPathDataFromFile);
        } else {
            myConsole.log('No file found with GUID: ', guid);
            resetMyPathData();
        }
    }

    const resetMyPathData = () => {
        loadNewFile(createMyPathData());
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
                return <PreviewScreen myPathData={myPathData} setMyPathData={setMyPathData} initControls={setControlButtons} />;
            case ScreenModes[2].name: // Export
                return <ExportScreen myPathData={myPathData} initControls={setControlButtons} />
            case ScreenModes[0].name: // Draw
            default:
                return <DrawScreen myPathData={myPathData} setMyPathData={setMyPathData} initControls={setControlButtons} />
                break;
        }
    }, [currentScreenMode]);


    const DisplayScreenName = () => {
        const positions = [
            // { top: 30, left: 30 },
            { bottom: 30, left: 30 },
        ];
        return (
            <>
                {positions.map((position, index) => (
                    <Text
                        key={index}
                        style={{
                            position: 'absolute',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: 42,
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
        )
    };

    const DisplayPathStat = useMemo(() => {
        const numPath = myPathData?.pathData.length;
        const animTime = (myPathData?.pathData.reduce((acc, item) => acc + item.time, 0)) / (myPathData?.metaData.animation?.speed || 1);
        return () => {
            if(numPath > 0)
            return  <Text
                style={{
                    position: 'absolute',
                    opacity: 0.7,
                    color: MY_BLACK,
                    fontSize: 9,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    zIndex: -1,
                    top: 0,
                    right: 20,
                }}
            >
                { numPath + ' path' + (numPath > 1 ? 's' : '') + ', ' +  hrFormatTime(animTime)}
            </Text>
        }
        return <></>;
    },[myPathData]) as React.JSXElementConstructor<{}>;

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
            <StatusBar hidden={false} style={"light"} backgroundColor='transparent' translucent={true} />
            <Header
                controlPanelButtons={controlButtons}
                title={myPathData?.metaData?.name || ""}
                onTitleChange={handleNameChange}
                onScreenModeChanged={setCurrentScreenMode}
                initialScreenMode={currentScreenMode}
            />

            {
                (currentScreenMode.name === ScreenModes[0].name ||
                    currentScreenMode.name === ScreenModes[1].name)
                    ?
                    <ViewDecoration>
                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flex: 1,
                                    alignContent: "center",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    backgroundColor: 'transparent',
                                    overflow: 'hidden',
                                    margin: 5,
                                }}
                            >
                                <DisplayPathStat />
                                <DisplayScreenName />
                                <View
                                    style={{
                                        width: CANVAS_WIDTH,
                                        height: CANVAS_HEIGHT,
                                        borderWidth: 1,
                                        borderColor: 'rgba(0,0,0,0.1)',
                                        ...elevations[2],
                                    }}>
                                    {getCurrentScreen()}
                                </View>
                            </View>
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


            {
                currentScreenMode.name === ScreenModes[1].name ?
                    <MyBlueButton
                        icon={{ desc: 'EXPORT', name: 'export', size: 24 }}
                        onPress={() => setCurrentScreenMode(ScreenModes[2])}
                        bottom={insets.bottom + 16}
                        aligned="right"
                    /> : null
            }


            <Footer />
        </>
    );
};

export default FileScreen;
