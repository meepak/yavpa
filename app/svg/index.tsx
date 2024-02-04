import React, { useContext, useEffect, useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ScreenModeType, ScreenModes, createSvgData } from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import Header from "@/svg/header";
import DrawScreen from "@/svg/draw";
import ExportScreen from "@/svg/export";
import PreviewScreen from "@/svg/preview";
import { SvgDataContext } from "./context";


const Yavpa = () => {
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // default DRAW, but save & read from metadata
    const [currentScreen, setCurrentScreen] = useState(<></>);

    const [controlButtons, setControlButtons] = useState([]);

    const { guid } = useLocalSearchParams<{ guid: string; }>(); // Capture the GUID from the URL

    const {svgData, setSvgData} = useContext(SvgDataContext);


    const canvasLoaded = (layout: any) => {
        if (canvasSize.width == 0 || canvasSize.height == 0) {
            // Update svgData once we have the actual values
            //comment below line if we want canvas for new drawing only?? TO BE TESTED
            setSvgData((prev) => ({...prev, metaData: {...prev.metaData, viewBox: `0 0 ${layout.width} ${layout.height}`}})); 
            setCanvasSize({ width: layout.width, height: layout.height });
        }
    }


    async function openSvgDataFile(guid: string) {
        const svgDataFromFile = await getFile(guid);
        if (svgDataFromFile && 'pathData' in svgDataFromFile) {
            // console.log('File found with GUID: ', guid, 'name: ', svgDataFromFile.metaData.name)
            setSvgData(() => svgDataFromFile);
            let screenModeIndex = svgDataFromFile.metaData.lastScreenMode || 0;
            setCurrentScreenMode(ScreenModes[screenModeIndex]);
        } else {
            // TODO  handle error
            console.log('No file found with GUID: ', guid);
            resetSvgData();
        }
    }

    const resetSvgData = () => {
        setSvgData(createSvgData(canvasSize.width, canvasSize.height));
    };


    const onNewPress = () => {
        resetSvgData();
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
        return <PreviewScreen initControls={setControlButtons}/>;
      case ScreenModes[2].name: // Export
        return <ExportScreen initControls={setControlButtons}/>
      case ScreenModes[0].name: // Draw
      default:
        return <DrawScreen initControls={setControlButtons}/>
    }
  }, [currentScreenMode, svgData]);

    React.useEffect(() => {
        if (guid) {
            // console.log(`Load file with GUID: ${guid}`);
            openSvgDataFile(guid);

        } else {
            resetSvgData() 
        }
    }, [guid]);


    // React.useEffect(() => {
    //     // testing auto save to file (if not in preview mode) put as option??
    //     console.log('saving...', svgData.metaData,guid)
    //     saveSvgToFile(svgData);
    // }, [svgData]);

    return (
        <View style={{ flex: 1 }}>
            <Header
                controlPanelButtons={controlButtons}
                title={svgData?.metaData?.name || ""}
                onTitleChange={handleNameChange}
                onScreenModeChanged={setCurrentScreenMode}
                initialScreenMode={currentScreenMode}
            />
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

export default Yavpa;
