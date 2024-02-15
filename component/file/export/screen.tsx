import React, { useContext, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import LottieView, { AnimationObject } from "lottie-react-native";
import {
  getCssSvg,
  getLottieSvg,
  getRnComponent,
  getSmilSvg,
  getStaticSvg,
} from "@u/formatters";
import { SvgDataContext } from "@x/svg-data";
import { text } from "d3";

const ExportScreen = ({ initControls }) => {
  const { svgData } = useContext(SvgDataContext);
  const [exportSource, setExportSource] = useState("");
  const [fileName, setFileName] = useState("untitled.svg");

  const [lottie, setLottie] = useState({});



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
    // {
    //   name: "React Native",
    //   onPress: () => setExportSource(() => getRnComponent(svgData)),
    // },
    {
      key: "Lottie",
      name: "Lottie",
      onPress: () => {
        console.log('lottie selected');
        let lt = getLottieSvg(svgData);
        setLottie(lt);
        console.log('lottie object', lt);
        let ltStr = JSON.stringify(lt);
        console.log(ltStr);
        Clipboard.setStringAsync(ltStr);
        
      },
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
    <View style={{ ...StyleSheet.absoluteFillObject }} onLayout={() => initControls(buttons)}>
      {/* <LottieView style={{ flex: 1 }} resizeMode="contain" source={JSON.stringify(exportSource)} autoPlay loop /> */}
      <LottieView style={{ flex: 1 }} resizeMode="contain" source={require('@a/hl.json')} autoPlay loop />
      {/* <TextInput editable={false} multiline>{exportSource}</TextInput> */}
    </View>

  );
};

export default ExportScreen;
