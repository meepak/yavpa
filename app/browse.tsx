import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ListRenderItem,
  Alert,
  FlatList,
  ActivityIndicator
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CANVAS_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH, SvgDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import { useRouter } from "expo-router";
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { StatusBar } from "expo-status-bar";
import Header from "@c/screens/browse/header";
import MyPreview from "@c/my-preview";
import CreativeVoid from "@c/creative-void/creative-void";
import MyBlueButton from "@c/my-blue-button";

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
      svgData = svgData.sort((a, b) => Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt));
      setFiles(svgData);
      if (svgData.length === 0) {
        setNoSketch(true);
      }
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
      <Header scrollValue={scrollValue} />
    </View>
  ), [scrollValue]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ alignSelf: 'stretch', flex: 1 }}>
        <StickyHeaderFlatList
          key={numberOfColumns}
          ref={scrollViewRef}
          containerStyle={{
            paddingTop: HEADER_BAR_HEIGHT,
            alignSelf: 'stretch',
            flex: 1,
          }}
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          style={{paddingTop: 25 }}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollEndDrag={onScrollEndDrag}
          renderHeader={renderHeader}

          // initialNumToRender={6}
          // maxToRenderPerBatch={20}
          keyExtractor={item => numberOfColumns  + item.metaData.guid}
          numColumns={numberOfColumns}
          data={files}
          initialNumToRender={3}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={renderItem}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          onLayout={() => setIsLoading(false)}
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
              color="#120e31"
            />
          </View>
        )}
      </View>
      {NoSketchFound}
        <MyBlueButton
          icon={{ desc: '', name: 'new', size: 60, left: 0, top: 0 }}
          onPress={() => router.push('/file')}
          bottom={insets.bottom + 16}
          aligned="right"
          // {...elevations[10]}
          />
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
});

export default BrowseScreen;
