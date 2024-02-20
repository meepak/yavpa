import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

const initialRenderTime = Date.now();

const ContextMenu = ({
  children,
  anchor,
  width = 200,
  height = 200,
  closeMenuAt = initialRenderTime,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);
  // const [opacity, setOpacity] = useState(0.8);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;


  const anchorRef = useRef<View>(null);

  const hideMenu = () => {
    console.log('hideMenu trigger closure', closeMenuAt);
    setMenuVisible(false);
  };

  useEffect(() => {
    console.log('menu close -- trigger unknown, rerendering?? ', menuVisible);
  }, [menuVisible]);

  // this lets me close or open menu from outside the component
  useEffect(() => {
    if (menuVisible) {
      console.log('closeMenuAt trigger closure', closeMenuAt)
      // setMenuVisible(false);
    }
  }, [closeMenuAt]);

  const showMenu = () => {
    anchorRef?.current?.measureInWindow((x, y, anchorWidth, anchorHeight) => {

      if (isNaN(x) || isNaN(y) || isNaN(anchorWidth) || isNaN(anchorHeight)) {
        console.error('Invalid measurements:', { x, y, anchorWidth, anchorHeight });
        return;
      }

      let newXPosition = x; // Default to right of anchor
      let newYPosition = y + anchorHeight + 5; // Default to below anchor

      //   console.log(newXPosition, newYPosition)
      // If menu goes beyond the right edge of the screen, position it to the left of the anchor
      if (newXPosition + width > windowWidth) {
        newXPosition = x - width;
        newXPosition = newXPosition < 0 ? 10 : newXPosition;
      }
      //   console.log(newXPosition, newYPosition)

      // If menu goes beyond the bottom edge of the screen, position it above the anchor
      if (newYPosition + height > windowHeight - 25) {
        newYPosition = y - height - 5;
      }
      // lets put a scroll bar instead

      setXPosition(newXPosition);
      setYPosition(newYPosition);
      setMenuVisible(true);
    });
  };


  return (
    <View>
      <View
        ref={anchorRef}
        onLayout={() => { }}
      >
        <TouchableOpacity onPress={showMenu}>
          {anchor}
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={menuVisible}
        onBackdropPress={hideMenu}
        backdropOpacity={0.4}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
      >

    <GestureHandlerRootView style={{width:'100%', height:'100%'}}>
        <TouchableWithoutFeedback onPress={hideMenu}>
          <View style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}>
            <TouchableWithoutFeedback>
              <View style={{
                width: width,
                height: height,
                maxHeight: windowHeight - 300,
                position: 'absolute',
                left: xPosition,
                top: yPosition,
                padding: 20,
                borderRadius: 10,
                backgroundColor: `rgba(150,150,250, 0.8)`, // extra panel background color
                borderWidth: 0.7,
                borderColor: "rgba(0,0,0,0.5)",
                elevation: 2,
              }}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
};

export default ContextMenu;