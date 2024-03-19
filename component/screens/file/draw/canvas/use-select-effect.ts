import { getBoundaryBox } from "@c/my-boundary-box";
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
}) => {

  useEffect(() => {

    let selectedPaths = svgData.pathData.filter((item: PathDataType) => item.selected);

    if (selectedPaths.length === 0) {
      setActiveBoundaryBoxPath(() => null);
      setEditMode(true);
      return;
    }

    setEditMode(false);

    // console.log("selectedPaths", selectedPaths.length);
    const rectPathData = getBoundaryBox(selectedPaths);
    setActiveBoundaryBoxPath(rectPathData);

  }, [svgData]);


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
