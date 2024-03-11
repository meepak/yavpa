import Svg from "react-native-svg";
import React from "react";
import MyPath from "./my-path";
import { CANVAS_VIEWBOX, PathDataType, SvgDataType } from "@u/types";
import SvgAnimate from "./screens/file/preview/animate";

const MyPreview =
  ({ data, animate, viewBox = CANVAS_VIEWBOX }:
    { data: SvgDataType, animate: boolean | undefined, viewBox?: string }) => (
    animate
      ? <SvgAnimate svgData={data} viewBox={viewBox} />
      : <Svg width="100%" height="100%" viewBox={viewBox}>
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

export default MyPreview;