import MyPreview from "@c/controls/my-preview";
import MyCheckBox from "@c/controls/pure/my-check-box";
import { getScreenshot } from "@u/storage";
import {
  MyPathDataType,
  FILE_PREVIEW_WIDTH,
  MY_ON_PRIMARY_COLOR,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
} from "@u/types";
import { useUserPreferences } from "@x/user-preferences";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useState, useEffect, MutableRefObject, RefObject } from "react";
import { TouchableOpacity, View, Text, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { StickyHeaderFlatList } from "react-native-sticky-parallax-header";

const RenderItem = ({
  item,
  selectionMode,
  scrollViewRef,
  setSelectMode,
  gap,
}: {
  item: MyPathDataType;
  selectionMode: boolean;
  scrollViewRef: RefObject<FlatList>;
  setSelectMode: (value: boolean) => void;
  gap: number;
}) => {
  const { defaultStorageDirectory } = useUserPreferences();
  const [imageBase64, setImageBase64] = useState<string>();

  const FILE_PREVIEW_BOTTOM_MARGIN = 15;
  const filePreviewHeight = (CANVAS_HEIGHT * FILE_PREVIEW_WIDTH) / CANVAS_WIDTH;

  useEffect(() => {
    const fetchImage = async () => {
      const image = await getScreenshot(
        defaultStorageDirectory,
        item.metaData.guid,
        "canvas",
      );
      setImageBase64(image);
    };

    fetchImage();
  }, [item.metaData.guid]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (selectionMode) {
          item.metaData.variable["selected"] =
            !item.metaData.variable["selected"];

          scrollViewRef.current?.forceUpdate(() => console.log("updated"));
        } else {
          router.navigate(`/file?guid=${item.metaData.guid}`);
        }
      }}
      onLongPress={() => {
        item.metaData.variable["selected"] = true;
        setSelectMode(true);
      }}
      activeOpacity={0.45}
    >
      <View
        style={{
          width: FILE_PREVIEW_WIDTH + 2,
          marginTop: FILE_PREVIEW_BOTTOM_MARGIN / 2,
          alignContent: "center",
          alignItems: "center",
          marginLeft: gap,
          marginBottom: FILE_PREVIEW_BOTTOM_MARGIN,
        }}
      >
        <View
          style={{
            width: FILE_PREVIEW_WIDTH,
            height: filePreviewHeight,
            alignContent: "center",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: 7,
            borderWidth: 1.4,
            backgroundColor: MY_ON_PRIMARY_COLOR,
          }}
        >
          {selectionMode && (
            <View style={{ position: "absolute", top: 0, right: 0 }}>
              <MyCheckBox
                label=""
                checked={item.metaData.variable["selected"]}
                onChange={(value) => {
                  // setUserPreferences({ usePenOffset: value });
                }}
                iconStyle={{
                  color: item.metaData.variable["selected"]
                    ? "#550000"
                    : "#084d16",
                  fill: item.metaData.variable["selected"]
                    ? "#550000"
                    : "#084d16",
                  strokeWidth: 1.0,
                }}
              />
            </View>
          )}
        {imageBase64 ? (
          <Image
            source={{ uri: imageBase64 }}
            style={{
              width: FILE_PREVIEW_WIDTH,
              height: filePreviewHeight,
            }}
          />
        ) : (
          <MyPreview animate={false} data={item} />
        )}
        </View>
        <View style={{ alignItems: "center" }}>
          {item.metaData.name
            .split(" ")
            .slice(0, 2)
            .map((line, i) => (
              <Text
                key={i}
                style={{
                  top: 4,
                  flexWrap: "wrap",
                  justifyContent: "center",
                  color: MY_ON_PRIMARY_COLOR,
                }}
              >
                {line}
              </Text>
            ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default RenderItem;
