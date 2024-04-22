import { Divider, MySlider } from "@c/controls";
import MyCheckBox from "@c/controls/pure/my-check-box";
import {
  MY_BLACK,
  SCREEN_WIDTH,
} from "@u/types";
import { UserPreferencesContext } from "@x/user-preferences";
import React, { useContext } from "react";
import { View, Text } from "react-native";
import Svg, { Line, Circle, Ellipse } from "react-native-svg";

const DrawingPreferences: React.FC<{
  disableParentScroll: (value: boolean) => void;
}> = () => {
  const { usePenOffset, penOffset, setUserPreferences } = useContext(
    UserPreferencesContext,
  );

  return (
    <View style={{ marginHorizontal: 15, marginVertical: 20 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <MyCheckBox
          label="Use Pen Offset"
          checked={usePenOffset}
          onChange={(value) => {
            setUserPreferences({ usePenOffset: value });
          }}
          checkBoxFirst
          textStyle={{ fontWeight: "bold", color: MY_BLACK }}
          iconStyle={{ color: "#000000", fill: "#000000", strokeWidth: 0.5 }}
        />

        <Text>
          x: {penOffset.x}, y: {penOffset.y}
        </Text>
      </View>

      <Divider width="100%" height={1} color={"#00000077"} />
      <View
        style={{
          width: SCREEN_WIDTH - 40,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: ((SCREEN_WIDTH - 30) * 2) / 3,
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MySlider
            name="X Offset"
            value={penOffset.x || 0}
            onValueChange={(value: number) => {
              setUserPreferences({ penOffset: { ...penOffset, x: value } });
            }}
            minimumValue={-100}
            maximumValue={100}
            step={1}
            horizontal={true}
            plusMinusButtons={false}
            style={{ width: "100%" }}
          />

          <MySlider
            name="Y Offset"
            value={penOffset.y || 0}
            onValueChange={(value: number) => {
              setUserPreferences({ penOffset: { ...penOffset, y: value } });
            }}
            minimumValue={-100}
            maximumValue={100}
            step={1}
            horizontal={true}
            plusMinusButtons={false}
            style={{ width: "100%" }}
          />
        </View>
        <View>
          <Svg width={100} height={100} viewBox="0 0 100 100">
            <Line x1={0} y1={50} x2={100} y2={50} stroke="black" />
            <Line x1={50} y1={0} x2={50} y2={100} stroke="black" />
            <Circle cx={50} cy={50} r={2} fill="black" />
            <Circle
              cx={50 - penOffset.x}
              cy={50 - penOffset.y}
              r={2}
              fill="red"
            />
            <Ellipse
              cx={50}
              cy={50}
              rx={35}
              ry={22}
              fill="#A52a2a33"
              stroke="brown"
            />
          </Svg>
        </View>
      </View>
	  <View style={{alignItems: "flex-end"}}>
		  <Text>If you place your writing finger on the ellipse,</Text>
		  <Text>the red dot represents the writing pen tip.</Text>
	  </View>
    </View>
  );
};

export default DrawingPreferences;
