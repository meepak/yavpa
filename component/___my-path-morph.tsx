// Import React, { useEffect } from 'react';
// import { Button, View } from 'react-native';
// import Svg, { Path } from 'react-native-svg';
// import { interpolatePath } from 'd3-interpolate-path'
// import Animated, { useSharedValue, useAnimatedProps, withTiming, runOnJS } from 'react-native-reanimated';
// import myConsole from './my-console-log';

// export default function MyPathMorph() {
//     const animationProgress = useSharedValue(0);
//     const AnimatedPath = Animated.createAnimatedComponent(Path);

//     const firstPath = "M10 80 Q 95 10 180 80"; // starting path
//     const secondPath = "M70 10 Q 95 90 180 80"; // ending path

//     const interpolator = interpolatePath(firstPath, secondPath);

//     const animatedProps = useAnimatedProps(() => {
//         const d = runOnJS(interpolator)(animationProgress.value);
//         myConsole.log(d);
//         return {d};
//     });

//     useEffect(() => {
//         animationProgress.value = withTiming(1, { duration: 7000 });
//     }, []);

//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Svg width="200" height="200" viewBox="0 0 200 200">
//                 <AnimatedPath
//                     // animatedProps={animatedProps as any}
//                     fill="none"
//                     stroke="black"
//                     strokeWidth="5"
//                     // animatedProps = {animatedProps}
//                 />
//             </Svg>
//         </View>
//     );
// }
