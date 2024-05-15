import React from "react";
import { View, Dimensions, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface Props {
  xPosition: number;
  yPosition: number;
  width: number;
  height: number;
  anchor: React.ReactNode;
  children: React.ReactNode;
}

class MyFloatingWindow extends React.PureComponent<Props> {
  state = {
    isVisible: false,
    xPosition: 0,
    yPosition: 0,
  };

  toggleWindow = (visible) => {
    if (visible) {
      this.calculatePosition();
    }
    this.setState({ isVisible: visible });
  };

  calculatePosition = () => {
    const { xPosition, yPosition, width, height } = this.props;
    let calculatedX = xPosition;
    let calculatedY = yPosition;
    const { width: windowWidth, height: windowHeight } =
      Dimensions.get("window");

    // Adjust the position if the window goes beyond the screen boundaries
    if (calculatedX + width > windowWidth) {
      calculatedX = windowWidth - width;
    }
    if (calculatedY + height > windowHeight) {
      calculatedY = windowHeight - height;
    }
    this.setState({ xPosition: calculatedX, yPosition: calculatedY });
  };

  render() {
    const { width, height, children } = this.props;
    const { isVisible, xPosition, yPosition } = this.state;

    return (
      <View style={{zIndex: 99999}}>
        <TouchableOpacity onPress={() => this.toggleWindow(true)}>
          {this.props.anchor}
        </TouchableOpacity>
        {isVisible && (
          <GestureHandlerRootView
            style={{
              position: "absolute",
              left: xPosition,
              top: yPosition,
              width: width,
              height: height,
              backgroundColor: "white",
              borderRadius: 10,
              elevation: 5,
            }}
          >
            <TouchableOpacity
              onPress={() => this.toggleWindow(false)}
              style={{ flex: 1 }}
            >
              <View>{children}</View>
            </TouchableOpacity>
          </GestureHandlerRootView>
        )}
      </View>
    );
  }
}

export default MyFloatingWindow;
