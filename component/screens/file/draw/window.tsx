import MyPath from "@c/controls/pure/my-path";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@u/types";
import { MyPathDataContext } from "@x/svg-data";
import React, { useContext } from "react";
import { View } from "react-native";
import Svg from "react-native-svg";
import {useEffect, useState} from 'react';

const Window = ({width, height}) => {
  const { myPathData } = useContext(MyPathDataContext);
  const [ render, setRender] = useState(0);

  useEffect(() => {
    // console.log("In window myPathData", myPathData.pathData[0]);
    setRender((prev) => prev + 1);
  }, [myPathData]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffff0055",
        width: width,
        height: height,
      }}
    >
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        >
        {myPathData.pathData.map((item, _index) =>
          item.visible ? (
            <MyPath
              prop={item}
              keyProp={"completed-" + render}
              key={item.guid}
            />
          ) : null,
        )}
      </Svg>
    </View>
  );
};

export default Window;