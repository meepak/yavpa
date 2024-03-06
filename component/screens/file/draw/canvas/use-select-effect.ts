import { getBoundaryBoxPath } from "@u/utility";
import { useEffect, useRef, useState } from "react";

export const useSelectEffect = ({
  editable,
  svgData,
  setSvgData,
  setIsLoading,
  selectedPaths,
  setSelectedPaths,
  setUnselectedPaths,
  setEditMode,
  setActiveBoundaryBoxPath,
  stroke,
  strokeWidth,
  strokeOpacity,
}) => {
  // const [isSvgDataUpdated, setIsSvgDataUpdated] = useState(false);
  // const [isSelectedPathsUpdated, setIsSelectedPathsUpdated] = useState(false);
  const isSvgDataUpdated = useRef(false);
  const isSelectedPathsUpdated = useRef(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);


  useEffect(() => {
    setEditMode(editable);
  }, [editable])


  useEffect(() => {

    if (isSelectedPathsUpdated.current) {
      isSelectedPathsUpdated.current = false;
      return;
    }
    // console.log('use select SVGDATA effect triggered ');
    if (selectedPaths.length === 0) {
      setUnselectedPaths(svgData.pathData);
      return;
    }
    // console.log('total paths', svgData.pathData.length)
    console.log('selected paths', selectedPaths.length );
    const newUnselectedPaths = svgData.pathData.filter((path) => !selectedPaths.includes(path));
    // console.log('new unselected paths: ', newUnselectedPaths?.length);
    setUnselectedPaths(newUnselectedPaths || []);


    isSelectedPathsUpdated.current = true;
  }, [svgData]);

  /**
   * get boundary box of selected paths
   */
  useEffect(() => {

    if (isSvgDataUpdated.current) {
      isSvgDataUpdated.current = false;
      return;
    }
    // console.log('use select SELECTED PATHS effect triggered ');
    if (selectedPaths.length === 0) {
      setActiveBoundaryBoxPath(null);
      setEditMode(true);
      return;
    }

    // there is selected path, so we are not in edit mode
    setEditMode(false);

    // get boundary box of selected paths
    const boundaryBoxPathData = getBoundaryBoxPath(selectedPaths);
    setActiveBoundaryBoxPath(boundaryBoxPathData);


    // check if the selected path data is different than then in source svg data
    const updatedSelectedPaths = svgData.pathData.filter((path) =>
      selectedPaths.find((selectedPath) =>
        (selectedPath.guid === path.guid && selectedPath !== path)));

    if (updatedSelectedPaths.length === 0) {
      // console.log('no change in selected paths');
      return;
    }

    console.log('saving svg data');

    // save updated selected paths to svg data
    setSvgData((prev) => {
      const newPathData = prev.pathData.map((item) => {
        const updatedPath = updatedSelectedPaths.find((path) => path.guid === item.guid);
        return updatedPath ?? item;
      });
      return {
        ...prev,
        pathData: newPathData,
        metaData: {
          ...prev.metaData,
          updated_at: "",
        }
      };
    });


    isSvgDataUpdated.current = true;

  }, [selectedPaths]);



  /*
  * selected path is updated with given property, sync back with svg data
  * update selected path with given property
  */
  const updateSelectedPath = (property: string, value: any) => {
    if(selectedPaths.length < 1) return;
    // console.log('updating selected path with property: ', property, ' value: ', value);
    if (!value) return;
    setSelectedPaths((prev) => {
      const newPathData = prev.map((item) => {
        return {
          ...item,
          [property]: value,
        };
      });
      return newPathData;
    });
  }

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