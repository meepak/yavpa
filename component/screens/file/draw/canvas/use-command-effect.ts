import { createPathdata, createSvgData } from "@u/helper";
import { PathDataType, ShapeType, SvgDataType } from "@u/types";
import { SvgDataContext } from "@x/svg-data";
import { SetStateAction, useContext, useEffect } from "react";

export const useCommandEffect = (
  command: string,
  editMode: boolean,
  // initialPathData: PathDataType[],
  newPathData: { (): PathDataType; (): any; },
  svgData: SvgDataType,
  setSvgData: { (value: SetStateAction<SvgDataType>): void; },
  undonePaths: PathDataType[],
  setUndonePaths: { (value: SetStateAction<PathDataType[]>): void; },
  setCurrentPath: { (value: SetStateAction<PathDataType>): void; },
  setCurrentShape: { (value: SetStateAction<ShapeType>): void; },
  forceUpdate: number
) => {
  useEffect(() => {
    // function body remains the same
    if (!editMode) return;
    switch (command) {
      case "open":
      case "update": // TODO this command shouldn't be necessary..
        // setCompletedPaths(() => initialPathData);
        setCurrentPath(() => newPathData()); //should we use newPathData instead?? ??
        // setUndonePaths(() => []);
        break;
      case "reset":
        // setCompletedPaths(() => []);
        setSvgData(createSvgData());
        setCurrentPath(() => createPathdata()); //should we use newPathData instead?? NOPE
        setUndonePaths(() => []);
        break;
      case "undo":
        if (svgData.pathData.length > 0) {
          setUndonePaths((prevUndonePaths) => [
            ...prevUndonePaths,
            svgData.pathData[svgData.pathData.length - 1],
          ]);
          setSvgData((prev) => ({
            metaData: { ...prev.metaData, updated_at: "" },
            pathData: prev.pathData.slice(0, -1)
          }));
          console.log(undonePaths.length)
        }
        break;
      case "redo":
        console.log("redooo")
        if (undonePaths.length > 0) {
          console.log("redooo inside")
          setSvgData((prev) => ({
            metaData: { ...prev.metaData, updated_at: "" },
            pathData: [...prev.pathData, undonePaths[undonePaths.length - 1]],
          }));
          setUndonePaths((prevUndonePaths) => prevUndonePaths.slice(0, -1));
        }
        break;
      // case "select":
      //   setSelectMode(true);
      //   break;
      default: // check for shapes
        setCurrentShape({ name: command, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
        break;
    }
  }, [command, forceUpdate]);
};