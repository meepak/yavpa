import React from "react";
import {
  View,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Portal } from "@gorhom/portal";
import Animated, { EntryExitAnimationFunction, FadeIn, FadeOut } from "react-native-reanimated";

type ContextMenuProperties = {
  width?: number;
  height?: number;
  anchor: React.ReactNode;
  children: React.ReactNode;
  showBackground?: boolean;
  xPosition: number;
  yPosition: number;
  positionOverride?: boolean;
  yOffsetFromAnchor?: number;
  animationIn?: EntryExitAnimationFunction;
  animationOut?: EntryExitAnimationFunction;
};

type ContextMenuState = {
  menuVisible: boolean;
  xPosition: number;
  yPosition: number;
  positionOverride: boolean;
  windowWidth: number;
  windowHeight: number;
  yOffsetFromAnchor: number;
};

class ContextMenu extends React.PureComponent<
  ContextMenuProperties,
  ContextMenuState
> {
  static defaultProps = {
    width: 150,
    height: 200,
    showBackground: true,
    xPosition: 0,
    yPosition: 0,
    positionOverride: false,
    yOffsetFromAnchor: 10,
    animationIn: FadeIn,
    animationOut: FadeOut,
  };

  private readonly anchorRef = React.createRef<View>();

  constructor(properties: ContextMenuProperties) {
    super(properties);
    this.state = {
      menuVisible: false,
      xPosition: properties.xPosition || 0,
      yPosition: properties.yPosition || 0,
      positionOverride: properties.positionOverride || false,
      windowWidth: Dimensions.get("window").width,
      windowHeight: Dimensions.get("window").height,
      yOffsetFromAnchor: properties.yOffsetFromAnchor || 10,
    };
  }

  hideMenu = () => {
    this.setState({ menuVisible: false });
  };

  showMenu = () => {
    if (
      this.props.positionOverride &&
      this.props.xPosition &&
      this.props.yPosition
    ) {
      this.setState({
        xPosition: this.props.xPosition,
        yPosition: this.props.yPosition,
        menuVisible: true,
      });
      return;
    }

    this.anchorRef.current?.measure((x, y, anchorWidth, anchorHeight) => {
      if (isNaN(x) || isNaN(y) || isNaN(anchorWidth) || isNaN(anchorHeight)) {
        console.error("Invalid measurements:", {
          x,
          y,
          anchorWidth,
          anchorHeight,
        });
        return;
      }

      let newXPosition = x - anchorWidth; // Default to left of anchor
      let newYPosition =
        y + anchorHeight + (this.props.yOffsetFromAnchor || 10); // Default to below anchor

      if (newXPosition + this.props.width! > this.state.windowWidth) {
        newXPosition = this.state.windowWidth - this.props.width! - 40;
      }

      if (newYPosition + this.props.height! > this.state.windowHeight) {
        newYPosition = this.state.windowHeight - this.props.height! - 40;
      }

      if (newXPosition < 0) {
        newXPosition = 10;
      }

      if (newYPosition < 0) {
        newYPosition = 10;
      }

      this.setState({
        xPosition: newXPosition,
        yPosition: newYPosition,
        menuVisible: true,
      });
    });
  };

  render() {
    const { menuVisible, xPosition, yPosition } = this.state;
    return (
      <Animated.View ref={this.anchorRef}>
        <TouchableOpacity onPress={this.showMenu}>
          {this.props.anchor}
        </TouchableOpacity>
        {menuVisible && (
          <Portal hostName="root" name="contextMenuPortal">
            <Animated.View
              style={{
                position: "absolute",
                left: xPosition,
                top: yPosition,
                width: this.props.width,
                height: this.props.height,
                ...(this.props.showBackground
                  ? {
                      backgroundColor: "rgba(150,150,250, 0.85)",
                      padding: 20,
                      borderRadius: 10,
                      borderWidth: 0.7,
                      borderColor: "rgba(0,0,0,0.5)",
                    }
                  : {}),
              }}
              entering={this.props.animationIn}
              exiting={this.props.animationOut}
            >
              <GestureHandlerRootView
                style={{
                  width: "100%",
                  height: "100%",
                  overflow: "visible",
                }}
              >
                <TouchableWithoutFeedback onPress={this.hideMenu}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {this.props.children}
                  </View>
                </TouchableWithoutFeedback>
              </GestureHandlerRootView>
            </Animated.View>
          </Portal>
        )}
      </Animated.View>
    );
  }
}

export default ContextMenu;
