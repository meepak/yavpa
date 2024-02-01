import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { Dimensions } from "react-native";
import { path } from "d3";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

const AppName = "draw-replay-svg-path";
const AppSaveDirectory = FileSystem.documentDirectory + AppName + "/";

// Define Type of PathData
export type PathDataType = {
  path: string;
  length: number;
  time: number;
  stroke: string;
  strokeWidth: number;
};

// Define type of SvgData
export type SvgDataType = {
  pathData: PathDataType[];
  metaData: {
    guid: string;
    created_at: string;
    updated_at: string;
    name: string;
    viewBox: string;
  };
};

export const createSvgData = (defaultViewBoxWidth: number, defaultViewBoxHeight: number): SvgDataType => ({
  pathData: [],
  metaData: {
    guid: Crypto.randomUUID(),
    created_at: Date.now().toString(),
    updated_at: Date.now().toString(),
    name: "",
    viewBox: `0 0 ${defaultViewBoxWidth} ${defaultViewBoxHeight}`,
  },
});

// not used but keeping for reference
export const createPathdata = (): PathDataType => ({
  path: "",
  stroke: "black",
  strokeWidth: 2,
  length: 0,
  time: 0,
});

export const saveSvgToFile = async (svgData: SvgDataType, name = "") => {
  // Make sure metadata exists
  svgData.metaData = svgData.metaData || {};
  svgData.metaData.guid = svgData.metaData.guid || Crypto.randomUUID();
  svgData.metaData.created_at =
    svgData.metaData.created_at || new Date().toISOString();
  svgData.metaData.updated_at = new Date().toISOString();
  svgData.metaData.name = svgData.metaData.name || svgData.metaData.guid;

  // Serialize the svgData object to a JSON string
  const json = JSON.stringify(svgData);

  const filename =
    AppSaveDirectory + (name !== "" ? name : svgData.metaData.name) + ".json";

  try {
    // Make sure the directory exists
    const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(AppSaveDirectory, {
        intermediates: true,
      });
    }

    // Write the JSON string to a file
    await FileSystem.writeAsStringAsync(filename, json);
    console.log("file saved at ", filename);
    return true;
  } catch (err) {
    console.error("Failed to save file:", err);
    return false;
    // Handle the error appropriately, e.g. show an error message to the user
  }
};

export const getFiles = async (): Promise<SvgDataType[]> => {
  try {
    const filenames = await FileSystem.readDirectoryAsync(AppSaveDirectory);

    // First time there won't be directory and hence no files

    // Get the metadata for each file
    const files = await Promise.all(
      filenames.map(async (filename) => {
        const info = await FileSystem.getInfoAsync(
          AppSaveDirectory + "/" + filename
        );
        const json = await FileSystem.readAsStringAsync(info.uri);
        const svgData = JSON.parse(json);
        // return { filename, ...info, svgData };
        return svgData;
      })
    );

    // Sort the files by modification time in descending order
    files.sort((a, b) => b.modificationTime - a.modificationTime);

    return files;
  } catch (err) {
    console.error("Failed to read any file:", err);
    return [];
    // Handle the error appropriately, e.g. show an error message to the user
  }
};

export const getPathFromPoints = (points: { x: any; y: any; }[]) => {
  const path = points.map(({ x, y }) => `L${x},${y}`).join("");
  return `M${path.slice(1)}`;
};

export const getPointsFromPath = (path) => {
  const commands = path.split(/(?=[MLC])/); // Split on M, L, or C
  const points = commands.map((command) => {
    const type = command[0];
    const coords = command.slice(1).split(",").map(Number);
    if (type === "C") {
      // For C commands, return the last pair of coordinates
      return { x: coords[4], y: coords[5] };
    } else {
      // For M and L commands, return the coordinates
      return { x: coords[0], y: coords[1] };
    }
  });
  return points;
};

export const getViewBox = (pathData: PathDataType[]) => {
  let minX = screenWidth;
  let minY = screenHeight;
  let maxX = 0;
  let maxY = 0;
  let offset = 20;

  // console.log("pathData", pathData)
  pathData.forEach((path) => {
    // console.log("path", path)
    const points = getPointsFromPath(path.path);
    // console.log("points", points);
    points.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });
  });

  return `${minX - offset} ${minY - offset} ${maxX - minX + 2 * offset} ${maxY - minY + 2 * offset}`;
};

export const getGreeting = () => {
  const currentTime = new Date().getHours()

  if (currentTime >= 5 && currentTime < 12) {
    return 'Good Morning'
  }

  if (currentTime >= 12 && currentTime < 17) {
    return 'Good Afternoon'
  }

  if (currentTime >= 17 && currentTime < 21) {
    return 'Good Evening'
  }
  return 'Good Night'
}
