import myConsole from '@c/my-console-log';
import { CANVAS_HEIGHT } from '@u/types';
import React from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

interface ContextMenuProps {
  width?: number;
  height?: number;
  // closeMenuAt?: number;
  anchor: React.ReactNode;
  children: React.ReactNode;
  showBackground?: boolean;
  xPosition?: number;
  yPosition?: number;
  positionOverride?: boolean;
  yOffsetFromAnchor?: number;
  animationIn?: any;
  animationOut?: any;
}

interface ContextMenuState {
  menuVisible: boolean;
  xPosition: number;
  yPosition: number;
  positionOverride: boolean;
  windowWidth: number;
  windowHeight: number;
  yOffsetFromAnchor: number;
}

const initialRenderTime = Date.now();

class ContextMenu extends React.PureComponent<ContextMenuProps, ContextMenuState> {
  static defaultProps = {
    width: 150,
    height: 200,
    // closeMenuAt: initialRenderTime,
    showBackground: true,
    xPosition: 0,
    yPosition: 0,
    positionOverride: false,
    yOffsetFromAnchor: 10,
  };

  private anchorRef = React.createRef<View>();

  constructor(props: ContextMenuProps) {
    super(props);
    this.state = {
      menuVisible: false,
      xPosition: props.xPosition || 0,
      yPosition: props.yPosition || 0,
      positionOverride: props.positionOverride || false,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
      yOffsetFromAnchor: props.yOffsetFromAnchor || 10,
    };
  }

  // we will only close if hideMenu is explicitly called
  // componentDidUpdate(prevProps: ContextMenuProps, prevState: ContextMenuState) {
    // if (prevState.menuVisible !== this.state.menuVisible ) {
    //   myConsole.log('menu close -- trigger unknown if no reason below?? ', this.state.menuVisible);
    //    this.hideMenu();
    // }

    // if (prevProps.closeMenuAt !== this.props.closeMenuAt && !this.state.menuVisible) {
    //   myConsole.log('REASON:: closeMenuAt trigger closure', this.props.closeMenuAt);
    //   this.hideMenu();
    // }
  // }

  hideMenu = () => {
    // myConsole.log('REASON:: hideMenu trigger closure', this.props.closeMenuAt);
    this.setState({ menuVisible: false });
  };

  showMenu = () => {

    myConsole.log('opning..who\'d overridding this already??');
    // if the menu close time is within last 200 ms, do not open agian
    // if (this.props.closeMenuAt && (Date.now() - this.props.closeMenuAt < 200)) {
    //   myConsole.log('CANC:: showMenu trigger closure', this.props.closeMenuAt);
    //   return;
    // }
    if (this.props.positionOverride && this.props.xPosition && this.props.yPosition) {

      this.setState({ xPosition: this.props.xPosition, yPosition: this.props.yPosition, menuVisible: true });
      return;
    }
    this.anchorRef.current?.measureInWindow((x, y, anchorWidth, anchorHeight) => {
      if (isNaN(x) || isNaN(y) || isNaN(anchorWidth) || isNaN(anchorHeight)) {
        console.error('Invalid measurements:', { x, y, anchorWidth, anchorHeight });
        return;
      }

      let newXPosition = x - anchorWidth; // Default to left of anchor
      let newYPosition = y + anchorHeight + (this.props.yOffsetFromAnchor || 10); // Default to below anchor

      // If menu goes beyond the right edge of the screen, position it to the left of the anchor
      if (newXPosition + this.props.width! > this.state.windowWidth) {
        newXPosition = this.state.windowWidth - this.props.width! - 40; // 10 is the margin from the right edge
      }

      // If menu goes beyond the bottom edge of the screen, position it above the anchor
      if (newYPosition + this.props.height! > this.state.windowHeight) {
        newYPosition = this.state.windowHeight - this.props.height! - 40; // 10 is the margin from the bottom edge
      }

      // If menu goes beyond the left edge of the screen, position it to the right of the anchor
      if (newXPosition < 0) {
        newXPosition = 10; // 10 is the margin from the left edge
      }

      // If menu goes beyond the top edge of the screen, position it below the anchor
      if (newYPosition < 0) {
        newYPosition = 10; // 10 is the margin from the top edge
      }


      this.setState({ xPosition: newXPosition, yPosition: newYPosition, menuVisible: true });
    });
  };


  render() {
    return (
      <View>
        <View
          ref={this.anchorRef}
          onLayout={() => { }}
        >
          <TouchableOpacity onPress={this.showMenu}>
            {this.props.anchor}
          </TouchableOpacity>
        </View>

        {/*TODO DURING APP START UP CHOOSE ONE SET OF STYLE RANDOMLY AND STICK WITH IT TILL APPLICATION RESTARTS*/}
        <Modal
          isVisible={this.state.menuVisible}
          coverScreen={true}
          hasBackdrop={true}
          backdropColor='rgba(0,0,0,0.5)'
          onBackdropPress={() => this.hideMenu}
          statusBarTranslucent={true}
          animationIn={this.props.animationIn || "slideInUp"}
          animationOut={this.props.animationOut || "slideOutUp"}
          useNativeDriver
          useNativeDriverForBackdrop
          hideModalContentWhileAnimating
        >
          <GestureHandlerRootView style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}>
            <TouchableWithoutFeedback onPress={this.hideMenu}>
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}>
                <TouchableWithoutFeedback>
                  <View style={{
                    minHeight: this.props.height,
                    maxHeight: CANVAS_HEIGHT - 40,
                    position: 'absolute',
                    left: this.state.xPosition,
                    top: this.state.yPosition,
                    ...(
                      this.props.showBackground
                        ? {
                          width: this.props.width,
                          padding: 20,
                          borderRadius: 10,
                          backgroundColor: `rgba(150,150,250, 0.85)`,
                          borderWidth: 0.7,
                          borderColor: "rgba(0,0,0,0.5)",
                          // ...elevations[2],
                        }
                        : { width: (this.props.width || 150) * 3 }
                    )
                  }}>
                    {this.props.children}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </GestureHandlerRootView>
        </Modal>
      </View>
    );
  }
}

export default ContextMenu;