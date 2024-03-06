
import React from "react";
import { Brushes, getBrush } from "@c/my-brushes";
import { Path, Text, TextPath } from "react-native-svg";
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
        <React.Fragment key={`${this.props.keyProp}-${this.props.prop.guid}`}>
          {brush && getBrush(brush)}
          <Path
            id={this.props.prop.guid}
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
          {
            this.props.prop.text && (
              <Text 
                fill={this.props.prop.text.color || this.props.prop.stroke || "#000000"} 
                fontSize={this.props.prop.text.fontSize || 12} 
                fontWeight={this.props.prop.text.fontWeight || "normal"} 
                dy={this.props.prop.text.above || -1 * (this.props.prop.strokeWidth/2)-4 || 0}
                >
                <TextPath 
                  href={`#${this.props.prop.guid}`} 
                  startOffset={this.props.prop.text.startOffset || '50%'}
                >
                  {this.props.prop.text.value}
                  </TextPath>
              </Text>
            )
          }
        </React.Fragment>
      )
    }
  }

  export default MyPath