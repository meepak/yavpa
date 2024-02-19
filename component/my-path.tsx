
import React from "react";
import { Brushes, getBrush } from "@u/brushes";
import { Path } from "react-native-svg";
import { BrushType, PathDataType } from "@u/types";
import { isValidPath } from "@u/helper";

class MyPath extends React.PureComponent<{prop: PathDataType, keyProp: string}> {
    render() {
      if(!isValidPath(this.props.prop.path)) {
        console.log("MyPath was given invalid path data - ", this.props.prop.path, " -", this.props.prop.guid);
        return null;
      }

      let brush: BrushType | undefined;
      if (this.props.prop.stroke.startsWith("url(#")) {
        const brushGuid = this.props.prop.stroke.slice(5, -1);
        brush = Brushes.find(brush => brush.params.guid === brushGuid);
      }
      return (
        <>
          {brush && getBrush(brush)}
          <Path
            key={this.props.keyProp}
            d={this.props.prop.path}
            stroke={this.props.prop.stroke}
            strokeWidth={this.props.prop.strokeWidth}
            strokeLinecap={this.props.prop.strokeCap}
            strokeLinejoin={this.props.prop.strokeJoin}
            opacity={this.props.prop.strokeOpacity}
            fill= {this.props.prop.fill ?? "none"} 
            strokeDasharray={this.props.prop.strokeDasharray ?? undefined}
            strokeDashoffset={this.props.prop.strokeDashoffset ?? undefined}
          />
        </>
      )
    }
  }

  export default MyPath