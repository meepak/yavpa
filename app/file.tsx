import React, { useContext, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenModes, createSvgData, ScreenModeType } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { SvgDataContext } from "@x/svg-data";
import { Header, DrawScreen, PreviewScreen, ExportScreen } from "component/file";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const FileScreen = () => {
    const insets = useSafeAreaInsets();
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata
    const [controlButtons, setControlButtons] = useState([
        {
          name: "Loading...",
          onPress: () => {},
        },
    ]);
    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL
    const { svgData, setSvgData } = useContext(SvgDataContext);
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
    
    }

    useEffect(() => {
        return () => {
            // console.log("reset svg data from context, component unmounted")
            resetSvgData();
        };
    }, []);

    const canvasLoaded = (layout: any) => {
        if (canvasSize.width == 0 || canvasSize.height == 0) {
            // Update svgData once we have the actual values
            //comment below line if we want canvas for new drawing only?? TO BE TESTED
            setSvgData((prev) => ({ ...prev, metaData: { ...prev.metaData, viewBox: `0 0 ${layout.width} ${layout.height}` } }));
            setCanvasSize({ width: layout.width, height: layout.height });
        }
    }


    async function openSvgDataFile(guid: string) {
        const svgDataFromFile = await getFile(guid);
        if (svgDataFromFile && 'pathData' in svgDataFromFile) {
            console.log('File found with GUID: ', guid, 'name: ', svgDataFromFile.metaData.name)
            setSvgData(() => svgDataFromFile);
            // find ScreenMode from name
            console.log('lastScreenMode: ', svgDataFromFile.metaData.lastScreenMode)
            let screenMode = ScreenModes.find((mode) => mode.name === svgDataFromFile.metaData.lastScreenMode);
            if(screenMode) {
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
        setSvgData(createSvgData(canvasSize.width, canvasSize.height));
    };



    const handleNameChange = (name: string) => {
        setSvgData((existingData) => ({
            metaData: {
                ...existingData.metaData,
                name: name,
            },
            pathData: existingData.pathData,
        }));
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


    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="light" translucent/>
            <View style={{ top:0, left: 0, height: 100 + insets.top }}>
                <Header
                    controlPanelButtons={controlButtons}
                    title={svgData?.metaData?.name || ""}
                    onTitleChange={handleNameChange}
                    onScreenModeChanged={handleScreenModeChanged}
                    initialScreenMode={currentScreenMode}
                />
            </View>
            <View
                style={{
                    flex: 1,
                    alignContent: "flex-start",
                    justifyContent: "flex-start",
                }}
                onLayout={(event) => { canvasLoaded(event.nativeEvent.layout) }}
            >
                {getCurrentScreen()}
            </View>
        </View>
    );
};

export default FileScreen;
