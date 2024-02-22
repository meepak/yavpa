import React, { useContext, useEffect, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import * as Clipboard from "expo-clipboard";
import LottieView, { AnimationObject } from "lottie-react-native";
import { SvgDataContext } from "@x/svg-data";
import MyPreview from "@c/my-preview";
import { getViewBoxTrimmed } from "@u/helper";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@u/types";
import * as format from "@u/formatters";
import createLottie from "@u/lottie";

const ExportScreen = ({ initControls }) => {
  const { svgData } = useContext(SvgDataContext);
  const [animate, setAnimate] = useState(false);

  const [lottieJson, setLottieJson] = useState({} as AnimationObject);
  const [staticSvg, setStaticSvg] = useState("");
  const [smilSvg, setSmilSvg] = useState("");
  const [cssSvg, setCssSvg] = useState("");

  useEffect(() => {
    if (svgData === undefined) return;
    const lottieData = createLottie(svgData);
    setLottieJson(JSON.parse(lottieData));

    svgData.metaData.viewBox = getViewBoxTrimmed(svgData.pathData);
    setStaticSvg(format.getStaticSvg(svgData));
    setSmilSvg(format.getSmilSvg(svgData));
    setCssSvg(format.getCssSvg(svgData));
  }, [svgData]);


  const copyToClipboard = (data = "") => {
    Clipboard.setStringAsync(data);
  };


  // should open the prompt for user to select the location to save the  file with 
  // default filename (user can change it if they like, but extension remains fixed)
  // and data in it in both ios and android
  // ask for permission if needed
  const download = async (filename = "", data = "") => {
    console.log(data)
    if (!filename || !data) return;
    const uri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
    const cUri = await FileSystem.getContentUriAsync(uri);
    if (!(await Sharing.isAvailableAsync())) {
      alert(`Uh oh, sharing isn't available on your platform`);
      return;
    }
    await Sharing.shareAsync(cUri);
  };

  useEffect(() => {
    setTimeout(() => { setAnimate(true) }, 2000);
  }, []);

  const exportOptions = [
    {
      name: "Static SVG",
      description: "Ideal for simple, scalable graphics. Lightweight and versatile.",
      downloadAction: () => download(svgData.metaData.name + ".svg", staticSvg),
      copyAction: () => copyToClipboard(staticSvg),
    },
    {
      name: "SMIL SVG",
      description: "Enhances SVGs with simple animations using SMIL. Adds a dynamic touch.",
      downloadAction: () => download(svgData.metaData.name + ".smil.svg", smilSvg),
      copyAction: () => copyToClipboard(smilSvg),
    },
    {
      name: "CSS SVG",
      description: "Uses CSS for styling and animating SVG elements. Perfect for web development integration.",
      downloadAction: () => download(svgData.metaData.name + ".css.svg", cssSvg),
      copyAction: () => copyToClipboard(cssSvg),
    },
    {
      name: "Lottie",
      description: "[Experimental Preview] A JSON-based format for complex animations across any platform.",
      downloadAction: () => download(svgData.metaData.name + ".json", JSON.stringify(lottieJson)),
      copyAction: () => copyToClipboard(JSON.stringify(lottieJson)),
    }
  ];


  return (
    <ScrollView style={styles.container} onLayout={() => initControls([])}>

      <View style={{ margin: 10 }}>
        <View style={{ width: CANVAS_WIDTH, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
          <View style={{ width: CANVAS_WIDTH - 130, alignSelf: 'flex-start' }}>
            <Text style={{ marginBottom: 10, fontSize: 18, fontWeight: 'bold' }}>Export Your Paths!</Text>
            <Text style={{ marginBottom: 5 }}>Disclaimer: "My Path" is in developmental preview.</Text>
            <Text style={{ marginBottom: 20 }}>There are still lots of rough edges. Thank you for your understanding.</Text>
          </View>
          <View style={{ width: 130, height: 150, marginRight: 5, alignSelf: 'flex-start' }}>
            <MyPreview data={svgData} animate={animate} />
          </View>
        </View>

        {exportOptions.map((option, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: '900' }}>{option.name}</Text>
            <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: '300' }}>{option.description}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={option.downloadAction}>
                <Text style={{ color: 'blue', marginBottom: 5 }}>Download file</Text>
              </TouchableOpacity>
              <View style={{ width: 1, height: 21, borderWidth: 1, borderColor: 'rgba(0,0,0,0.5)', marginHorizontal: 5 }} />
              <TouchableOpacity onPress={option.copyAction}>
                <Text style={{ color: 'blue' }}>Copy to clipboard</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ position: 'absolute', width: 130, height: 150, right: -10, bottom: 40, borderWidth: 1, borderColor: 'rgba(0,0,0, 0.2)' }}>
          <LottieView style={{ flex: 1 }} resizeMode="contain" source={lottieJson} autoPlay={true} loop={true} />
        </View>

        <Text style={{ marginTop: 20, fontStyle: 'italic', marginBottom: 100 }}>Happy exporting!</Text>
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
