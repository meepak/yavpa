import React from "react";
import { Brushes, getBrush } from "@c/my-brushes";
import { BrushType, PathDataType } from "@u/types";
import { createPathdata, getViewBoxTrimmed, isValidPath } from "@u/helper";
import {
  Path,
  Text,
  TextPath,
  G,
  GProps,
} from "react-native-svg";
import { GestureResponderEvent } from "react-native-modal";
import { shapeData } from "@u/shapes";


interface MyPathProps {
  prop: PathDataType;
  keyProp: string;
  startResponder?: boolean;
  onPress?: (event: GestureResponderEvent, myPath: MyPath, bBoxData: PathDataType) => void; // Add an optional onPress prop
}

interface MyPathState {
  selected: boolean;
  transform: string;
}

class MyPath extends React.PureComponent<MyPathProps, MyPathState> {
  pathRef = React.createRef<G<GProps>>();

  getTranslate = (x: number, y: number) => `translate(${x}, ${y})`;

  constructor(props: MyPathProps) {
    super(props);

    this.handleMyPathPress = this.handleMyPathPress.bind(this);
    this.state = {
      selected: false,
      transform: this.getTranslate(0, 0),
    };
  }



  // touchStartX = 0;
  // touchStartY = 0;

  getBBox = (): SVGRect | undefined => {
    const bbox = this.pathRef.current?.getBBox();
    if (bbox) {
      return new DOMRect(bbox.x, bbox.y, bbox.width, bbox.height);
    }
    return undefined;
  };



  handleMyPathPress = (event: GestureResponderEvent) => {
    console.log("MyPath was pressed");
    // If an onPress prop was provided, call it with the event
    if (this.props.onPress) {

      const bBox = this.getBBox();
      // console.log('bBox', bBox || 'undefined');

      if (!bBox) {
        console.log('bBox is undefined, using fall back method to get bBox..');
      }

      // convert bBox to PathDataType
      const rectPath = bBox
        ? shapeData({
          name: "rectangle",
          start: { x: bBox?.x || 0, y: bBox?.y || 0 },
          end: { x: ((bBox?.x || 0) + (bBox?.width || 0)), y: ((bBox?.y || 0) + (bBox?.height || 0)) },
        })
        : getViewBoxTrimmed([this.props.prop]);

      const bBoxData = createPathdata("#000000", 3, 1);
      bBoxData.path = rectPath;
      bBoxData.strokeDasharray = "7,7";
      bBoxData.strokeDashoffset = 0;

      this.props.onPress(event, this, bBoxData);
      // console.log('and was given permission to be selected..')
      this.setState({ selected: true });
    }
  };

  handleOnStartShouldSetResponder = () => this.props.startResponder || false;
  handleOnMoveShouldSetResponder = () => this.state.selected;

  handleOnResponderGrant = (event: GestureResponderEvent) => {
    console.log('grantd responder');
    // just for fun 
    // this.props.prop.text = { value: 'I AM MOVING!!', above: 0 };
    // this.forceUpdate();
    const x = event.nativeEvent.locationX;
    const y = event.nativeEvent.locationY;
    this.setState({ transform: this.getTranslate(x, y) });
  };

  handleOnResponderMove = (event: GestureResponderEvent) => {
    console.log('moving responder');
    const x = event.nativeEvent.locationX;
    const y = event.nativeEvent.locationY;
    this.setState({ transform: this.getTranslate(x, y) });
  };

  handleOnResponderEnd = () => {
    console.log('end of responder');
  };

  // Add more methods as needed
  render() {
    if (!isValidPath(this.props.prop.path)) {
      console.log("MyPath was given invalid path data - ", this.props.prop.path, " -", this.props.prop.guid);
      return null;
    }
    let brush: BrushType | undefined;
    if (this.props.prop.stroke.startsWith("url(#")) {
      const brushGuid = this.props.prop.stroke.slice(5, -1);
      brush = Brushes.find(brush => brush.params.guid === brushGuid);
    }

    return (
      <G
        key={`${this.props.keyProp}-${this.props.prop.guid}`}
        ref={this.pathRef}
        transform={undefined}
      >
        {brush && getBrush(brush)}
        <Path
          id={this.props.prop.guid}
          d={this.props.prop.path}
          stroke={this.props.prop.stroke}
          strokeWidth={this.props.prop.strokeWidth}
          strokeLinecap={this.props.prop.strokeCap}
          strokeLinejoin={this.props.prop.strokeJoin}
          opacity={this.props.prop.strokeOpacity}
          fill={this.props.prop.fill ?? "none"}
          strokeDasharray={this.props.prop.strokeDasharray ?? undefined}
          strokeDashoffset={this.props.prop.strokeDashoffset ?? undefined}

          onPress={this.handleMyPathPress}
          onStartShouldSetResponder={this.handleOnStartShouldSetResponder}
        // onMoveShouldSetResponder={this.handleOnMoveShouldSetResponder}
        // onResponderGrant={this.handleOnResponderGrant}
        // onResponderMove={this.handleOnResponderMove}
        />
        {
          this.props.prop.text && (
            <Text
              fill={this.props.prop.text.color || this.props.prop.stroke || "#000000"}
              fontSize={this.props.prop.text.fontSize || 12}
              fontWeight={this.props.prop.text.fontWeight || "normal"}
              dy={this.props.prop.text.above || -1 * (this.props.prop.strokeWidth / 2) - 4 || 0}
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
      </G>
    )
  }
}

export default MyPath