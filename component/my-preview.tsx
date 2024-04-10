import Svg from "react-native-svg";
import React, { useEffect, useRef } from "react";
import MyPath from "./my-path";
import { CANVAS_VIEWBOX, PathDataType, MyPathDataType } from "@u/types";
import SvgAnimate from "./screens/file/preview/animate";
import MyPathImage from "./my-path-image";

const MyPreview =
  ({ data, animate, viewBox, onInit }:
    {
      data: MyPathDataType,
      animate: boolean | undefined,
      viewBox?: string,
      onInit?: (playTime: number) => void

    }) => {
    const playTime = useRef<number>(0);

    useEffect(() => {
      if (onInit) {
        playTime.current = data.pathData.reduce((acc, path) => acc + path.time, 0);
        playTime.current += data.metaData.animation?.delay || 0;
        playTime.current += data.metaData.animation?.transition || 0;
        onInit(playTime.current);
      }
    }, [])

    return (
      animate
        ? <SvgAnimate
          myPathData={data}
          viewBox={viewBox || data.metaData.viewBox}
        />
        : <Svg width="100%" height="100%" viewBox={viewBox || data.metaData.viewBox}>

          {data.imageData?.map((item) => (
            item.visible
              ? <MyPathImage prop={item} keyProp={"completed-" + item.guid} key={item.guid} />
              : null
          ))}

          {data.pathData.map((path: PathDataType, index: number) => {
            if (!path.visible) {
              return null;
            }
            return (
              <React.Fragment key={index}>
                <MyPath
                  prop={path}
                  keyProp={"preview"}
                />
              </React.Fragment>
            )
          })}
        </Svg>
    )
  }

export default MyPreview;