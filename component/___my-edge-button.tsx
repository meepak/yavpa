// import { MY_BLACK } from "@u/types";
// import { View, Text, Pressable } from "react-native";
// import MyIcon from "./my-icon";


// interface MyEdgeButtonProps {
//     myIcon?: { name: string, size: number };
//     text: string;
//     onPress?: () => void;
//     top?: number;
//     leftOrRight?: 'left' | 'right';
// }

// const MyEdgeButton = (props: MyEdgeButtonProps) => {
//     return (
//             <View style={{
//                 position: 'absolute',
//                 top: props.top || undefined,
//                 [props.leftOrRight || 'right']: 0,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 alignContent: 'center',
//                 zIndex: 999,
//             }}>
//                 <View style={{
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     backgroundColor: MY_BLACK,
//                     opacity: 1,
//                     width: 30,
//                     height: 'auto',
//                     paddingHorizontal: 4,
//                     paddingVertical: 6,
//                     borderWidth: 1,
//                     borderColor: '#4f236d',
//                     ...(
//                         props.leftOrRight === 'left'
//                             ? {
//                                 borderTopRightRadius: 15,
//                                 borderBottomRightRadius: 15,
//                                 borderTopWidth: 1,
//                                 borderRightWidth: 2,
//                                 borderLeftWidth: 0,
//                                 borderBottomWidth: 0,
//                             }
//                             : {
//                                 borderTopLeftRadius: 15,
//                                 borderBottomLeftRadius: 15
//                                 ,
//                                 borderTopWidth: 1,
//                                 borderLeftWidth: 2,
//                                 borderRightWidth: 0,
//                                 borderBottomWidth: 0,
//                             }
//                     ),
//                 }}>
//                     <View style={{
//                         flexDirection: 'column',
//                     }}>
//                         {
//                             props.myIcon &&
//                             <View style={{ marginBottom: 15, marginLeft: 7 }}>
//                                 <MyIcon
//                                     // onPress={props.onPress} // do not pass onPress to MyIcon
//                                     name={props.myIcon.name}
//                                     color="#FFFFFF"
//                                     style={{ size: props.myIcon.size || undefined }}
//                                 />
//                             </View>
//                         }
//                         {props.text.split('').map((char, index) => (
//                             <Text key={index} style={{
//                                 color: '#FFFFFF',
//                                 fontSize: 14,
//                                 fontWeight: '500',
//                                 textTransform: 'uppercase',
//                                 opacity: 1,
//                                 marginVertical: -5,
//                                 transform: [{ rotate: props.leftOrRight === 'left' ? '90deg' : '90deg' }],
//                             }}>
//                                 {char}
//                             </Text>
//                         ))}
//                     </View>
//                 </View>
//             </View>
//     )
// }

// export default MyEdgeButton;