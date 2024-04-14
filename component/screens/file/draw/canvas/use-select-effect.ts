import { getBoundaryBox } from "@c/my-boundary-box-paths";
import { PathDataType, MyPathDataType } from "@u/types";
import { useEffect } from "react";

export const useSelectEffect = ({
  myPathData,
  setMyPathData,
  setEditMode,
  setActiveBoundaryBoxPath,
  stroke,
  strokeWidth,
  strokeOpacity,
  activePathToEdit,
}) => {

  useEffect(() => {

    if(activePathToEdit) {
      return;
    }

    let selectedPaths = myPathData.pathData.filter((item: PathDataType) => item.selected);

    if (selectedPaths.length === 0) {
      setActiveBoundaryBoxPath(() => null);
      setEditMode(true);
      return;
    }

    setEditMode(false);

    // myConsole.log("selectedPaths", selectedPaths.length);
    const rectPathData = getBoundaryBox(selectedPaths);
    setActiveBoundaryBoxPath(rectPathData);

  }, [myPathData]);


  const updateSelectedPath = (property: string, value: any) => {
    if (!value) return;
    setMyPathData((prev: MyPathDataType) => {
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
