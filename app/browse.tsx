import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
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
import { MY_BLACK, SCREEN_HEIGHT, SCREEN_WIDTH, MyPathDataType } from "@u/types";
import { deleteFile, getFiles } from "@u/storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StickyHeaderFlatList, useStickyHeaderScrollProps } from 'react-native-sticky-parallax-header';
import { StatusBar } from 'expo-status-bar';
import Header from "@c/screens/browse/header";
import MyPreview from "@c/my-preview";
import MyBlueButton from "@c/my-blue-button";
import myConsole from "@c/my-console-log";
import Animated, { FlipInYLeft, ReduceMotion } from "react-native-reanimated";
import { useUserPreferences } from "@x/user-preferences";
import elevations from '@u/elevation';

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
  const { heroEntry } = useLocalSearchParams<{ heroEntry: string; }>();
  const [files, setFiles] = useState<MyPathDataType[]>([]);
  // const [showPathPlay, setShowPathPlay] = useState(true);
  const [noSketch, setNoSketch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { defaultStorageDirectory } = useUserPreferences();


    const flip = FlipInYLeft
    .reduceMotion(ReduceMotion.Never)
    .withInitialValues({
      transform: [{ perspective: 0 }, { rotateY: '-270deg' }, { translateX: 0}],
    });

  const enteringAnimation = heroEntry === 'yes' ? flip : undefined;
  const exitingAnimation = undefined

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

  const fetchFiles = useCallback(async (allowCache = true) => {
    try {
      myConsole.log('fetching files from default storage', defaultStorageDirectory)
      setIsLoading(true);
      let myPathData = await getFiles(defaultStorageDirectory, allowCache);
      // Sort the data here before setting it to the state
      myPathData = myPathData.sort((a, b) => Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt));
      setFiles(myPathData);
      if (myPathData.length === 0) {
        setNoSketch(true);
      }
    } catch (error) {
      myConsole.log('error fetching files', error)
    }
  }, [defaultStorageDirectory]);

  // useLayoutEffect(() => {
  //   fetchFiles();
  // }, [fetchFiles]);

  // refresh all files if default storage directory changed
  useEffect(() => {
    myConsole.log('again fetching files..', defaultStorageDirectory)
    fetchFiles(true).then(() => setIsLoading(false));
  }, [defaultStorageDirectory])

  const deleteSketchAlert = (guid: string) => {
    // myConsole.log('confirm delete ' + guid);
    Alert.alert("Delete Sketch", "Are you sure you want to delete this sketch permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {

          // myConsole.log('delete', guid)
          const result = await deleteFile(defaultStorageDirectory, guid)
          if (result) {
            await fetchFiles();
            scrollViewRef.current?.forceUpdate();
          }
        },
      },
    ]);
  }

  const renderItem: ListRenderItem<MyPathDataType> = useCallback(({ item }: { item: MyPathDataType }) => {
    return (
      <TouchableOpacity
        onPress={() => router.navigate(`/file?guid=${item.metaData.guid}`)}
        onLongPress={() => deleteSketchAlert(item.metaData.guid)}
        activeOpacity={0.45}
      >
        <View
          style={{
            width: FILE_PREVIEW_WIDTH+ 2,
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
              alignContent: 'center',
              alignItems: 'center',
              // padding: 2,
              overflow: 'hidden',
              borderRadius: 7,
              borderWidth: 1.4,
              backgroundColor: `rgba(150,150,250, 0.25)`,
            }}
          >

            <MyPreview animate={false} data={item} />

          </View>
          <View style={{ alignItems: 'center'}}>
            {item.metaData.name.split(' ').slice(0, 2).map((line, i) => (
              <Text key={i} style={{ top: 4, flexWrap: 'wrap', justifyContent: 'center' }}>{line}</Text>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    )
  }, []);



  const renderHeader = useCallback(() => (
    <View pointerEvents="box-none" style={{ height: scrollHeight }}>
      <Header scrollValue={scrollValue}/>
    </View>
  ), [scrollValue]);

  return (
    <>
      <StatusBar hidden={false} style={"light"} backgroundColor='transparent' translucent={true} />
      <Animated.View style={StyleSheet.absoluteFill} entering={enteringAnimation} exiting={exitingAnimation}>
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
            style={{ paddingTop: 25 }}
            onScroll={onScroll}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollEndDrag={onScrollEndDrag}
            renderHeader={renderHeader}

            // initialNumToRender={6}
            // maxToRenderPerBatch={20}
            keyExtractor={item => numberOfColumns + item.metaData.guid}
            numColumns={numberOfColumns}
            data={files}
            initialNumToRender={3}
            maxToRenderPerBatch={10}
            windowSize={10}
            renderItem={renderItem}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            // onLayout={() => setIsLoading(false)}
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
                color={MY_BLACK} />
            </View>
          )}
        </View>
        <MyBlueButton
          icon={{ desc: '', name: 'new', size: 60, left: 0, top: 0 }}
          onPress={() => router.push('/file')}
          bottom={insets.bottom + 16}
          aligned="right" />
      </Animated.View>
    </>
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
