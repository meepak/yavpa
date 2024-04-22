import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type ListRenderItem,
  Alert,
  type FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  type MyPathDataType,
  MY_ON_PRIMARY_COLOR,
  MY_PRIMARY_COLOR,
} from "@u/types";
import { deleteFile, duplicateFile, getFiles } from "@u/storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StickyHeaderFlatList,
  useStickyHeaderScrollProps,
} from "react-native-sticky-parallax-header";
import { StatusBar } from "expo-status-bar";
import Header from "@c/screens/browse/header";
import MyPreview from "@c/controls/my-preview";
import MyBlueButton from "@c/controls/pure/my-blue-button";
import myConsole from "@c/controls/pure/my-console-log";
import Animated, { FlipInYLeft } from "react-native-reanimated";
import { useUserPreferences } from "@x/user-preferences";
// import MyPathLogo from "@c/logo/my-path-logo";
import MyCheckBox from "@c/controls/pure/my-check-box";
import { duplicateSelected } from "../component/boundary-box/icons/duplicate";

const PARALLAX_HEIGHT = 238;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 238;

const FILE_PREVIEW_WIDTH = 108;
const OFFSET = 125;
const MINIMUM_GAP_BETWEN_PREVIEW = 11;
const FILE_PREVIEW_BOTTOM_MARGIN = 15;

const BrowseScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { heroEntry } = useLocalSearchParams<{ heroEntry: string }>();
  const [files, setFiles] = useState<MyPathDataType[]>([]);
  // Const [showPathPlay, setShowPathPlay] = useState(true);
  // const [noSketch, setNoSketch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { defaultStorageDirectory } = useUserPreferences();

  const selectMode = useRef(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const flip = FlipInYLeft.springify()
    .damping(30) // Increase to make the animation stop more quickly
    .mass(1) // Keep the same to maintain the "weight" of the animation
    .stiffness(100) // Increase to make the animation start more quickly
    .overshootClamping(0.1)
    .restDisplacementThreshold(0.1)
    .restSpeedThreshold(1)
    .withInitialValues({
      transform: [
        { perspective: 0 },
        { rotateY: "-360deg" },
        { translateX: 0 },
      ],
    });

  const enteringAnimation = heroEntry === "yes" ? flip : undefined;
  const exitingAnimation = undefined;

  const {
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = useStickyHeaderScrollProps<FlatList>({
    parallaxHeight: PARALLAX_HEIGHT,
    snapStartThreshold: SNAP_START_THRESHOLD,
    snapStopThreshold: SNAP_STOP_THRESHOLD,
    snapToEdge: true,
  });

  // Calculate dimension for file preview box

  const actualWindowsWidth = SCREEN_WIDTH - insets.left - insets.right;
  const actualWindowsHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const filePreviewHeight =
    ((actualWindowsHeight - OFFSET) * FILE_PREVIEW_WIDTH) / actualWindowsWidth;
  let numberOfColumns = Math.floor(actualWindowsWidth / FILE_PREVIEW_WIDTH);
  let gap =
    (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) /
    (numberOfColumns + 1);
  while (gap < MINIMUM_GAP_BETWEN_PREVIEW) {
    numberOfColumns -= 1;
    gap =
      (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) /
      (numberOfColumns + 1);
  }

  const setSelectMode = (value: boolean) => {
    setSelectionMode(value);
    selectMode.current = value;
    if (!value) {
      // make sure all selected are unselected
      files.forEach((item) => {
        item.metaData.variable = false;
      });
    }
    scrollViewRef.current?.forceUpdate(() =>
      console.log("multiple delete cancelleds"),
    );
  };

  const fetchFiles = useCallback(
    async (allowCache = true) => {
      try {
        myConsole.log(
          "fetching files from default storage",
          defaultStorageDirectory,
        );
        setIsLoading(true);
        let myPathData = await getFiles(defaultStorageDirectory, allowCache);
        // Sort the data here before setting it to the state
        myPathData = myPathData.sort(
          (a, b) =>
            Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt),
        );
        setFiles(myPathData);
        // if (myPathData.length === 0) {
        //   setNoSketch(true);
        // }
        setIsLoading(false);
      } catch (error) {
        myConsole.log("error fetching files", error);
        setIsLoading(false);
      }
    },
    [defaultStorageDirectory],
  );

  // refresh all files if default storage directory changed
  useEffect(() => {
    myConsole.log("again fetching files..", defaultStorageDirectory);
    fetchFiles(false).then(() => {
      setIsLoading(false);
    });
  }, [defaultStorageDirectory]);

  // TODO -- show count and show toast of deleted files
  const deleteSelectedSketch = () => {
    // MyConsole.log('confirm delete ' + guid);
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
            await Promise.all(
              files.map((item) => {
                if (item.metaData.variable) {
                  return deleteFile(
                    defaultStorageDirectory,
                    item.metaData.guid,
                  );
                }
              }),
            );
            setSelectMode(false);
            await fetchFiles(true);
          },
        },
      ],
    );
  };

  const duplicateSelectedSketch = () => {
    setIsLoading(true);
    files.forEach(async (item) => {
      if (item.metaData.variable) {
        await duplicateFile(defaultStorageDirectory, item.metaData.guid);
      }
    });
    fetchFiles();
    setSelectMode(false);
    setIsLoading(false);
  };

  const renderItem: ListRenderItem<MyPathDataType> = useCallback(
    ({ item }: { item: MyPathDataType }) => {
      return (
        <TouchableOpacity
          onPress={() => {
            selectionMode || selectMode.current
              ? ((item.metaData.variable = !item.metaData.variable),
                scrollViewRef.current?.forceUpdate(() =>
                  console.log("updated"),
                ))
              : router.navigate(`/file?guid=${item.metaData.guid}`);
          }}
          onLongPress={() => {
            item.metaData.variable = true;
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
                // Padding: 2,
                overflow: "hidden",
                borderRadius: 7,
                borderWidth: 1.4,
                backgroundColor: MY_ON_PRIMARY_COLOR,
              }}
            >
              {(selectionMode || selectMode.current) && (
                <View style={{ position: "absolute", top: 0, right: 0 }}>
                  <MyCheckBox
                    label=""
                    checked={item.metaData.variable}
                    onChange={(value) => {
                      // setUserPreferences({ usePenOffset: value });
                    }}
                    iconStyle={{
                      color: item.metaData.variable ? "#550000" : "#084d16",
                      fill: item.metaData.variable ? "#550000" : "#084d16",
                      strokeWidth: 1.0,
                    }}
                  />
                </View>
              )}

              <MyPreview animate={false} data={item} />
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
    },
    [],
  );

  const renderHeader = useCallback(
    () => (
      <View pointerEvents="box-none" style={{ height: scrollHeight }}>
        <Header scrollValue={scrollValue} />
      </View>
    ),
    [scrollValue],
  );

  return (
    <>
      <StatusBar
        hidden={false}
        style={"light"}
        backgroundColor="transparent"
        translucent={true}
      />
      <Animated.View
        style={StyleSheet.absoluteFill}
        entering={enteringAnimation}
        exiting={exitingAnimation}
      >
        <View style={{ alignSelf: "stretch", flex: 1 }}>
          <StickyHeaderFlatList
            key={numberOfColumns}
            ref={scrollViewRef}
            containerStyle={{
              paddingTop: HEADER_BAR_HEIGHT,
              alignSelf: "stretch",
              flex: 1,
            }}
            contentContainerStyle={{
              paddingBottom: 30,
            }}
            style={{ paddingTop: 25 }}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={onScrollEndDrag}
            renderHeader={renderHeader}
            keyExtractor={(item) => numberOfColumns + item.metaData.guid}
            numColumns={numberOfColumns}
            data={files}
            initialNumToRender={9}
            maxToRenderPerBatch={9}
            windowSize={12}
            renderItem={renderItem}
            horizontal={false}
            showsVerticalScrollIndicator={false}
          />
          {isLoading && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
              }}
            >
              <ActivityIndicator
                style={{
                  top: -HEADER_BAR_HEIGHT,
                  backgroundColor: "transparent",
                }}
                animating
                size={100}
                color={"#e0f2fdCC"}
              />
            </View>
          )}
        </View>
        {(selectionMode || selectMode.current) && (
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
        )}
        <MyBlueButton
          icon={{ desc: "", name: "new", size: 60 }}
          onPress={() => {
            router.push("/file");
          }}
          bottom={insets.bottom + 16}
          aligned="right"
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    alignSelf: "stretch",
  },
  headerBarContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "transparent",
    height: HEADER_BAR_HEIGHT,
    flex: 1,
    overflow: "hidden",
    zIndex: 3,
  },
  tabContainer: {
    paddingTop: HEADER_BAR_HEIGHT,
  },
});

export default BrowseScreen;
