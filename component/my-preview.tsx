import Svg from "react-native-svg";
import ErrorBoundary from "./error-boundary";
import React from "react";
import MyPath from "./my-path";
import { PathDataType, SvgDataType } from "@u/types";
import SvgAnimate from "./file/preview/animate";

const MyPreview = ({ data, animate }: { data: SvgDataType, animate: boolean|undefined }) => (
  <ErrorBoundary>
    {animate
    ? <SvgAnimate svgData={data} />
    : <Svg width="100%" height="100%" viewBox={data.metaData.viewBox}>
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