import { View } from "react-native";
import StrokeWidth from "./stroke-width";
import StrokeOpacity from "./stroke-opacity";
import Divider from "./divider";

const StrokeWidthOpacity = ({ color, width, opacity, onWidthChanged, onOpacityChanged , w = 250, h=200}) => {
  return (
    <>
      <View style={{ position: 'absolute', top: 17, zIndex: -2, margin: 5 }}>
        <StrokeWidth color={color} opacity={opacity} value={width} onValueChanged={onWidthChanged} w={w} h={h/2}/>
      </View>
      <View style={{ position: 'absolute', top: 80, zIndex: -2, margin: 5 }}>
        <Divider width={1} color={color} />
        <StrokeOpacity indicator={false} color={color} strokeWidth={width} value={opacity} onValueChanged={onOpacityChanged} w={w} h={h/2}/>
      </View>
    </>
  )
}

export default StrokeWidthOpacity