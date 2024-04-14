
import React, { useState } from "react";
import { Brushes, getBrush } from "@c/my-brushes";
import { Circle, Path } from "react-native-svg";
import { BrushType, PathDataType } from "@u/types";
import { getPathFromPoints, getPointsFromPath, isValidPath } from "@u/helper";
import myConsole from "./my-console-log";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import simplify from "simplify-js";


const PathMarker = ({ initialPosition, onMove }) => {
  const [position, setPosition] = useState(initialPosition);

  const startPoint = { x: 0, y: 0 };
  const panMarker = Gesture.Pan();
  panMarker.onBegin((event) => {
    startPoint.x = event.x;
    startPoint.y = event.y;
  });
  panMarker.onUpdate((event) => {
    setPosition({
      x: initialPosition.x + event.x - startPoint.x,
      y: initialPosition.y + event.y - startPoint.y
    });
    startPoint.x = event.x;
    startPoint.y = event.y;
    onMove(position);
  });
  panMarker.onEnd(() => {
    startPoint.x = 0;
    startPoint.y = 0;

  });

  return (
    // <View {...panResponder.panHandlers} style={{ position: 'absolute', left: position.x, top: position.y }}>
    // <Svg height="20" width="20">
    <GestureDetector gesture={panMarker}>
      <Circle cx={position.x} cy={position.y} r="10" fill="blue" />
    </GestureDetector>
    // </Svg>
    // </View>
  );
};

class MyPath extends React.PureComponent<{ prop: PathDataType, keyProp: string, edit?: boolean }> {
  static defaultProps = {
    edit: false,
  };

  constructor(props: { prop: PathDataType, keyProp: string, edit?: boolean }) {
    super(props);
    this.state = {
      simplifiedPointsToEdit: [],
      simplifiedPathToEdit: String,
    };
  }

  componentDidMount(): void {

    if (this.props.edit) {
      // simplify the path to have less points, very less points
      const points = getPointsFromPath(this.props.prop.path);
      const simplifiedPoints = simplify(points, 0.4);
      this.setState({
        simplifiedPointsToEdit: simplifiedPoints,
        simplifiedPathToEdit: getPathFromPoints(simplifiedPoints)
      });
    }
  }


  render() {
    // below region is for regular paths
    if (this.props.prop.type !== 'd') {
      return null;
    }

    if (!isValidPath(this.props.prop.path)) {
      myConsole.log("MyPath was given invalid path data - ", this.props.prop.path, " -", this.props.prop.guid);
      return null;
    }

    let brush: BrushType | undefined;
    if (this.props.prop.stroke.startsWith("url(#")) {
      const brushGuid = this.props.prop.stroke.slice(5, -1);
      brush = Brushes.find(brush => brush.params.guid === brushGuid);
    }

    return (
      <React.Fragment key={`${this.props.keyProp}-${this.props.prop.updatedAt}`}>
        {brush && getBrush(brush)}
        <Path
          key={this.props.prop.guid}
          d={this.props.prop.path}
          stroke={this.props.prop.stroke}
          strokeWidth={this.props.prop.strokeWidth}
          strokeLinecap={this.props.prop.strokeCap}
          strokeLinejoin={this.props.prop.strokeJoin}
          opacity={this.props.prop.strokeOpacity}
          fill={this.props.prop.fill ?? "none"}
          strokeDasharray={this.props.prop.strokeDasharray ?? undefined}
          strokeDashoffset={this.props.prop.strokeDashoffset ?? undefined}
        />
        {
          this.props.edit && (
            (this.state as { simplifiedPointsToEdit: any[] }).simplifiedPointsToEdit.map((point, index) => (
              <PathMarker
                key={`${this.props.prop.guid}-${index}`}
                initialPosition={point}
                onMove={(position: any) => {
                  myConsole.log("position", position);
                }}
              />
            ))
          )
        }
      </React.Fragment>
    )
  }
}

export default MyPath
