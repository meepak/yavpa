import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ListRenderItem,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { SvgDataType, getGreeting } from "@u/helper";
import { getFiles } from "@u/storage";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
import Header from "@c/headers/browse";

const HEADER_MAX_HEIGHT = 200; // Maximum height of the header
const HEADER_MIN_HEIGHT = 60; // Minimum height of the header


const BrowseScreen = () => {
  const insets = useSafeAreaInsets();
  const apporxHeaderAndFooterHeight = 140;
  const windowWidth = Dimensions.get("window").width - insets.left - insets.right;
  const windowHeight = Dimensions.get("window").height - insets.top - insets.bottom - apporxHeaderAndFooterHeight;
  const filePreviewHeight = 200;
  const thresholdGap = 10;
  const bottomFileMargin = 42;
  const filePreviewWidth = (windowWidth * filePreviewHeight / windowHeight);

  let numberOfColumns = Math.round(windowWidth / filePreviewWidth)
  let gap = (windowWidth - numberOfColumns * filePreviewWidth) / (numberOfColumns + 1)

  while(gap < thresholdGap) {
    numberOfColumns -= 1;
    gap = (windowWidth - numberOfColumns * filePreviewWidth) / (numberOfColumns + 1)
  }

  const [files, setFiles] = useState<SvgDataType[]>([]);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, (HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT)],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  
  useEffect(() => {
    const fetchFiles = async () => {
      const svgData = await getFiles();
      setFiles(svgData);
    };

    fetchFiles();
  }, []);

  const renderItem: ListRenderItem<SvgDataType> = ({ item }: { item: SvgDataType }) => {
    // TODO if allowed to add name, use name?
    return (
      <Link href={`/svg/draw/?guid=${item.metaData.guid}`} asChild>
        <TouchableOpacity>
          <View
            style={{
              width: filePreviewWidth,
              height: filePreviewHeight,
              borderWidth: 2,
              borderRadius: 5,
              marginHorizontal: gap/2,
              marginVertical: bottomFileMargin/2,
              alignContent: 'center',
              alignItems: 'center',
            }}
          >
            <Svg width="100%" height="100%" viewBox={item.metaData.viewBox}>
              {item.pathData.map((path, index) => (
                path.visible
                ? <Path
                  key={index}
                  d={path.path}
                  stroke={path.stroke}
                  strokeWidth={path.strokeWidth}
                  fill={'none'} />
                : null
              ))}
            </Svg>
            <Text style={{top: 4, flexWrap: 'wrap'}}>{item.metaData.name}</Text>
          </View>
        </TouchableOpacity>
      </Link>
    )
  };


  return (
    <>
        <Animated.View
          style={{
            height: headerHeight,
            borderWidth: 1,
            borderColor: 'red',
          }}
        >
          {/* TODO show Logo */}
          <Text
            style={{
              color: "black",
              fontSize: 30,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {getGreeting()}!
          </Text>

          <Text>Total Files = {files.length}</Text>

          {/* <Header totalSavedFiles={files.length} /> */}
        </Animated.View>
        <Animated.FlatList
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          data={files}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numberOfColumns}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: gap / 2}}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )} />
        <Link href="/svg/draw" asChild>
          <TouchableOpacity
            style={styles.floatingButton}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
     </>
  );
};

const styles = StyleSheet.create({
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
    elevation: 8,
  },
});

export default BrowseScreen;
