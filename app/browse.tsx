import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  type ListRenderItem,
  type FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SCREEN_WIDTH,
  FILE_PREVIEW_WIDTH,
  type MyPathDataType,
} from "@u/types";
import {
  getFiles,
} from "@u/storage";
import { useLocalSearchParams, useRouter } from "expo-router";
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
  const { heroEntry } = useLocalSearchParams<{ heroEntry: string }>();
  const [files, setFiles] = useState<MyPathDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { defaultStorageDirectory } = useUserPreferences();

  // const selectMode = useRef(false);
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

  const actualWindowsWidth = SCREEN_WIDTH - insets.left - insets.right;

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

  // let timeOutHandle;
  // useEffect(() => {
  //   timeOutHandle = setTimeout(() => {
  //     if (!isLoading) {
  //       clearTimeout(timeOutHandle);
  //       console.log("clearing timeout");
  //       return;
  //     }
  //     showToast(
  //       "Taking longer to load? \nPlease archive some of the sketches, you can restore them later.",
  //       { duration: 4000 },
  //     );
  //   }, 5000);
  // }, [isLoading]);

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
  const renderItem: ListRenderItem<MyPathDataType> = ({ item }) => (
    <RenderItem
      item={item}
      selectionMode={selectionMode}
      setSelectMode={setSelectMode}
      scrollViewRef={scrollViewRef}
      gap={gap}
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
            // onRefresh={() => fetchFiles(false)}
            // refreshing={isLoading}

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
    </>
  );
};

export default BrowseScreen;
