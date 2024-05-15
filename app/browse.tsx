import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  FlatList,
  ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { SCREEN_WIDTH, FILE_PREVIEW_WIDTH, MyPathDataType, MY_PRIMARY_COLOR } from "@u/types";
import { getFiles } from "@u/storage";
import {
  StickyHeaderFlatList,
  useStickyHeaderScrollProps,
} from "react-native-sticky-parallax-header";
import { StatusBar } from "expo-status-bar";
import Header from "@c/screens/browse/header";
import MyBlueButton from "@c/controls/pure/my-blue-button";
import myConsole from "@c/controls/pure/my-console-log";
import Animated, { FlipInYLeft } from "react-native-reanimated";
import { useUserPreferences } from "@x/user-preferences";
import { useToastContext } from "@x/toast-context";
import RenderItem from "@c/screens/browse/render-item";
import SelectModeButtons from "@c/screens/browse/select-mode-buttons";

const PARALLAX_HEIGHT = 238;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 238;

const MINIMUM_GAP_BETWEN_PREVIEW = 11;

const BrowseScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<MyPathDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { defaultStorageDirectory } = useUserPreferences();
  const [selectionMode, setSelectionMode] = useState(false);
  const { showToast } = useToastContext();


  const flip = FlipInYLeft.springify()
    .damping(30)
    .mass(1)
    .stiffness(100)
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

  const enteringAnimation = flip;
  const exitingAnimation = undefined;


  const {
    onMomentumScrollEnd,
    onScroll,
    onScrollEndDrag,
    scrollHeight,
    scrollValue,
    scrollViewRef,
  } = useStickyHeaderScrollProps<FlatList>({
    parallaxHeight: 238,
    snapStartThreshold: 50,
    snapStopThreshold: 238,
    snapToEdge: true,
  });

 const actualWindowsWidth = SCREEN_WIDTH - insets.left - insets.right;
 let numberOfColumns = Math.floor(actualWindowsWidth / FILE_PREVIEW_WIDTH);
 let gap =
   (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) /
   (numberOfColumns + 1);
 while (gap < 11) {
   numberOfColumns -= 1;
   gap =
     (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) /
     (numberOfColumns + 1);
 }


  const setSelectMode = (value: boolean) => {
    setSelectionMode(value);
    // selectMode.current = value;
    if (!value) {
      files.forEach((item) => {
        item.metaData.variable["selected"] = false;
      });
    }
    scrollViewRef.current?.forceUpdate(() => {});
  };

  // const fetchPreviewFiles

  // fetch file images only
  const fetchFiles = useCallback(
    async (allowCache = true) => {
      setFiles([]);
      setIsLoading(true);
      const myPathData: MyPathDataType[] = (
        await getFiles(defaultStorageDirectory, allowCache)
      ).sort(
        (a, b) =>
          Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt),
      );
      setFiles(myPathData);
      setIsLoading(false);
      console.log("got files", myPathData.length);
    },
    [defaultStorageDirectory],
  );

  useEffect(() => {
    myConsole.log("again fetching files..", defaultStorageDirectory);
    fetchFiles(false).then(() => {
      setIsLoading(false);
    });
  }, [defaultStorageDirectory]);

  // Assign this component to renderItem for use in a FlatList or StickyHeaderFlatList
  const renderItem: ListRenderItem<MyPathDataType> = ({ item, index }) => (
    <RenderItem
      item={item}
      selectionMode={selectionMode}
      setSelectMode={setSelectMode}
      scrollViewRef={scrollViewRef}
      gap={gap}
      key={index}
    />
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen
        options={{
          headerShown: false,
          statusBarTranslucent: true,
          statusBarHidden: false,
          statusBarStyle: "light",
          statusBarAnimation: "none",
          statusBarColor: "transparent",
          contentStyle: {
            backgroundColor: MY_PRIMARY_COLOR,
          }
        }}
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
        {selectionMode && (
          <SelectModeButtons
            files={files}
            fetchFiles={fetchFiles}
            setSelectMode={setSelectMode}
            setIsLoading={setIsLoading}
          />
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
    </View>
  );
};

export default BrowseScreen;
