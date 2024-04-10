import React, { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import SvgAnimate from "./animate";
import createPreviewControls from "./control";
import { AnimationParamsType, SvgAnimateHandle } from "@u/types";
import myConsole from "@c/my-console-log";

const PreviewScreen = ({ myPathData, setMyPathData, initControls }) => {

  // const { myPathData, setMyPathData } = useContext(MyPathDataContext);
  myConsole.log('myPathData animation params', myPathData.metaData.animation)
  const [animationParams, setAnimationParams] = useState<AnimationParamsType>({
    speed: myPathData.metaData.animation?.speed || 1,
    loop: myPathData.metaData.animation?.loop || true,
    delay: myPathData.metaData.animation?.delay || 0,
    transition: myPathData.metaData.animation?.transition || 0,
    transitionType: myPathData.metaData.animation?.transitionType || 0,
    correction: myPathData.metaData.animation?.correction || 0.05,
  });




  const previewRef = useRef<SvgAnimateHandle | null>(null);


  useEffect(() => {
    // setTimeout( // it will play automatically
    //   onPreviewPlay, 500
    //   );

    // on leaving clear the controls
    return () => initControls([]);
  }, []);

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.saveAnimationParams(animationParams);
    }
    if (myPathData.metaData.animation && (JSON.stringify(myPathData.metaData.animation) !== JSON.stringify(animationParams))) {
      myConsole.log('animation params updated, should trigger saving to file');
      setMyPathData((prev) => ({ ...prev, metaData: { ...prev.metaData, animation: animationParams, updatedAt: "" } }));
    }

    initControls(buttons)
  }, [animationParams]);


  const onPreviewPlay = () => {
    if (previewRef.current) {
      previewRef.current.playAnimation();
    }
  }
  const onPreviewStop = () => {
    if (previewRef.current) {
      previewRef.current.stopAnimation();
    }
  }

  // In your component:
  const buttons = createPreviewControls({
    onPreviewPlay,
    onPreviewStop,
    animationParams,
    setAnimationParams,
  });



  return (
    <View style={{ flex: 1 }} onLayout={() => initControls(buttons)}>
      <SvgAnimate ref={previewRef} myPathData={myPathData} />
    </View>
  );
};

export default PreviewScreen;
