import { View, Text } from "react-native";


interface MyEdgeButtonProps {
    text: string;
    onClick: () => void;
    top?: number;
    leftOrRight?: 'left' | 'right';
}

const MyEdgeButton = (props: MyEdgeButtonProps) => {
    return (
        <View style={{
            position: 'absolute',
            top: props.top || undefined,
            [props.leftOrRight || 'right']: 0,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            zIndex: 999,
        }}>
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: "#120e31",
                opacity: 1,
                width: 30,
                height: 'auto',
                paddingHorizontal: 4,
                paddingVertical: 6,
                borderWidth: 1,
                borderColor: '#4f236d',
                ...(
                    props.leftOrRight === 'left'
                        ? {
                            borderTopRightRadius: 15,
                            borderBottomRightRadius: 15,
                            borderTopWidth: 1,
                            borderRightWidth: 2,
                            borderLeftWidth: 0,
                            borderBottomWidth: 0,
                        }
                        : {
                            borderTopLeftRadius: 15,
                            borderBottomLeftRadius: 15
                            ,
                            borderTopWidth: 1,
                            borderLeftWidth: 2,
                            borderRightWidth: 0,
                            borderBottomWidth: 0,
                        }
                ),
            }}>
                <Text style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    opacity: 1,
                    transform: [{ rotate: props.leftOrRight === 'left' ? '90deg' : '180deg' }],
                }}>
                    {props.text}
                </Text>
            </View>
        </View>
    )
}

export default MyEdgeButton;