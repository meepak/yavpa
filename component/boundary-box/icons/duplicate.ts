import * as Crypto from 'expo-crypto';

export const duplicateSelected = (setMyPathData, showToast) => {
  setMyPathData((previous) => {
    for (const item of previous.pathData) {
      if (item.selected === true) {
        const duplicate = { ...item };
        duplicate.guid = Crypto.randomUUID();
        duplicate.selected = false;
        previous.pathData.push(duplicate);
      }
    }

    return {
      ...previous,
      metaData: { ...previous.metaData, updatedAt: new Date().toISOString() },
    };
  });

  showToast("Copy created!");
};
