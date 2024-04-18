export const unselect = (setMyPathData) => {
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      item.selected = false;
    }

    return {
      ...previous,
      pathData: previous.pathData,
      metaData: { ...previous.metaData, updatedAt: "" },
      updatedAt: new Date().toISOString(),
    };
  });
  // setActiveBoundaryBoxPath(undefined);
  // myConsole.log("deleteSelected")
};
