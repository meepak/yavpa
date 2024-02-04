import React, { useContext, useState } from "react";
import { Text, TouchableOpacity, View, ScrollView, TextInput } from "react-native";
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
import { SvgDataContext } from "./context";

const ExportScreen = ({ initControls }) => {
  const { svgData } = useContext(SvgDataContext);
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
      icon: "content-copy",
      onPress: () => copyToClipboard(),
    },
    {
      icon: "download",
      onPress: () => download(),
    },
  ];

  const copyToClipboard = () => {
    console.log(exportSource)
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
    <ScrollView style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
        <TextInput multiline>{exportSource}</TextInput>
    </ScrollView>

  );
};

export default ExportScreen;
