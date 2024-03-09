import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
  ListRenderItem,
  Alert,
  FlatList,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyIcon from "@c/my-icon";
import { CANVAS_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH, SvgDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import { Link, useRouter } from "expo-router";
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { StatusBar } from "expo-status-bar";
import { HeaderBar, Foreground } from "@c/screens/browse";
import MyPreview from "@c/my-preview";
import CreativeVoid from "@c/creative-void/creative-void";
import elevations from "@u/elevation";

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
  const [files, setFiles] = useState<SvgDataType[]>([]);
  // const [showPathPlay, setShowPathPlay] = useState(true);
  const [noSketch, setNoSketch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


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

  const actualWindowsWidth = SCREEN_WIDTH - insets.left - insets.right;
  const actualWindowsHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  const filePreviewHeight = ((actualWindowsHeight - OFFSET) * FILE_PREVIEW_WIDTH / actualWindowsWidth);
  let numberOfColumns = Math.floor(actualWindowsWidth / FILE_PREVIEW_WIDTH);
  let gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1);
  while (gap < MINIMUM_GAP_BETWEN_PREVIEW) {
    numberOfColumns -= 1;
    gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1)
  }

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      let svgData = await getFiles();
      // Sort the data here before setting it to the state
      // svgData = svgData.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));
      setFiles(svgData);
      if (svgData.length === 0) {
        setNoSketch(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('error fetching files', error)
    }
  }, []);

  useLayoutEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const deleteSketchAlert = (guid: string) => {
    // console.log('confirm delete ' + guid);
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

  const renderItem: ListRenderItem<SvgDataType> = useCallback(({ item }: { item: SvgDataType }) => {
    return (
      <TouchableOpacity
        onPress={() => router.navigate(`/file?guid=${item.metaData.guid}`)}
        onLongPress={() => deleteSketchAlert(item.metaData.guid)}
      >
        <View
          style={{
            width: FILE_PREVIEW_WIDTH,
            marginTop: FILE_PREVIEW_BOTTOM_MARGIN / 2,
            alignContent: 'center',
            alignItems: 'center',
            marginLeft: gap,
            marginBottom: FILE_PREVIEW_BOTTOM_MARGIN,
          }}
        >
          <View
            style={{
              width: FILE_PREVIEW_WIDTH,
              height: filePreviewHeight,
              borderWidth: 2,
              borderRadius: 7,
              alignContent: 'center',
              alignItems: 'center',
              padding: 2,
              overflow: 'hidden',
            }}
          >

            <MyPreview animate={false} data={item} />

          </View>
          <View style={{ alignItems: 'center' }}>
            {item.metaData.name.split(' ').slice(0, 2).map((line, i) => (
              <Text key={i} style={{ top: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{line}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    )
  }, []);

  // TODO put some animation here
  const NoSketchFound = useMemo(() => (
    noSketch && files.length === 0
      ? <>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <CreativeVoid width={CANVAS_WIDTH} height={CANVAS_WIDTH} animate={true} />
        </View>
      </>
      : null
  ), [noSketch, files]);

  const renderHeader = useCallback(() => (
    <View pointerEvents="box-none" style={{ height: scrollHeight }}>
      <Foreground scrollValue={scrollValue} />
    </View>
  ), [scrollValue]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={[styles.headerBarContainer, { width: SCREEN_WIDTH}]}>
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
          style={{paddingTop: 25 }}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          renderHeader={renderHeader}

          // initialNumToRender={6}
          // maxToRenderPerBatch={20}
          keyExtractor={item => item.metaData.guid}
          numColumns={numberOfColumns}
          data={files}
          initialNumToRender={3}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={renderItem}
          horizontal={false}
          showsVerticalScrollIndicator={false}
        // onContentSizeChange={() => setIsLoading(false)}
        />
        {isLoading && (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator
              style={{ top: -HEADER_BAR_HEIGHT }}
              animating
              size={150}
              color="#0000ff"
            />
          </View>
        )}
      </View>
      {NoSketchFound}
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
    ...elevations[5],
  },
});

export default BrowseScreen;
