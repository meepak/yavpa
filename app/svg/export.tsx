import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import {
  getCssSvg,
  getLottieSvg,
  getRnComponent,
  getSmilSvg,
  getStaticSvg,
} from "@u/formatters";
import {
  GestureHandlerRootView,
  ScrollView,
} from "react-native-gesture-handler";
import ControlPanel from "@c/controls/control-panel";

const ExportScreen = ({ svgData, closeMe }) => {
  const [exportSource, setExportSource] = useState("");
  const [fileName, setFileName] = useState("untitled.svg");
  //TODO set filelname with exportsource
  const buttons = [
    {
      name: "Static SVG",
      onPress: () => setExportSource(() => getStaticSvg(svgData)),
    },
    {
      name: "SMIL SVG",
      onPress: () => setExportSource(() => getSmilSvg(svgData)),
    },
    {
      name: "CSS3 SVG",
      onPress: () => setExportSource(() => getCssSvg(svgData)),
    },
    {
      name: "React Native",
      onPress: () => setExportSource(() => getRnComponent(svgData)),
    },
    {
      name: "Lottie",
      onPress: () =>
        setExportSource(() => getLottieSvg(svgData)),
    },
    {
      icon: "close",
      onPress: closeMe,
    },
  ];

  const copyToClipboard = () => {
    Clipboard.setStringAsync(exportSource);
  };

  const download = async () => {
    const fileName = "file.txt"; // replace with your file name
    const fileUri = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(fileUri, exportSource, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            alignSelf: "stretch",
            borderBottomWidth: 1,
            borderBottomColor: "black",
          }}
        >
          <Text
            style={{
              color: "black",
              fontSize: 30,
              marginBottom: 15,
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            <View style={{ alignSelf: "flex-end", flexDirection: 'row' }}>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  flexDirection: "row",
                }}
                onPress={copyToClipboard}
              >
                <MaterialIcons name={"content-copy"} size={32} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 42,
                  height: 42,
                  justifyContent: "center",
                  alignItems: "center",
                  flex: 1,
                  flexDirection: "row",
                }}
                onPress={download}
              >
                <MaterialIcons name={"download"} size={32} color="black" />
              </TouchableOpacity>
            </View>
            Export Screen!
          </Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <Text>{exportSource}</Text>
        </ScrollView>
        <View
          style={{
            alignSelf: "stretch",
            borderTopWidth: 1,
            borderTopColor: "black",
          }}
        >
          <ControlPanel buttons={buttons} />
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default ExportScreen;
