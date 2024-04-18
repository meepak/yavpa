import { flipPoints, getPathFromPoints, getPointsFromPath } from "@u/helper";

export const flipPaths = (setMyPathData, showToast, flipX = false, flipY = false) => {
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.selected === true) {
        const points = getPointsFromPath(item.path);
        const newPoints = flipPoints(points, flipX, flipY);
        item.path = getPathFromPoints(newPoints);
        item.updatedAt = Date.now().toString();
      }
    }

    return { ...previous, metaData: { ...previous.metaData, updatedAt: "" } };
  });
  showToast(
    "Flipped along " + (flipX ? "X" : "") + (flipY ? "Y" : "") + " axis!",
  );
};
