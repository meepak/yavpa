import elevations from '@u/elevation';
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
  closeMenuAt: number;
  anchor: React.ReactNode;
  children: React.ReactNode;
}

interface ContextMenuState {
  menuVisible: boolean;
  xPosition: number;
  yPosition: number;
  windowWidth: number;
  windowHeight: number;
}

const initialRenderTime = Date.now();

class ContextMenu extends React.PureComponent<ContextMenuProps, ContextMenuState> {
  static defaultProps = {
    width: 200,
    height: 200,
    closeMenuAt: initialRenderTime,
  };

  private anchorRef = React.createRef<View>();

  constructor(props: ContextMenuProps) {
    super(props);
    this.state = {
      menuVisible: false,
      xPosition: 0,
      yPosition: 0,
      windowWidth: Dimensions.get('window').width,
      windowHeight: Dimensions.get('window').height,
    };
  }

  componentDidUpdate(prevProps: ContextMenuProps, prevState: ContextMenuState) {
    if (prevState.menuVisible !== this.state.menuVisible) {
      // console.log('menu close -- trigger unknown if no reason below?? ', this.state.menuVisible);
    }

    if (prevProps.closeMenuAt !== this.props.closeMenuAt && this.state.menuVisible) {
      // console.log('REASON:: closeMenuAt trigger closure', this.props.closeMenuAt);
    }
  }

  hideMenu = () => {
    // console.log('REASON:: hideMenu trigger closure', this.props.closeMenuAt);
    this.setState({ menuVisible: false });
  };

  showMenu = () => {
    this.anchorRef.current?.measureInWindow((x, y, anchorWidth, anchorHeight) => {
      if (isNaN(x) || isNaN(y) || isNaN(anchorWidth) || isNaN(anchorHeight)) {
        console.error('Invalid measurements:', { x, y, anchorWidth, anchorHeight });
        return;
      }

      let newXPosition = x - anchorWidth; // Default to left of anchor
      let newYPosition = y + anchorHeight + 5; // Default to below anchor

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

        <Modal
          isVisible={this.state.menuVisible}
          onBackdropPress={this.hideMenu}
          backdropOpacity={0.4}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          useNativeDriver
        >
          <GestureHandlerRootView style={{width:'100%', height:'100%'}}>
            <TouchableWithoutFeedback onPress={this.hideMenu}>
              <View style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}>
                <TouchableWithoutFeedback>
                  <View style={{
                    width: this.props.width,
                    minHeight: this.props.height,
                    maxHeight: this.state.windowHeight - 40,
                    position: 'absolute',
                    left: this.state.xPosition,
                    top: this.state.yPosition,
                    padding: 20,
                    borderRadius: 10,
                    backgroundColor: `rgba(150,150,250, 0.75)`, 
                    borderWidth: 0.7,
                    borderColor: "rgba(0,0,0,0.5)",
                    ...elevations[2],
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