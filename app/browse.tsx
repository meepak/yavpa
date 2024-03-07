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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyIcon from "@c/my-icon";
import { CANVAS_HEIGHT, CANVAS_WIDTH, SCREEN_WIDTH, SvgDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import { Link, useRouter } from "expo-router";
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { HeaderBar, Foreground } from "@c/screens/browse";
import MyPreview from "@c/my-preview";
import CreativeVoid from "@c/creative-void/creative-void";
import elevations from "@u/elevation";
import Animated, { interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from "react-native-reanimated";

const PARALLAX_HEIGHT = 238;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 238;


const FILE_PREVIEW_WIDTH = 108;
const OFFSET = 125;
const MINIMUM_GAP_BETWEN_PREVIEW = 11;
const FILE_PREVIEW_BOTTOM_MARGIN = 15;

const ITEM_WIDTH=100;
const ITEM_HEIGHT=150;

const ListItem = ({ item, index, scrollY }) => {
  const inputRange = [
    -1,
    0,
    ITEM_WIDTH * index,
    ITEM_HEIGHT * (index + 2)
  ];

  const animatedStyles = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, inputRange, [1, 1, 1, 0]);
    const translateY = interpolate(scrollY.value, inputRange, [1, 1, 1, 0]);

    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={{
      width: 150,
      height: 200,
      borderWidth: 2,
      borderRadius: 7,
      borderColor: 'yelow',
      alignContent: 'center',
      alignItems: 'center',
      padding: 2,
      overflow: 'hidden',
      ...animatedStyles // Remove the unused left side of the comma operator
    }}>
      <MyPreview animate={false} data={item} />
    </Animated.View>
  );
};



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
  const windowWidth = Dimensions.get("screen").height;
  const windowHeight = Dimensions.get("screen").width;

  const actualWindowsWidth = windowWidth - insets.top - insets.bottom;
  const actualWindowsHeight = windowHeight - insets.right - insets.left;

  const filePreviewHeight = ((actualWindowsHeight - OFFSET) * FILE_PREVIEW_WIDTH / actualWindowsWidth);
  let numberOfColumns = Math.floor(actualWindowsWidth / FILE_PREVIEW_WIDTH);
  let gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1);
  while (gap < MINIMUM_GAP_BETWEN_PREVIEW) {
    numberOfColumns -= 1;
    gap = (actualWindowsWidth - numberOfColumns * FILE_PREVIEW_WIDTH) / (numberOfColumns + 1)
  }

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const fetchFiles = useCallback(async () => {
    try {
      setIsLoading(true);
      let svgData = await getFiles();
      // Sort the data here before setting it to the state
      svgData = svgData.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));
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

  const renderItem: ListRenderItem<SvgDataType> = useCallback(({ item, index }: { item: SvgDataType, index: number }) => {
    // return (
    //   <ListItem item={item} index={index} scrollY={scrollY} />
    // );
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
              width: ITEM_WIDTH,
              height: ITEM_HEIGHT,
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
          <CreativeVoid width={CANVAS_HEIGHT} height={CANVAS_HEIGHT} animate={true} />
        </View>
      </>
      : null
  ), [noSketch, files]);


  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ alignSelf: 'stretch', flex: 1 }}>
        <FlatList
          ref={scrollViewRef}
          style={{ paddingTop: 25 }}
          keyExtractor={item => item.metaData.guid}
          data={files}
          initialNumToRender={3}
          maxToRenderPerBatch={10}
          windowSize={10}
          renderItem={renderItem}
          horizontal={false}
          showsVerticalScrollIndicator={false}
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
  headerDetailsButtonTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 20,
  },
});

export default BrowseScreen;
