import React, { useContext, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system";
import LottieView, { AnimationObject } from "lottie-react-native";
import {
  getCssSvg,
  getLottieTrimmedPath,
  // getRnComponent,
  getSmilSvg,
  getStaticSvg,
} from "@u/formatters";
import { SvgDataContext } from "@x/svg-data";
import MyPreview from "@c/my-preview";
import SvgAnimate from "../preview/animate";
import { getViewBoxTrimmed } from "@u/helper";
import { CANVAS_HEIGHT, CANVAS_WIDTH, SvgDataType } from "@u/types";
import formatLottieData from "@u/lottie";

const ExportScreen = ({ initControls }) => {
  const { svgData } = useContext(SvgDataContext);
 const [animate, setAnimate] = useState(false);


  const [exportSource, setExportSource] = useState("");
  const [fileName, setFileName] = useState("untitled.svg");
  const [lottie, setLottie] = useState({});
  const [svgDataVbTrimmed, setSvgDataVbTrimmed] = useState<SvgDataType>();

  const [lottieJson, setLottieJson] = useState({} as AnimationObject);

  useEffect(() => {
    if (svgData === undefined) return;
    svgData.metaData.viewBox = getViewBoxTrimmed(svgData.pathData);
  }, [svgData]);


  //TODO set filelname with exportsource
  const buttons = [
    // {
    //   key: "Static SVG",
    //   name: "Static SVG",
    //   onPress: () => setExportSource(() => getStaticSvg(svgData)),
    // },
    // {
    //   key: "SMIL SVG",
    //   name: "SMIL SVG",
    //   onPress: () => setExportSource(() => getSmilSvg(svgData)),
    // },
    // {
    //   key: "CSS3 SVG",
    //   name: "CSS3 SVG",
    //   onPress: () => setExportSource(() => getCssSvg(svgData)),
    // },
    // // {
    // //   name: "React Native",
    // //   onPress: () => setExportSource(() => getRnComponent(svgData)),
    // // },
    // {
    //   key: "Lottie",
    //   name: "Lottie",
    //   onPress: () => {
    //     console.log('lottie selected');
    //     console.log(JSON.stringify(svgData, null, 2));
    //     let lt = getLottieTrimmedPath(svgData);
    //     setLottie(lt);
    //     let ltStr = JSON.stringify(lt);
    //     console.log(ltStr);
    //     Clipboard.setStringAsync(ltStr);

    //   },
    // },
    // {
    //   key: "copy",
    //   icon: "copy",
    //   onPress: () => copyToClipboard(),
    // },
    // {
    //   key: "download",
    //   icon: "download",
    //   onPress: () => download(),
    // },
  ];

  const copySvgToClipboard = () => {
    console.log(svgData);
    Clipboard.setStringAsync(getStaticSvg(svgData));
  }
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

  {/* <LottieView style={{ flex: 1 }} resizeMode="contain" source={JSON.stringify(lottie)} autoPlay loop />
      <LottieView style={{ flex: 1 }} resizeMode="contain" source={require('@a/test.json')} autoPlay loop /> */}
  {/* <TextInput editable={false} multiline>{exportSource}</TextInput> */ }

  useEffect(() => {
    setTimeout(() => {setAnimate(true)}, 2000);
  }, []);

  useEffect(() => {
    const lj = formatLottieData(svgData);
    console.log(lj)
    setLottieJson(JSON.parse(lj));
  }, [svgData]);

  return (
    <ScrollView style={styles.container} onLayout={() => initControls(buttons)}>
      <Text style={styles.title}>Export your paths!</Text>
      <View style={styles.preview}>
        <MyPreview data={svgData} animate={animate} />
      </View>
      <View style={styles.section}>
        <Text>Static SVG</Text>
        <Button title="Download" onPress={download} />
        <Button title="Copy to Clipboard" onPress={copySvgToClipboard} />
      </View>
      <View style={styles.section}>
        <Text>SMIL SVG</Text>
        <Button title="Download" onPress={download} />
        <Button title="Copy to Clipboard" onPress={copyToClipboard} />
      </View>
      <View style={styles.section}>
        <Text>SVG + CSS</Text>
        <Button title="Download" onPress={download} />
        <Button title="Copy to Clipboard" onPress={copyToClipboard} />
      </View>
      <View style={{...styles.section, width: CANVAS_WIDTH, height: CANVAS_HEIGHT,  borderWidth: 1, borderColor: 'red'}}>
        <LottieView style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, }} resizeMode="cover" source={lottieJson} autoPlay={false} loop={false} />
      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  preview: {
    width: 130,
    height: 150,
    alignSelf: 'flex-end',
  },
  section: {
    marginBottom: 20,
  },
});

export default ExportScreen;
