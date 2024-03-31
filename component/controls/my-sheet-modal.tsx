import MyGradientBackground from '@c/my-gradient-background';
import React, { ReactNode } from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import Modal from 'react-native-modal';

interface MySheetModalProps {
    isVisible: boolean;
    title: string;
    children: ReactNode;
    height: number;
    onClose: () => void;
}

const headerHeight:number = 50;
const MySheetModal = React.forwardRef<React.RefObject<Modal>, MySheetModalProps>(({ isVisible, title, height, onClose, children }, ref) => {
    return (
            <Modal
                isVisible={isVisible}
                style={{
                    margin: 0,
                }}
                onBackdropPress={onClose}
                onBackButtonPress={onClose}
                onSwipeComplete={onClose}
                swipeDirection={['down']}
                backdropOpacity={0}
                backdropColor={'black'}
                animationInTiming={500}
                animationOutTiming={500}
                useNativeDriver={true}
                hideModalContentWhileAnimating={false}
                propagateSwipe={true}
            >
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'transparent',
                }}
                >
                    <View style={{
                        height: headerHeight,
                        width: '100%',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20
                    }}>
                        <MyGradientBackground style={{
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                        }}>
                            <Text style={{
                                color: 'white',
                                alignSelf: 'flex-start',
                                paddingLeft: 30,
                                paddingTop: 15,
                            }}>{title || 'My Sheet Modal'}</Text>
                        </MyGradientBackground>
                    </View>
                    <View
                        style={{
                            backgroundColor: 'white', //allow to customize
                            padding: 5,
                            height: height - headerHeight, // Change this to control the height of the modal
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <View
                            style={{
                                flex: 1,
                            }}>
                            {children}
                        </View>
                    </View>
                </View>
            </Modal>
    );
});

export default MySheetModal;