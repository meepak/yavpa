import MyBlueButton from "@c/controls/pure/my-blue-button";
import { deleteFiles, duplicateFile } from "@u/storage";
import { MyPathDataType } from "@u/types";
import { useToastContext } from "@x/toast-context";
import { useUserPreferences } from "@x/user-preferences";
import { useContext } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SelectModeButtons = ({
  files,
  fetchFiles,
  setSelectMode,
  setIsLoading,
}: {
  files: MyPathDataType[];
  fetchFiles: (value?: boolean) => {};
  setSelectMode: (value: boolean) => void;
  setIsLoading: (value: boolean) => void;
}) => {
  const insets = useSafeAreaInsets();
  const { defaultStorageDirectory } = useUserPreferences();
  const { showToast } = useToastContext();

  const deleteSelectedSketch = () => {
    Alert.alert(
      "Delete Sketch",
      "Are you sure you want to delete selected sketch permanently?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {},
        },
        {
          text: "Delete",
          async onPress() {
            const guids = files.map((item) =>
              item.metaData.variable["selected"] ? item.metaData.guid : "",
            );
            await Promise.all(
              files.map((item) => {
                if (item.metaData.variable["selected"]) {
                  return deleteFiles(defaultStorageDirectory, guids);
                }
              }),
            );
            setSelectMode(false);
            await fetchFiles(true);
            showToast("Sketches deleted successfully");
          },
        },
      ],
    );
  };

  const duplicateSelectedSketch = () => {
    setIsLoading(true);
    files.forEach(async (item) => {
      if (item.metaData.variable["selected"]) {
        await duplicateFile(defaultStorageDirectory, item.metaData.guid);
      }
    });
    fetchFiles();
    setSelectMode(false);
    setIsLoading(false);
  };
  return (
    <>
      <MyBlueButton
        icon={{ desc: "Delete", name: "trash", size: 22 }}
        onPress={deleteSelectedSketch}
        bottom={insets.bottom + 196}
        aligned="right"
        bgColor={"#550000"}
        bgPressedColor={"#2d0000"}
      />
      <MyBlueButton
        icon={{ desc: "Duplicate", name: "duplicate", size: 22 }}
        onPress={duplicateSelectedSketch}
        bottom={insets.bottom + 136}
        aligned="right"
        bgColor={"#5e6a12"}
        bgPressedColor={"#3c430b"}
      />
      <MyBlueButton
        icon={{ desc: "Cancel", name: "ok", size: 22 }}
        onPress={() => {
          setSelectMode(false);
        }}
        bottom={insets.bottom + 76}
        aligned="right"
        bgColor={"#084d16"}
        bgPressedColor={"#052f0e"}
      />
    </>
  );
};

export default SelectModeButtons;