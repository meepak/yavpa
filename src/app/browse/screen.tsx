import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import { SvgDataType, getFiles, getGreeting } from "@/utilities/helper";
import Svg, { Path } from "react-native-svg";


const BrowseScreen = ({ onFileSelected, closeMe }) => {
  const insets = useSafeAreaInsets();
  const apporxHeaderAndFooterHeight = 140;
  const windowWidth = Dimensions.get("window").width - insets.left - insets.right;
  const windowHeight = Dimensions.get("window").height - insets.top - insets.bottom - apporxHeaderAndFooterHeight;
  const filePreviewHeight = 150;
  const filePreviewWIdth = (windowWidth / windowHeight) * 200;

  const numberOfColumns = Math.round(windowWidth / filePreviewWIdth)
  const gap = (windowWidth - numberOfColumns * filePreviewWIdth) / (numberOfColumns + 1)

  const [files, setFiles] = useState<SvgDataType[]>([]);
  useEffect(() => {
    const fetchFiles = async () => {
      const svgData = await getFiles();
      setFiles(svgData);
    };

    fetchFiles();
  }, []);

  const renderItem = ({ item }: { item: SvgDataType }) => {
    const label = item.metaData.updated_at.split('.')[0].split('T')
    // TODO if allowed to add name, use name?
    return (
    <TouchableOpacity
      onPress={() => {
        onFileSelected(item);
        closeMe();
      }}
    >
      <View
        style={{
          width: filePreviewWIdth,
          height: filePreviewHeight,
          borderWidth: 1,
          borderRadius: 5,
          marginHorizontal: gap/2,
          marginBottom: gap* 5,
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Svg width="100%" height="100%" viewBox={item.metaData.viewBox}>
          {item.pathData.map((path, index) => (
            <Path
              key={index}
              d={path.path}
              stroke={path.stroke}
              strokeWidth={path.strokeWidth}
              fill={'none'} />
          ))}
        </Svg>
        {/* <View style={{alignContent: 'center'}}> */}
        <Text>{label[0]}</Text>
        <Text>{label[1]}</Text>
        {/* </View> */}
      </View>
    </TouchableOpacity>
  )};

  /*
  TODO -- LAYOUT ADJUSTMENT
  TEST WITH NO FILES,DISPLAY WELCOME MESSAGE, INTR, ETC..
  */
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            alignSelf: "stretch",
            height: '25%',
          }}
        >
        {/* <Header /> */}
        </View>
        <FlatList
          data={files}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={numberOfColumns}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1, marginHorizontal: gap/2 }}
        />
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={closeMe}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    </GestureHandlerRootView>
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
