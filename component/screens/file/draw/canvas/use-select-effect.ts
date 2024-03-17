import { getBoundaryBox, getCanvasAsBoundaryBox } from "@u/boundary-box";
import { PathDataType, SvgDataType } from "@u/types";
import { useEffect } from "react";

export const useSelectEffect = ({
  svgData,
  setSvgData,
  setEditMode,
  setActiveBoundaryBoxPath,
  stroke,
  strokeWidth,
  strokeOpacity,
  viewBoxAdjustMode,
}) => {

  useEffect(() => {

    if(viewBoxAdjustMode) {
      setEditMode(false);
      const canvasBoundaryBox = getCanvasAsBoundaryBox();
      setActiveBoundaryBoxPath(canvasBoundaryBox);
      setSvgData((prev: SvgDataType) => {
        prev.pathData.forEach((item) => {
          item.selected = true;
        });
        return prev;
      });
      return;
    }

    let selectedPaths = svgData.pathData.filter((item: PathDataType) => item.selected);

    if (selectedPaths.length === 0) {
      setEditMode(true);
      setActiveBoundaryBoxPath(null);
      return;
    }

    setEditMode(false);

    const rectPathData = getBoundaryBox(selectedPaths);
    setActiveBoundaryBoxPath(rectPathData);

  }, [svgData, viewBoxAdjustMode]);


  const updateSelectedPath = (property: string, value: any) => {
    if (!value) return;
    setSvgData((prev: SvgDataType) => {
      const newPathData = prev.pathData.map((item: PathDataType) => {
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
          updatedAt: "",
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
