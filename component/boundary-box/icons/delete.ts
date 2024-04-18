import { Alert } from 'react-native';


export const deleteSelected = (setMyPathData, showToast) => {
  Alert.alert("Delete Path", "Are you sure?", [
    { text: "Cancel", style: "cancel" },
    {
      text: "Delete",
      async onPress() {
        setMyPathData((previous) => {
          previous.pathData = previous.pathData.filter(
            (item) => item.selected !== true,
          );
          return {
            ...previous,
            metaData: { ...previous.metaData, updatedAt: "" },
          };
        });
        // setActiveBoundaryBoxPath(undefined);
        showToast("Path deleted!");
      },
    },
  ]);
};
