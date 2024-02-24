import Svg from "react-native-svg";
import ErrorBoundary from "./error-boundary";
import React from "react";
import MyPath from "./my-path";
import { DEFAULT_VIEWBOX, PathDataType, SvgDataType } from "@u/types";
import SvgAnimate from "./screens/file/preview/animate";

const MyPreview = 
({ data, animate, viewBox = DEFAULT_VIEWBOX }: 
  { data: SvgDataType, animate: boolean|undefined, viewBox?: string }) => (
  <ErrorBoundary>
    {animate
    ? <SvgAnimate svgData={data} viewBox={viewBox}/>
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
    </Svg>}
  </ErrorBoundary>
)

export default MyPreview;