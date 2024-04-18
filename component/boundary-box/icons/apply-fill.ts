export const applyFill = (setMyPathData, fill: string) => {
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.selected === true) {
        item.fill = fill;
      }
    }

    return { ...previous, metaData: { ...previous.metaData, updatedAt: "" } };
  });
  // setActiveBoundaryBoxPath(undefined);
  close();
};
