export const closePath = (setMyPathData, showToast) => {
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.selected === true) {
        item.path += "Z";
        item.updatedAt = new Date().toISOString();
      }
    }

    return {
      ...previous,
      metaData: { ...previous.metaData, updatedAt: "" },
      updatedAt: new Date().toISOString(),
    };
  });
  showToast("Path Closed!");
};