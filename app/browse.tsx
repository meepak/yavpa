import React, { useCallback, useLayoutEffect, useState } from "react";
import { StyleSheet, Dimensions, Text, TouchableOpacity, View, ListRenderItem, Alert, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyIcon from "@c/my-icon";
import { SvgDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import Svg, { Path } from "react-native-svg";
import { Link, useRouter } from "expo-router";
// import GlassmorphicView from "@c/glassmorphic-view";
// import Animated, {
//   ZoomIn,
// } from 'react-native-reanimated';
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { StatusBar } from "expo-status-bar";
import { Foreground } from "@c/browse/foreground";
import { HeaderBar } from "@c/browse/header-bar";
import { Brushes, getBrush } from "@u/brushes";

const PARALLAX_HEIGHT = 238;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 238;


const FILE_PREVIEW_WIDTH = 108;
const OFFSET = 125;
const MINIMUM_GAP_BETWEN_PREVIEW = 11;
const FILE_PREVIEW_BOTTOM_MARGIN = 42;

const BrowseScreen = () => {
  const router = useRouter(); HEADER_BAR_HEIGHT
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<SvgDataType[]>([]);
  // const [showPathPlay, setShowPathPlay] = useState(true);
  const [noSketch, setNoSketch] = useState(false);

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


  // calculate dimension for file preview box
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;

  const actualWindowsWidth = windowWidth - insets.left - insets.right;
  const actualWindowsHeight = windowHeight - insets.top - insets.bottom;

  const filePreviewHeight = ((actualWindowsHeight - OFFSET) * FILE_PREVIEW_WIDTH / actualWindowsWidth);
  let numberOfColumns = Math.floor(actualWindowsWidth / FILE_PREVIEW_WIDTH);
  let gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1);
  while (gap < MINIMUM_GAP_BETWEN_PREVIEW) {
    numberOfColumns -= 1;
    gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1)
  }


  const fetchFiles = async () => {
    const svgData = await getFiles();
    setFiles(() => svgData);
    if (svgData.length === 0) {
      setNoSketch(true);
    }
  };


  useLayoutEffect(() => {
    fetchFiles();
  }, []);

  const deleteSketch = (guid: string) => {
    console.log('confirm delete ' + guid);
    Alert.alert("Delete Sketch", "Are you sure you want to delete this sketch permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          // console.log('delete', guid)
          const result = await deleteFile(guid)
          if (result) {
            await fetchFiles();
            scrollViewRef.current?.forceUpdate();
          }
        },
      },
    ]);
  }

  const renderItem: ListRenderItem<SvgDataType> = ({ item }: { item: SvgDataType }) => (
    <TouchableOpacity
      onPress={() => router.navigate(`/file?guid=${item.metaData.guid}`)}
      onLongPress={() => deleteSketch(item.metaData.guid)}
    >
      <View
        style={{
          width: FILE_PREVIEW_WIDTH,
          height: filePreviewHeight,
          borderWidth: 2,
          borderRadius: 5,
          marginLeft: gap,
          marginTop: FILE_PREVIEW_BOTTOM_MARGIN / 2,
          marginBottom: FILE_PREVIEW_BOTTOM_MARGIN,
          alignContent: 'center',
          alignItems: 'center',
          padding: 5,
          overflow: 'hidden',
        }}
      >
        <Svg width="100%" height="100%" viewBox={item.metaData.viewBox}>
          {item.pathData.map((path, index) => {
            if (!path.visible) {
              return null;
            }
            let brush: BrushType | undefined;
            if (path.stroke.startsWith("url(#")) {
              const brushGuid = path.stroke.slice(5, -1);
              brush = Brushes.find(brush => brush.params.guid === brushGuid);
            }
            return (
              <React.Fragment key={index}>
                {brush && getBrush(brush)}
                <Path
                  key={index}
                  d={path.path}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  strokeLinecap={path.strokeCap}
                  strokeLinejoin={path.strokeJoin}
                  opacity={path.strokeOpacity}
                  fill={'none'} />
              </React.Fragment>
            )
          })}
        </Svg>
        <View style={{ alignItems: 'center' }}>
          {item.metaData.name.split(' ').map((line, i) => (
            <Text key={i} style={{ top: 7, flexWrap: 'wrap', justifyContent: 'center' }}>{line}</Text>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const NoSketchFound = ({ noSketch }) => (
    noSketch && files.length === 0
      ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No sketches found</Text>
      </View>
      : null
  )

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.headerBarContainer, { width: windowWidth }]}>
        <HeaderBar scrollValue={scrollValue} />
      </View>
      <View style={{ alignSelf: 'stretch', flex: 1 }}>
        <StickyHeaderFlatList
          ref={scrollViewRef}
          containerStyle={{
            paddingTop: HEADER_BAR_HEIGHT,
            alignSelf: 'stretch',
            flex: 1,
          }}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          renderHeader={() => {
            return (
              <View pointerEvents="box-none" style={{ height: scrollHeight }}>
                <Foreground scrollValue={scrollValue} />
              </View>
            );
          }}

          // initialNumToRender={6}
          // maxToRenderPerBatch={20}
          keyExtractor={(item, index) => item.metaData.guid}
          numColumns={numberOfColumns}
          data={files}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        /></View>
      <NoSketchFound noSketch={noSketch} />
      <Link href="/file" asChild>
        <TouchableOpacity style={styles.floatingButton}>
          <MyIcon name="new" color='#FFFFFF' />
        </TouchableOpacity>
      </Link>
      <StatusBar translucent style="light" />
    </View>
  );
};


const styles = StyleSheet.create({
  content: {
    alignSelf: 'stretch',
  },
  headerBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: HEADER_BAR_HEIGHT,
    flex: 1,
    overflow: 'hidden',
    zIndex: 3,
  },
  tabContainer: {
    paddingTop: HEADER_BAR_HEIGHT,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'blue',
    position: 'absolute',
    bottom: 16,
    right: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    elevation: 5,
  },
});

export default BrowseScreen;
