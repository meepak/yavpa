import React, { useLayoutEffect, useState } from "react";
import { StyleSheet, Dimensions, Text, TouchableOpacity, View, ListRenderItem, Alert, FlatList, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MyIcon from "@c/my-icon";
import { SvgDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import { Link, useRouter } from "expo-router";
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { StatusBar } from "expo-status-bar";
import { Foreground } from "@c/browse/foreground";
import { HeaderBar } from "@c/browse/header-bar";
import MyPreview from "@c/my-preview";

const PARALLAX_HEIGHT = 238;
const HEADER_BAR_HEIGHT = 92;
const SNAP_START_THRESHOLD = 50;
const SNAP_STOP_THRESHOLD = 238;


const FILE_PREVIEW_WIDTH = 108;
const OFFSET = 125;
const MINIMUM_GAP_BETWEN_PREVIEW = 11;
const FILE_PREVIEW_BOTTOM_MARGIN = 15;



const BrowseScreen = () => {
  const router = useRouter(); HEADER_BAR_HEIGHT
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
    try {
      setIsLoading(true);
      const svgData = await getFiles();
      setFiles(() => svgData);
      if (svgData.length === 0) {
        setNoSketch(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('error fetching files', error)
    }
  };


  useLayoutEffect(() => {
    fetchFiles();
  }, []);

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

  const renderItem: ListRenderItem<SvgDataType> = ({ item }: { item: SvgDataType }) => {
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
          
          <MyPreview data={item} />

          </View>
          <View style={{ alignItems: 'center' }}>
            {item.metaData.name.split(' ').slice(0, 2).map((line, i) => (
              <Text key={i} style={{ top: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{line}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    )
  };

  // TODO put some animation here
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
          // onContentSizeChange={() => setIsLoading(false)}
        />
         {isLoading && (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent'
          }}>
            <ActivityIndicator 
              style={{ top: -HEADER_BAR_HEIGHT, backgroundColor: 'transparent' }}
              animating  
              size={150} 
              color="#0000ff"
            />
          </View>
        )}
        </View>
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
