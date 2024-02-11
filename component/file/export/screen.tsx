import React, { useContext, useState } from "react";
import { ScrollView, TextInput } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import {
  getCssSvg,
  getLottieSvg,
  getRnComponent,
  getSmilSvg,
  getStaticSvg,
} from "@u/formatters";
import { SvgDataContext } from "@x/svg-data";

const ExportScreen = ({ initControls }) => {
  const { svgData } = useContext(SvgDataContext);
  const [exportSource, setExportSource] = useState("");
  const [fileName, setFileName] = useState("untitled.svg");
  //TODO set filelname with exportsource
  const buttons = [
    {
      key: "Static SVG",
      name: "Static SVG",
      onPress: () => setExportSource(() => getStaticSvg(svgData)),
    },
    {
      key: "SMIL SVG",
      name: "SMIL SVG",
      onPress: () => setExportSource(() => getSmilSvg(svgData)),
    },
    {
      key: "CSS3 SVG",
      name: "CSS3 SVG",
      onPress: () => setExportSource(() => getCssSvg(svgData)),
    },
    {
      name: "React Native",
      onPress: () => setExportSource(() => getRnComponent(svgData)),
    },
    {
      key: "Lottie",
      name: "Lottie",
      onPress: () =>
        setExportSource(() => getLottieSvg(svgData)),
    },
    {
      key: "copy",
      icon: "copy",
      onPress: () => copyToClipboard(),
    },
    {
      key: "download",
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
