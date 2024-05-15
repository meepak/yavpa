import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  BackHandler,
  TextInput,
} from "react-native";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FOOTER_HEIGHT,
  HEADER_HEIGHT,
  MY_BLACK,
  MY_ON_PRIMARY_COLOR,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  ScreenModes,
} from "@u/types";
import {
  createMyPathData,
  hrFormatTime,
  precise,
  scaleToZoom,
} from "@u/helper";
import { getFile, saveSvgToFile } from "@u/storage";
import { useMyPathDataContext } from "@x/svg-data";
import {
  DrawScreen,
  ExportScreen,
  Header,
  PreviewScreen,
} from "@c/screens/file";
import { Stack, useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import * as Crypto from "expo-crypto";
import MyFilmStripView from "@c/controls/pure/my-film-strip-view";
import MyBlueButton from "@c/controls/pure/my-blue-button";
import myConsole from "@c/controls/pure/my-console-log";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Footer from "@c/screens/file/footer";
import { StatusBar } from "expo-status-bar";
import { useUserPreferences } from "@x/user-preferences";
import elevations from "@u/elevation";
import { useToastContext } from "@x/toast-context";
import Window from "@c/screens/file/draw/window";
import ZoomResetButton from "@c/controls/pure/zoom-reset-button";
import MyScreenShot from "@c/controls/my-screen-shot";
import MyEdgeButton from "@c/controls/my-edge-button";
import { ControlPanel } from "@c/controls";
import MyGradientBackground from "@c/controls/pure/my-gradient-background";
import MyList from "@c/controls/pure/my-list";
import MyPathLogo from "@c/logo/my-path-logo";

const FileScreen = () => {
  // Const insets = useSafeAreaInsets();

  // const [forceRerenderAt, setForceRerenderAt] = useState(Date.now());
  // const [canvasScale, setCanvasScale] = useState(1);

  const { defaultStorageDirectory } = useUserPreferences();
  const { loadNewFile, myPathData, setMyPathData } = useMyPathDataContext();
  const [controlButtons, setControlButtons] = useState([
    {
      name: "Loading...",
      onPress() {},
    },
  ]);
  const { guid } = useLocalSearchParams<{ guid: string }>(); // Capture the GUID from the URL
  const [currentScreenMode, setCurrentScreenMode] = useState(ScreenModes[0]); // Default DRAW, but save & read from metadata

  const [clippedPathStat, setClippedPathStat] = useState({
    totalPaths: -1,
    totalTime: -1,
  });

  const [pathStat, setPathStat] = useState("");

  const insets = useSafeAreaInsets();
  const { showToast } = useToastContext();
  const [exiting, setExiting] = useState(false);
  const [newFullShotCounter, setNewFullShotCounter] = useState(0);
  const [name, setName] = useState(myPathData.metaData.name);

  //* ***************************IMPORTANT********************************** */
  // If you are updating myPathData through context and if it requires saving to file
  // set the updatedAt date to blank, so that it will be saved to file
  useEffect(() => {
    // const saveData = async () => {
    // 	await saveSvgToFile(defaultStorageDirectory, myPathData);
    // 	// SetMyPathData({ ...myPathData, metaData: { ...myPathData.metaData, updatedAt: Date.now().toString() } });
    // };

    if (
      myPathData &&
      myPathData.metaData &&
      myPathData.metaData.guid != "" &&
      myPathData.metaData.updatedAt === ""
    ) {
      console.log("requesting save");
      saveSvgToFile(defaultStorageDirectory, myPathData)
        .then((saved) => {
          if (saved) {
            showToast("Data saved", { duration: 200 });
          }
        })
        .catch(() => {
          showToast("Failed to save data");
        });
    }
  }, [myPathData]);
  //* *************************************************************************** */

  useEffect(
    () => () => {
      // MyConsole.log("reset svg data from context, component unmounted")
      setExiting(true);
      // allow 40 ms to take a shot
      setTimeout(() => resetMyPathData(), 40);
    },
    [],
  );

  useEffect(() => {
    if (guid) {
      myConsole.log(`Open file with GUID: ${guid}`);
      openMyPathDataFile(guid);
    } else {
      const newMyPathData = createMyPathData();
      newMyPathData.metaData.guid = Crypto.randomUUID();
      setMyPathData(newMyPathData);
    }
  }, [guid]);

  async function openMyPathDataFile(guid) {
    const myPathDataFromFile = await getFile(defaultStorageDirectory, guid);
    if (myPathDataFromFile && myPathDataFromFile.metaData.guid === guid) {
      myConsole.log("File found with GUID: ", guid);
      loadNewFile(myPathDataFromFile);
    } else {
      myConsole.log("No file found with GUID: ", guid);
      resetMyPathData();
    }
  }

  const resetMyPathData = () => {
    loadNewFile(createMyPathData());
  };

  const handleNameChange = (name: string) => {
    if (name === myPathData.metaData.name) {
      return;
    }

    myConsole.log("name changed to ", name);
    setMyPathData((previous) => ({
      ...previous,
      metaData: { ...previous.metaData, name, updatedAt: "" },
    }));
  };

  const getCurrentScreen = React.useCallback(() => {
    switch (currentScreenMode.name) {
      case ScreenModes[1].name:
        return (
          <PreviewScreen
            initControls={setControlButtons}
            onPathClippedByBbox={(totalPaths, totalTime) =>
              setClippedPathStat({ totalPaths, totalTime })
            }
          />
        );
      case ScreenModes[2].name:
        return <ExportScreen initControls={setControlButtons} />;
      case ScreenModes[0].name:
      default:
        return <DrawScreen initControls={setControlButtons} />;
    }
  }, [currentScreenMode]);

  const DisplayScreenName = () => {
    const positions = [
      // { top: 30, left: 30 },
      { bottom: 30, left: 30 },
    ];
    return (
      <>
        {positions.map((position, index) => (
          <Text
            key={index}
            style={{
              position: "absolute",
              color: "rgba(255,255,255,0.6)",
              fontSize: 42,
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: 1,
              zIndex: -1,
              ...position,
            }}
          >
            {currentScreenMode.name.toUpperCase()}
          </Text>
        ))}
      </>
    );
  };

  useEffect(() => {
    const useClippedPathStat =
      clippedPathStat.totalPaths > -1 &&
      clippedPathStat.totalTime > -1 &&
      currentScreenMode.name === ScreenModes[1].name;

    const numberPath = useClippedPathStat
      ? clippedPathStat.totalPaths
      : myPathData?.pathData.length;
    const animationTime =
      (useClippedPathStat
        ? clippedPathStat.totalTime
        : myPathData?.pathData.reduce(
            (accumulator, item) => accumulator + item.time,
            0,
          )) / (myPathData?.metaData.animation?.speed || 1);

    console.log("animationTime", numberPath, animationTime);
    setPathStat(
      `${numberPath} path${numberPath > 1 ? "s" : ""} | ${hrFormatTime(animationTime)}`,
    );
  }, [myPathData, clippedPathStat, currentScreenMode]);

  const ViewDecoration =
    currentScreenMode.name === ScreenModes[1].name
      ? MyFilmStripView
      : React.Fragment;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          presentation: "card",
          animation: "fade",
          headerShown: true,
          gestureEnabled: false,
          statusBarTranslucent: true,
          statusBarHidden: false,
          statusBarStyle: "light",
          statusBarAnimation: "none",
          statusBarColor: "transparent",
          headerBackground: () => <MyGradientBackground />,
          headerBackVisible: true,
          navigationBarColor: "#FFFFFF",
          headerTintColor: "#FFFFFF",
          headerBackTitleVisible: false,
          headerTitle: "",
          headerLeft: () => (
            <TextInput
              style={{
                // flex: 1,
                width: SCREEN_WIDTH / 1.7,
                // height: 11,
                fontSize: 21,
                fontWeight: "300",
                textAlign: "left",
                paddingLeft: 10,
                color: "rgba(255, 255, 255, 0.7)",
                // borderWidth: 1,
                // borderColor: "yellow",
              }}
              onChangeText={setName}
              onEndEditing={(e) => {
                if (handleNameChange) {
                  handleNameChange(e.nativeEvent.text);
                }
              }}
              value={name}
              placeholder="Title"
              enterKeyHint="done"
              placeholderTextColor="rgba(255, 255, 255, 0.8)"
            />
          ),
          headerRight: () => (
            <MyList
              anchor={<MyPathLogo animate={false} width={36} height={36} />}
              width={150}
              height={SCREEN_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT}
            />
          ),
          contentStyle: {
            // backgroundColor: MY_PRIMARY_COLOR
          }
        }}
      />

      {currentScreenMode.name === ScreenModes[0].name ||
      currentScreenMode.name === ScreenModes[1].name ? (
        <View style={{ flex: 1, backgroundColor: "transparent", zIndex: 99 }}>
          <ViewDecoration>
            <View
              style={{
                flex: 1,
                alignContent: "center",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "transparent",
                overflow: "hidden",
                margin: 5,
              }}
            >
              <Text
                style={{
                  position: "absolute",
                  opacity: 0.7,
                  color: MY_BLACK,
                  fontSize: 9,
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  zIndex: -1,
                  top: 0,
                  right: 20,
                }}
              >
                {pathStat}
              </Text>

              {(myPathData.metaData.canvasScale != 1 ||
                Math.abs(myPathData.metaData.canvasTranslateX) > CANVAS_WIDTH ||
                Math.abs(myPathData.metaData.canvasTranslateY) >
                  CANVAS_HEIGHT) && (
                <Window
                  refresh={newFullShotCounter}
                  maxHeight={200}
                  maxWidth={200}
                />
              )}
              {/* <DisplayScreenName /> */}
              <View
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.1)",
                  ...elevations[1],
                }}
              >
                {getCurrentScreen()}
              </View>
            </View>
          </ViewDecoration>
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
          }}
        >
          {getCurrentScreen()}
        </View>
      )}

      <ZoomResetButton />
      {currentScreenMode.name === ScreenModes[1].name ? (
        <MyBlueButton
          icon={{ desc: "EXPORT", name: "export", size: 24 }}
          onPress={() => {
            setCurrentScreenMode(ScreenModes[2]);
          }}
          bottom={insets.bottom + 16}
          aligned="right"
        />
      ) : null}

      <MyEdgeButton
        text="Preview"
        leftOrRight="left"
        onPress={() => {
          console.log("Preview button pressed");
        }}
        top={200}
      />

      <MyScreenShot
        hostIsExiting={exiting}
        onScreenShotSaved={() => setNewFullShotCounter((prev) => prev + 1)}
      />
      {/* <Footer /> */}
    </View>
  );
};

export default FileScreen;
