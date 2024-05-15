import React, { useContext, useEffect, useRef, useState } from "react";
import Svg from "react-native-svg";
import ViewShot from "react-native-view-shot";
import MyPath from "./pure/my-path";
import {
  CANVAS_HEIGHT,
  FILE_PREVIEW_WIDTH,
  PathDataType,
  ScreenShotType,
} from "@u/types";
import { saveScreenshot } from "@u/storage";
import { useUserPreferences } from "@x/user-preferences";
import { useMyPathDataContext } from "@x/svg-data";
import { getViewBox, getViewBoxTrimmed } from "@u/helper";

const MyScreenShot = ({
  onScreenShotSaved,
  hostIsExiting = false,
}: {
  onScreenShotSaved?: () => void;
  hostIsExiting: boolean;
}) => {
  const { defaultStorageDirectory } = useUserPreferences();
  const { myPathData } = useMyPathDataContext();
  const [takeScreenShot, setTakeScreenShot] = useState<
    ScreenShotType | undefined
  >();
  const viewBox = useRef("");

  // If exiting, take canvas screenshot
  useEffect(() => {
    if (hostIsExiting) {
      viewBox.current = getViewBox(myPathData.metaData);
      console.log("path saved-exit", viewBox.current);
      setTakeScreenShot("canvas");
    }
  }, [hostIsExiting]);

  // If myPathData changes, take full screenshot
  useEffect(() => {
    // disabled for now,
    const trimmedViewbox = getViewBoxTrimmed(myPathData.pathData);
    console.log("path saved-trimmedViewbox", trimmedViewbox);
    if (trimmedViewbox) {
      viewBox.current = trimmedViewbox;
      setTakeScreenShot("full");
    }
  }, [
    myPathData.pathData,
    myPathData.metaData.canvasScale,
    myPathData.metaData.canvasTranslateX,
    myPathData.metaData.canvasTranslateY,
  ]);

  useEffect(() => {
    // When we want to take a screenshot, set takeScreenShot with ScreenShotType value
    if (takeScreenShot === "canvas" || takeScreenShot === "full") {
      console.log("***SCREENSHOT IN 70 ms");
      setTimeout(() => {
        console.log("****CLICK****");
        // allow 50 ms and reset
        setTakeScreenShot(undefined);
        viewBox.current = "";
      }, 70); //should be enough to take screenshot??
    }
  }, [takeScreenShot]);

  const handleCapture = (uri: string) => {
    try{
    if (takeScreenShot) {
      console.log("****SAVING!!!", uri);
      saveScreenshot(
        defaultStorageDirectory,
        myPathData.metaData.guid,
        uri,
        takeScreenShot as ScreenShotType, // Cast takeScreenShot as ScreenShotType
      ).then(() => {
        onScreenShotSaved && onScreenShotSaved();
      });
    }
  }catch(e){
    console.log('Error during screen shot capture', e)
  }
  };

  if (!["canvas", "full"].includes(takeScreenShot || "")) {
    // Use a default value of "" if takeScreenShot is undefined
    return null;
  }

  return (
    <ViewShot
      options={{ format: "png" as any, quality: 0.8 }}
      captureMode="mount"
      onCapture={handleCapture}
      style={{
        position: "absolute",
        left: -10000,
        top: -10000,
        width: FILE_PREVIEW_WIDTH,
        height: (CANVAS_HEIGHT * FILE_PREVIEW_WIDTH) / CANVAS_HEIGHT,
        overflow: "hidden",
      }}
      onLayout={() => console.log("ViewShot Mounted*****")}
    >
      <Svg width="100%" height="100%" viewBox={viewBox.current}>
        {myPathData.pathData.map((item: PathDataType, index) => (
          <MyPath key={index} prop={item} keyProp={item.guid} />
        ))}
      </Svg>
    </ViewShot>
  );
};

export default MyScreenShot;
