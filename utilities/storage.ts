import path from "path";
import * as FileSystem from "expo-file-system";
import myConsole from "@c/controls/pure/my-console-log";
import * as Crypto from "expo-crypto";
import * as ImageManipulator from "expo-image-manipulator";
import {
  type MyPathDataType,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  FILE_PREVIEW_WIDTH,
  ScreenShotType,
} from "./types";
import { arraysEqual, parseMyPathData } from "./helper";
import { updateId } from "expo-updates";

// Const AppName = I_AM_IOS ? "mypath.mahat.au" : "draw-replay-svg-path";
// const DefaultDirName = 'mypath1.mahat.au'; //isIOS ? "mypath.mahat.au" : "draw-replay-svg-path";
// const AppSaveDirectory = FileSystem.documentDirectory;// + DefaultDirName + "/";

const pngBase64Prefix = `data:image/png;base64,`;

let fileCache: MyPathDataType[] = [];
let saveTimeout: NodeJS.Timeout;

// This are all json files
export const myPathFileExt = ".mp";
export const myPathImageExt = ".mpi";
const myPathFile = (appSaveDir: string, guid: string, ext = myPathFileExt) =>
  path.join(appSaveDir, `${guid}` + ext);
const myPathImage = (appSaveDir: string, guid: string) =>
  path.join(appSaveDir, `${guid}` + myPathImageExt);

export const getAppSavePath = (document: string) => {
  const rootDir = FileSystem.documentDirectory;
  if (!rootDir) {
    throw new Error("No root directory found, probably permission required"); // TODO HANDLE THIS PROPERLY
  }

  const appSaveDir = rootDir + document;
  return appSaveDir;
};

export const saveSvgToFile = async (
  documentDir: string,
  myPathData: MyPathDataType,
  name = "",
) => {
  const appSaveDir = getAppSavePath(documentDir);

  myPathData = parseMyPathData(myPathData, true);
  const index = fileCache.findIndex(
    (file) => file.metaData.guid === myPathData.metaData.guid,
  );

  return new Promise((resolve, reject) => {
    if (index === -1) {
      if (myPathData.pathData.length === 0) {
        console.log("denied, no paths to save.");
        return resolve(false);
      }

      fileCache.push(myPathData); // Add new or updated file to the top of the cache
    } else if (
      index >= 0 &&
      arraysEqual(myPathData.pathData, fileCache[index].pathData) &&
      myPathData.metaData === fileCache[index].metaData
    ) {
      console.log("denied, no changes to save.");
      return resolve(false);
    } else {
      // Move the updated file to the top of the cache
      console.log("fileCache", fileCache[index].pathData.length);
      console.log("myPathData", myPathData.pathData.length);
      fileCache[index] = myPathData;
    }

    // Clear the previous timeout
    // myConsole.log('clearing timeout.');
    clearTimeout(saveTimeout);

    // MyConsole.log('saving file in 2 seconds.');
    // Set a new timeout
    saveTimeout = setTimeout(async () => {
      try {
        const json = JSON.stringify(myPathData);
        // Const filename = path.join(AppSaveDirectory, `${myPathData.metaData.guid}.json`);
        const filename = myPathFile(appSaveDir, myPathData.metaData.guid);

        const dirInfo = await FileSystem.getInfoAsync(appSaveDir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(appSaveDir, {
            intermediates: true,
          });
        }

        await FileSystem.writeAsStringAsync(filename, json);
        myConsole.log(
          "*****FILE SAVED TO DISK***" +
            JSON.stringify(myPathData.metaData.canvasScale),
        );
        resolve(true);
      } catch (error) {
        console.error("Failed to save file:", error);
        reject(error);
      }
    }, 1000); // Delay of 2 second
  });
};

