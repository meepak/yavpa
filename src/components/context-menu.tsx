import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableWithoutFeedback, Dimensions, Modal, TouchableOpacity } from 'react-native';

const ContextMenu = ({
  children,
  anchor,
  width = 200,
  height = 200,
  closeMenuAt = Date.now(),
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [xPosition, setXPosition] = useState(0);
  const [yPosition, setYPosition] = useState(0);


  const anchorRef = useRef<View>(null);

  const hideMenu = () => {
    setMenuVisible(false);
  };

  // this lets me close or open menu from outside the component
  useEffect(() => {
    setMenuVisible(false);
  }, [closeMenuAt]);

  const showMenu = () => {
    anchorRef?.current?.measureInWindow((x, y, anchorWidth, anchorHeight) => {
      const windowWidth = Dimensions.get('window').width;
      const windowHeight = Dimensions.get('window').height;

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
      if (newYPosition + height > windowHeight) {
        newYPosition = y - height - 5;
      }
      //   console.log(newXPosition, newYPosition)

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
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={hideMenu}
      >
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
                position: 'absolute',
                left: xPosition,
                top: yPosition,
                padding: 20,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.9)",
              }}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default ContextMenu;