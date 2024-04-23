import MyPath from "@c/controls/pure/my-path";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import React, { useContext, useRef } from "react";
import { View } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { useEffect, useState } from "react";
import { getViewBoxTrimmed } from "@u/helper";

const Window = ({ width, height }) => {
  const { myPathData } = useContext(MyPathDataContext);
  const [render, setRender] = useState(0);
  const H = CANVAS_HEIGHT / 5;
  const W = (height * CANVAS_WIDTH) / CANVAS_HEIGHT;
  const Tx = myPathData.metaData.canvasTranslateX;
  const Ty = myPathData.metaData.canvasTranslateY;
  const S = myPathData.metaData.canvasScale;
  const viewBox = useRef(`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`); // [x, y, width, height]
  const ww = useRef(W);
  const hh = useRef(H);
  const pathDataRef = useRef([]);
  const rectX = useRef(0);
  const rectY = useRef(0);
  const rectWidth = useRef(W);
  const rectHeight = useRef(H);

  useEffect(() => {
    if (pathDataRef.current !== myPathData.pathData) {
      const vc = getViewBoxTrimmed(myPathData.pathData, 10);
      const wh = vc.split(" ");
      ww.current = parseFloat(wh[2]);
      hh.current = parseFloat(wh[3]);
      viewBox.current =
        (parseFloat(wh[0]) +
        Tx) / S+
        " " +
        (parseFloat(wh[1]) + Ty)/ S +
        " " +
        ww.current * S +
        " " +
        hh.current * S;

      const viewBoxX = parseFloat(wh[0]);
      const viewBoxY = parseFloat(wh[1]);

      rectX.current = (Tx / ww.current) * CANVAS_WIDTH;
      rectY.current = (Ty / hh.current) * CANVAS_HEIGHT;
      rectWidth.current = (CANVAS_WIDTH / S / ww.current) * CANVAS_WIDTH;
      rectHeight.current = (CANVAS_HEIGHT / S / hh.current) * CANVAS_HEIGHT;
    }
    pathDataRef.current = myPathData.pathData as any;
    setRender((prev) => prev + 1);
  }, [myPathData.updatedAt, myPathData.pathData, myPathData.metaData.canvasTranslateX, myPathData.metaData.canvasTranslateY, myPathData.metaData.canvasScale]);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#ffff00",
        width: W,
        height:  (ww.current / hh.current) * W,
      }}
    >
      <Svg
        width={"100%"}
        height={"100%"}
        viewBox={viewBox.current} // Use the original dimensions of the SVG
      >
        <G>
          {myPathData.pathData.map((item, _index) =>
            item.visible ? (
              <MyPath
                prop={item}
                keyProp={"completed-" + render}
                key={item.guid}
              />
            ) : null,
          )}
        </G>
        <Rect
          x={rectX.current}
          y={rectY.current}
          width={rectWidth.current}
          height={rectHeight.current}
          fill={"#FF000033"}
          stroke={"#FF0000"}
          strokeWidth={4}
        />
      </Svg>
    </View>
  );
};

export default Window;