export const getFiles = async (
  documentDir,
  allowCache = true,
): Promise<MyPathDataType[]> => {
  try {
    const appSaveDir = getAppSavePath(documentDir);

    if (fileCache.length > 0 && allowCache) {
      myConsole.log("file cache get files");
      return fileCache;
    }

    myConsole.log("I should never be reached after first time.");
    const dirInfo = await FileSystem.getInfoAsync(appSaveDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(appSaveDir, { intermediates: true });
      return [];
    }

    const filenames = await FileSystem.readDirectoryAsync(appSaveDir);

    // Get json files only
    const myPathFiles = filenames.filter((filename) =>
      filename.endsWith(myPathFileExt),
    );

    const myPathDataFiles: MyPathDataType[] = [];

    // MyConsole.log('we have files, /lets load them - ', myPathFiles);
    for (const svgFile of myPathFiles) {
      const info = await FileSystem.getInfoAsync(
        path.join(appSaveDir, svgFile),
      );
      const json = await FileSystem.readAsStringAsync(info.uri);
      const myPathData = parseMyPathData(JSON.parse(json));

      myPathDataFiles.push(myPathData);
    }

    if (myPathDataFiles.length === 0) {
      myConsole.log("we have no file,", appSaveDir, " lets load the demo file");
      const logoFile = require("@c/logo/my-path-demo.json");

      const demoFile = JSON.parse(JSON.stringify(logoFile));
      const logoData = parseMyPathData(demoFile);
      myPathDataFiles.push(logoData);

      // Const creativeVoidData = require('@c/creative-void/creative-void.json');
      // const cvData = parseMyPathData(creativeVoidData);
      // myPathDataFiles.push(cvData);
    }

    myConsole.log("set the filecache again..");
    // MyPathDataFiles.sort((a, b) => Date.parse(b.metaData.updatedAt) - Date.parse(a.metaData.updatedAt));

    fileCache = myPathDataFiles;
    return myPathDataFiles;
  } catch (error) {
    console.error("Failed to read any file:", error);
    return [];
  }
};

export const getFile = async (
  documentDir: string,
  guid: string,
): Promise<MyPathDataType | undefined> => {
  try {
    const appSaveDir = getAppSavePath(documentDir);
    const file = fileCache.find((file) => file.metaData.guid === guid);
    if (file) {
      myConsole.log("file found in fileCache");
      // Reset selected path to false, find betteer way
      let needCacheUpdate = false;
      for (const path of file.pathData) {
        path.selected = false;
      }

      myConsole.log("file found in fileCache");
      return file;
    }

    myConsole.log("file not found in cache");

    const filename = myPathFile(appSaveDir, guid);
    const info = await FileSystem.getInfoAsync(filename);

    if (!info.exists) {
      return;
    }

    const json = await FileSystem.readAsStringAsync(info.uri);
    const myPathData = parseMyPathData(JSON.parse(json));
    fileCache.push(myPathData);
    return myPathData;
  } catch (error) {
    console.error("Failed to read the file:", error);
    return;
  }
};

export const deleteFiles = async (
  documentDir: string,
  guids: string[],
): Promise<boolean> => {
  try {
    const appSaveDir = getAppSavePath(documentDir);
    const exts = [myPathFileExt, "canvas", "full"];
    for (const guid of guids) {
      if (guid === "") continue;
      for (const ext of exts) {
        const filename = myPathFile(appSaveDir, guid, ext);
        await FileSystem.deleteAsync(filename);
        fileCache = fileCache.filter((file) => file.metaData.guid !== guid);
      }
    }
    return true;
  } catch (error) {
    console.error("Failed to delete the file:", error);
    return false;
  }
};

