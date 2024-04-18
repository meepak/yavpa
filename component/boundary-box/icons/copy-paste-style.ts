import React from "react";

export type PathStyleType = {
  strokeWidth: number;
  stroke: string;
  strokeOpacity: number;
  fill: string;
};

export const copyStyle = (myPathData, showToast, setStyleClipBoard) => {
  for (const item of myPathData.pathData) {
    if (item.selected === true) {
      const pathStyle = {
        strokeWidth: item.strokeWidth,
        stroke: item.stroke,
        strokeOpacity: item.strokeOpacity,
        fill: item.fill,
      } as PathStyleType;
      setStyleClipBoard(pathStyle);
      showToast("Style copied!");
    }
  }
};

export const pasteStyle = (setMyPathData, showToast, styleClipBoard) => {
  if (styleClipBoard == null) {
    return;
  }

  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.selected === true) {
        item.strokeWidth = styleClipBoard.strokeWidth;
        item.stroke = styleClipBoard.stroke;
        item.strokeOpacity = styleClipBoard.strokeOpacity;
        item.fill = styleClipBoard.fill;
        item.updatedAt = new Date().toISOString();
      }
    }

    return {
      ...previous,
      metaData: { ...previous.metaData, updatedAt: "" },
      updatedAt: new Date().toISOString(),
    };
  });
  showToast("Style applied!");
};
