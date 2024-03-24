import Svg from "react-native-svg";
import React from "react";
import MyPath from "./my-path";
import { CANVAS_VIEWBOX, PathDataType, MyPathDataType } from "@u/types";
import SvgAnimate from "./screens/file/preview/animate";
import MyPathImage from "./my-path-image";

const MyPreview =
  ({ data, animate, viewBox = CANVAS_VIEWBOX }:
    { data: MyPathDataType, animate: boolean | undefined, viewBox?: string }) => (
    animate
      ? <SvgAnimate myPathData={data} viewBox={viewBox} />
      : <Svg width="100%" height="100%" viewBox={viewBox}>

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

export default MyPreview;