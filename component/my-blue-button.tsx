import { Text, View, StyleSheet, Pressable } from "react-native";
import MyIcon from "./my-icon";
import { useState } from "react";
import { MY_BLACK } from "@u/types";

type MyBlueButtonProps = {
    icon?: { desc: string; name: string; size?: number, left?: number, top?: number };
    text?: () => React.ReactNode;
    onPress: () => void;
    // left?: number;
    // right?: number;
    top?: number;
    bottom?: number;
    aligned?: 'left' | 'right';
};
const SIZE = 50;
const MyBlueButton = (props: MyBlueButtonProps) => {
    const styles = StyleSheet.create({
        position: {
            position: 'absolute',
            // left: props.left || undefined,
            // right: props.right || undefined,
            top: props.top || undefined,
            bottom: props.bottom || undefined,
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            zIndex: 999,
            ...(
                props.aligned === 'left'
                    ? { left: 0 }
                    : { right: 0 }
            )
        },
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020935',
            opacity: 1,
            width: SIZE * 2,
            height: SIZE,
            borderWidth: 1,
            borderColor: '#4f236d',
            ...(
                props.aligned === 'left'
                    ? {
                        borderTopRightRadius: SIZE / 2,
                        borderBottomRightRadius: SIZE / 2,
                        borderTopWidth: 1,
                        borderRightWidth: 2,
                        borderLeftWidth: 0,
                        borderBottomWidth: 0,

                    }
                    : {
                        borderTopLeftRadius: SIZE / 2,
                        borderBottomLeftRadius: SIZE / 2,
                        borderTopWidth: 1,
                        borderLeftWidth: 2,
                        borderRightWidth: 0,
                        borderBottomWidth: 0,
                    }
            ),
        }
    });

    const [containerStyle, setContainerStyle] = useState(styles.container);


    const setPressedDesign = (pressed: boolean) => {
        setContainerStyle({
            ...containerStyle,
            opacity: 1,
            borderColor: pressed ? "#4f236d" : "#4f236d",
            ...(
                props.aligned === 'left'
                    ? {
                        borderTopRightRadius: SIZE / 2,
                        borderBottomRightRadius: SIZE / 2,
                        borderTopWidth: pressed ? 3 : 1,
                        borderRightWidth: pressed ? 4 : 2,
                        borderLeftWidth: 0,
                        borderBottomWidth: 0,

                    }
                    : {
                        borderTopLeftRadius: SIZE / 2,
                        borderBottomLeftRadius: SIZE / 2,
                        borderTopWidth: pressed ? 3 : 1,
                        borderLeftWidth: pressed ? 4 : 2,
                        borderRightWidth: 0,
                        borderBottomWidth: 0,
                    }
            ),
        });
    }

    return (
        <View style={styles.position} >
            <View style={{
                ...containerStyle
            }}>
            </View>
            <Pressable
                style={{ ...containerStyle, position: 'absolute' }}
                onPress={props.onPress}
                onPressIn={() => setPressedDesign(true)}
                onPressOut={() => setPressedDesign(false)}
            >
                <View style={props.icon?.desc ? {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'space-between',
                    paddingHorizontal: 20,
                    opacity: 1,
                } : {}}>
                    {
                        props.icon?.desc &&
                        <View style={{ width: SIZE }}>
                            <Text
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: '300',
                                    textAlign: 'right',
                                    paddingRight: 5,
                                }}
                                numberOfLines={2}
                                // ellipsizeMode='middle'
                            >
                                {props.icon?.desc ||''}
                            </Text>
                        </View>
                    }
                    <View
                        pointerEvents="auto">
                        <View style={{
                            opacity: 1,
                            top: props.icon?.top || undefined,
                            left: props.icon?.left || undefined
                        }}>{
                                props.icon
                                    ? <MyIcon
                                        // onPress={props.onPress} // do not pass onPress to MyIcon
                                        name={props.icon.name}
                                        color="#FFFFFF"
                                        style={{ size: props.icon.size || undefined }}
                                    />
                                    : props.text ? <props.text /> : null}
                        </View>
                    </View>
                </View>
            </Pressable >
        </View >
    )
}

export default MyBlueButton
