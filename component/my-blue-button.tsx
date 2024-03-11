import { Text, View, StyleSheet, Pressable } from "react-native";
import MyIcon from "./my-icon";
import elevations from "@u/elevation";
import { useState } from "react";

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
const SIZE = 60;
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
            zIndex: 9999,
            ...(
                props.aligned === 'left'
                    ? { left: 0 }
                    : { right: 0 }
            )
        },
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: "#0000FF",
            opacity: 1,
            width: SIZE * 1.5,
            height: SIZE,
            borderWidth: 0,
            borderColor: '#0000FF',
            ...(
                props.aligned === 'left'
                    ? {
                        borderTopRightRadius: SIZE / 2,
                        borderBottomRightRadius: SIZE / 2,

                    }
                    : {
                        borderTopLeftRadius: SIZE / 2,
                        borderBottomLeftRadius: SIZE / 2,
                    }
            ),
            // ...elevations[5],
        }
    });

    const [containerStyle, setContainerStyle] = useState(styles.container);


    const setPressedDesign = (pressed: boolean) => {
        setContainerStyle({
            ...containerStyle,
            // backgroundColor: pressed ? "#0000FF" : "#512DAB",
            // opacity: pressed ? 0.5 : 1,
            borderWidth: pressed ? 10 : 0,
            borderColor: pressed ? "#0000FF" : "#0000FF",
        });
    }

    return (
        <View style={styles.position} >
            <View style={{
                // backgroundColor: '#512DAB',
                // borderWidth: 3,
                // borderColor: '#0000FF',
                ...containerStyle
            }}>
                {/* just so that it provides base to cover up imperfections below it  */}
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
                            // ellipsizeMode='tail'
                            >
                                {props.icon?.desc ||''}
                            </Text>
                        </View>
                    }
                    <View
                        pointerEvents="auto">
                        <View style={{
                            top: props.icon?.top || undefined,
                            left: props.icon?.left || undefined
                        }}>{
                                props.icon
                                    ? <MyIcon
                                        // onPress={props.onPress}
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
