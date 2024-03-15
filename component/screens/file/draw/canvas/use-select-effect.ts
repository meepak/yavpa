import { createPathdata, getViewBoxTrimmed } from "@u/helper";
import { shapeData } from "@u/shapes";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@u/types";
import { getBoundaryBoxPath } from "@u/utility";
import { useEffect, useRef, useState } from "react";

export const useSelectEffect = ({
  editable,
  svgData,
  setSvgData,
  setIsLoading,
  setEditMode,
  activeBoundaryBoxPath,
  setActiveBoundaryBoxPath,
  stroke,
  strokeWidth,
  strokeOpacity,
}) => {

  useEffect(() => {
    // console.log('use select effect triggered ');
    let selectedPaths: PathDataType[] = [];
    let maxStrokeWidth = 0;
    [...svgData.pathData].forEach((item, index) => {
      if (item.selected) {
        setEditMode(false);
        selectedPaths.push({ ...item });
        if (item.strokeWidth > maxStrokeWidth) {
          maxStrokeWidth = item.strokeWidth;
        }
      }
    });

    if (selectedPaths.length === 0) {
      setEditMode(true);
      setActiveBoundaryBoxPath(null);
      console.log('nothing selected, continue editing');
      return;
    }



    // console.log('something selected fell through')
    let offset = maxStrokeWidth / 2;
    let rectPath;
    if (selectedPaths.length < svgData.pathData.length) {
    const vbbox = getViewBoxTrimmed(selectedPaths, offset);
    const vbbPoints = vbbox.split(" ");
    rectPath = shapeData({
      name: "rectangle",
      start: { x: parseFloat(vbbPoints[0]), y: parseFloat(vbbPoints[1]) },
      end: { x: parseFloat(vbbPoints[0]) + parseFloat(vbbPoints[2]), y: parseFloat(vbbPoints[1]) + parseFloat(vbbPoints[3]) }
    });} else {
      // take full canvas as boundary box
      rectPath = shapeData({
        name: "rectangle",
        start: { x: 0, y: 0 },
        end: { x: CANVAS_WIDTH, y: CANVAS_HEIGHT }
      });
    }

    const rectPathData = createPathdata("#00CACB", 3, 1);
    rectPathData.path = rectPath;
    rectPathData.strokeDasharray = "7,7";
    setEditMode(false);
    rectPathData.strokeDashoffset = 0; // boundaryBoxDashoffset;
    // console.log('boumdary box path data set from use select effect'); //, rectPathData);
    setActiveBoundaryBoxPath(rectPathData);

  }, [svgData]);

  const updateSelectedPath = (property, value) => {
    if (!value) return;
    setSvgData((prev) => {
      const newPathData = prev.pathData.map((item) => {
        if (item.selected) {
          return {
            ...item,
            [property]: value,
          };
        } else {
          return item;
        }
      });
      return {
        ...prev,
        pathData: newPathData,
        metaData: {
          ...prev.metaData,
          updated_at: "",
        },
      };
    });
  };

  useEffect(() => {
    updateSelectedPath('stroke', stroke);
  }, [stroke]);

  useEffect(() => {
    updateSelectedPath('strokeWidth', strokeWidth);
  }, [strokeWidth]);

  useEffect(() => {
    updateSelectedPath('strokeOpacity', strokeOpacity);
  }, [strokeOpacity]);


}