export const duplicateFile = async (
  documentDir: string,
  guid: string,
): Promise<boolean> => {
  try {
    const myPathData = await getFile(documentDir, guid);
    if (myPathData) {
      const duplicatePathData = {
        ...myPathData,
        pathData: myPathData.pathData.map((pd) => ({
          ...pd,
          guid: Crypto.randomUUID(),
        })),
        metaData: {
          ...myPathData.metaData,
          guid: Crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          name: new Date().toISOString(),
        },
        updateAt: new Date().toISOString(),
      };
      await saveSvgToFile(documentDir, duplicatePathData);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete the file:", error);
    return false;
  }
};

// Deal with PathhData images, for now only 1 image as background can be used
// TODO -- why am i saving in base 64, json format instead of not saving as image as is??
export const saveImageToCache = async (
  documentDir: string,
  filePath: string,
  height: number,
  width: number,
): Promise<any | undefined> => {
  const appSaveDir = getAppSavePath(documentDir);
  const lookupTablePath = path.join(appSaveDir, "lookupTable.txt");
  const filename = path.join(filePath);
  const extension = path.extname(filePath);

  // TODO maintain allowed list of file types and check

  const resizedImage = await ImageManipulator.manipulateAsync(
    filename,
    [{ resize: { height: CANVAS_HEIGHT } }],
    { base64: true, compress: 0.9, format: ImageManipulator.SaveFormat.PNG },
  );
  const base64Data = pngBase64Prefix + resizedImage.base64;
  const dataHash =
    base64Data &&
    (await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      base64Data,
    ));

  // Check if the file already exists in the cache
  // check if lookup table exist
  const lookupTableInfo = await FileSystem.getInfoAsync(lookupTablePath);
  let lookupTable = "";
  if (lookupTableInfo.exists) {
    lookupTable = await FileSystem.readAsStringAsync(lookupTablePath);
    const lines = lookupTable.split("\n");
    for (const line of lines) {
      const [existingHash, existingGuid] = line.split(",");
      if (existingHash === dataHash) {
        const existingImage = await FileSystem.readAsStringAsync(
          myPathImage(appSaveDir, existingGuid),
        );
        return JSON.parse(existingImage);
      }
    }
  } else {
    await FileSystem.writeAsStringAsync(lookupTablePath, "");
  }

  const content = {
    data: base64Data,
    width,
    height,
    hash: dataHash,
    guid: Crypto.randomUUID(),
  };

  // MyConsole.log('content', content);

  // If no match was found, write a new file
  const imagePath = myPathImage(appSaveDir, content.guid);
  await FileSystem.writeAsStringAsync(imagePath, JSON.stringify(content));

  // Add the new hash and GUID to the lookup table
  const updatedLookupTable = `${lookupTable}${content.hash},${content.guid}\n`;
  await FileSystem.writeAsStringAsync(lookupTablePath, updatedLookupTable);

  return content;
};

// Export const getImage =  async (guid: string): Promise<any|null> => {
//     const filename = myPathImage(guid);
//     const info = await FileSystem.getInfoAsync(filename);

//     if (!info.exists) {
//         return null;
//     }

//     const imageJson = await FileSystem.readAsStringAsync(filename);

//     return JSON.parse(imageJson);
// }

// save screenshot to cache,
export const saveScreenshot = async (
  documentDir: string,
  guid: string,
  uri: string,
  type: ScreenShotType,
) => {
  const appSaveDir = getAppSavePath(documentDir);

  const resizeHeight = 300; // TODO readjust, define Window max Height

  const resizedImage = await ImageManipulator.manipulateAsync(
    uri,
    type === "full" ? [{ resize: { height: resizeHeight } }] : undefined,
    { base64: true, compress: 0.9, format: ImageManipulator.SaveFormat.PNG },
  );

  // console.log("saveScreenshot", resizedImage.base64?.length);
  const base64Data = pngBase64Prefix + resizedImage.base64;
  // console.log(base64Data);
  const savePath = path.join(appSaveDir, `${guid}.${type}`);
  await FileSystem.writeAsStringAsync(savePath, base64Data);

  FileSystem.deleteAsync(uri); // we don't need it, lets not clutter
};

// retrieve the screenshot
export const getScreenshot = async (
  documentDir: string,
  guid: string,
  type: ScreenShotType,
): Promise<string | undefined> => {
  const appSaveDir = getAppSavePath(documentDir);
  const filePath = path.join(appSaveDir, `${guid}.${type}`);
  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) {
    return;
  }

  console.log("getScreenshot", filePath);
  const data = await FileSystem.readAsStringAsync(filePath);
  return (!data.startsWith(pngBase64Prefix) ? pngBase64Prefix : "") + data;
};
