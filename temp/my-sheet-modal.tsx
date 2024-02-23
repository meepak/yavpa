import React, { ReactNode } from 'react';
import { View, Modal, Text, TouchableWithoutFeedback } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import MyIcon from '../component/my-icon';

interface MySheetModalProps {
    isVisible: boolean;
    children: ReactNode;
    height: number;
    onClose: () => void;
}

const MySheetModal: React.FC<MySheetModalProps> = ({ isVisible, children, height, onClose }) => {
    // const screenHeight = Dimensions.get('window').height;
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'transparent',
                }}>
                    <TouchableWithoutFeedback>
                        <View
                            style={{
                                backgroundColor: 'white',
                                padding: 22,
                                height: height, // Change this to control the height of the modal
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderTopLeftRadius: 20, // Optional, for rounded corners
                                borderTopRightRadius: 20, // Optional, for rounded corners
                            }}>
                            <View
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    borderWidth: 1,
                                    borderColor: 'red'
                                }}>
                                <TouchableOpacity
                                    onPress={onClose}
                                    style={{
                                        position: 'absolute',
                                        top: -20,
                                        right: -7,
                                        backgroundColor: "rgba(0,0,0,0.2)",
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                    <Text style={{ fontSize: 22 }}>x</Text>
                                </TouchableOpacity>
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default MySheetModal;