import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { getViewBoxTrimmed, isIOS, isValidPath } from "./helper";
import { svg } from "d3";
import { DEFAULT_VIEWBOX, PathDataType } from "./types";
import { SvgDataType } from "./types";


// TODO ENABLE CACHE -- THINGS SLOWING DOWN!!! 
// ALSO WRITING TO DISK ALL THE TIME IS NO GOOD!!

// const AppName = "mypath.mahat.au";
const AppName = isIOS ? "mypath.mahat.au" : "draw-replay-svg-path"; 
// const AppName = "mypath.mahat.au"; //TODO change this before release

const AppSaveDirectory = FileSystem.documentDirectory + AppName + "/";

let fileCache: SvgDataType[] | null = null;
console.log(AppSaveDirectory)

function parseSvgData(svgData: any, update_updated_at = false): SvgDataType {
    const isValid = (val: any) => (val !== null && val !== undefined && (val || val === false));

    ///check if svgData has pathData and if not set default values
    if (!isValid(svgData.pathData) && !Array.isArray(svgData.pathData)) {
        svgData.pathData = [];
    }

    // filter out invalid path string
    svgData.pathData = svgData.pathData.filter((pathData: any) => {
        return isValidPath(pathData.path);
    });

    //check if pathData is of type PathDataType else set default values
    svgData.pathData = svgData.pathData.map((pathData: any) => {
        if (!isValid(pathData.stroke)) {
            pathData.stroke = "#000000";
        }
        if (!isValid(pathData.strokeWidth)) {
            pathData.strokeWidth = 2;
        }
        if (!isValid(pathData.length)) {
            pathData.length = 0;
        }
        if (!isValid(pathData.time)) {
            pathData.time = 0;
        }
        if (!isValid(pathData.visible)) {
            pathData.visible = true;
        }
        if (!isValid(pathData.guid) || pathData.guid === "") {
            pathData.guid = Crypto.randomUUID();
        }

        // we don't want to save dashArray & dashArrayOffset, WHY NOT??
        pathData.strokeDasharray = undefined;
        pathData.strokeDashoffset = undefined;
        return pathData;
    });


    // check if svgData has metaData and if not set default values
    svgData.metaData = svgData.metaData || {};
    if (!isValid(svgData.metaData.guid)) {
        svgData.metaData.guid = Crypto.randomUUID();
    }
    if (!isValid(svgData.metaData.created_at)) {
        svgData.metaData.created_at = new Date().toISOString();
    }
    if (!isValid(svgData.metaData.updated_at) || update_updated_at) {
        svgData.metaData.updated_at = new Date().toISOString();
    }
    if (!isValid(svgData.metaData.name) || svgData.metaData.name === svgData.metaData.guid) {
        svgData.metaData.name = svgData.metaData.updated_at.split('.')[0].split('T').join(' ');
    }
    if (!isValid(svgData.metaData.viewBox)) {
        svgData.metaData.viewBox = DEFAULT_VIEWBOX;
    }
    if (!isValid(svgData.metaData.viewBoxTrimmed)) {
        svgData.metaData.viewBoxTrimmed = getViewBoxTrimmed(svgData.pathData);
    }
    return svgData;
}

let saveTimeout: NodeJS.Timeout;
export const saveSvgToFile = async (svgData: SvgDataType, name = "") => {
    // Clear the previous timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
        console.log('[SAVE SVG TO FILE] saving cancelled', svgData.metaData.guid, svgData.metaData.updated_at)
    }

    console.log('[SAVE SVG TO FILE] saving file in 1s', svgData.metaData.guid, svgData.metaData.updated_at)

    // Set a new timeout to save the data after 2 seconds
    saveTimeout = setTimeout(async () => save(svgData, name), 1000);
    
    const save = async (svgData: { pathData: any; metaData: any; }, name: string) => {
        // there should be atleast 1 pathData to qualify for saving
        if (svgData.pathData.length < 1) {
            return false;
        }

        // if guid is not yet assigned, this will assign a new guid
        //fill anything missing with default value
        svgData = parseSvgData(svgData, true);

        // Serialize the svgData object to a JSON string
        const json = JSON.stringify(svgData);

        const filename =
            AppSaveDirectory + svgData.metaData.guid + ".json";

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
            // console.log("file saved at ", filename);

            // Update the cache, not sure cache is effective may need to check more than metadata or always just replace changed stuff??
            // if (fileCache !== null) {
            //     const index = fileCache.findIndex(file => file.metaData.guid === svgData.metaData.guid);
            //     if (index !== -1) {
            //         fileCache[index] = svgData;
            //     } else {
            //         fileCache.push(svgData);
            //     }
            // }


            console.log('[SAVE SVG TO FILE] ****file saved****', svgData.metaData.guid, svgData.metaData.updated_at)
        } catch (err) {
            console.error("[SAVE SVG TO FILE] Failed to save file:", err);
            return false;
            // Handle the error appropriately, e.g. show an error message to the user
        }
    };
};


export const getFiles = async (): Promise<SvgDataType[]> => {
    try {
        
        // check if directory exist
        const dirInfo = await FileSystem.getInfoAsync(AppSaveDirectory);
        if (!dirInfo.exists) {
            console.log('no directory found')
            // create the directory
            await FileSystem.makeDirectoryAsync(AppSaveDirectory, {
                intermediates: true,
            });
            return [];
        }

        const filenames = await FileSystem.readDirectoryAsync(AppSaveDirectory);

        // First time there won't be directory and hence no files

        // Get the metadata for each file
        const svgDataFiles = await Promise.all(
            filenames.map(async (filename) => {
                const info = await FileSystem.getInfoAsync(
                    AppSaveDirectory + "/" + filename
                );
                const json = await FileSystem.readAsStringAsync(info.uri);
                const svgData = parseSvgData(JSON.parse(json));

                // TODO remove this from release version
                // correction for already saved files
                // if (svgData.metaData.viewBox.includes('NaN')) {
                //     console.log(svgData.metaData.guid, 'viewbox is wrong', svgData.metaData.viewBox)
                //     svgData.metaData.viewBox = DEFAULT_VIEWBOX;
                //     // saveSvgToFile(svgData);
                // }
                return svgData;

            })
        );

        // Sort the files by modification time in descending order
        svgDataFiles.sort((a, b) => Date.parse(b.metaData.updated_at) - Date.parse(a.metaData.updated_at));
        //remove everything except last 3
        //  if (svgDataFiles.length > 1) {
        //    svgDataFiles.splice(1, svgDataFiles.length - 1);
        //  }
        //  console.log(svgDataFiles[0])

        // remove latest file from list
        // console.log(svgDataFiles[0])
        // svgDataFiles.shift();

        // After reading the files, store them in the cache
        // fileCache = svgDataFiles;

        return svgDataFiles;
    } catch (err) {
        console.error("Failed to read any file:", err);
        return [];
        // Handle the error appropriately, e.g. show an error message to the user
    }
};


export const getFile = async (guid: string): Promise<SvgDataType | null> => {
    try {

        // Construct the filename from the guid
        const filename = `${guid}.json`; // Adjust this line if your files have a different naming pattern

        // Get the file info
        const info = await FileSystem.getInfoAsync(AppSaveDirectory + "/" + filename);

        // If the file doesn't exist, return null
        if (!info.exists) {
            return null;
        }

        // Read the file content
        const json = await FileSystem.readAsStringAsync(info.uri);
        const svgData = parseSvgData(JSON.parse(json));

        return svgData;
    } catch (err) {
        console.error("Failed to read the file:", err);
        return null;
        // Handle the error appropriately, e.g. show an error message to the user
    }
};


export const deleteFile = async (guid: string): Promise<boolean> => {
    try {
        // Construct the filename from the guid
        const filename = `${guid}.json`; // Adjust this line if your files have a different naming pattern

        // Get the file info
        const result = await FileSystem.deleteAsync(AppSaveDirectory + "/" + filename);
        return true;
    } catch (err) {
        console.error("Failed to delete the file:", err);
        return false;
        // Handle the error appropriately, e.g. show an error message to the user
    }
};


// not necessary any more
export const deleteMostRecentFile = async () => {
    try {
        const files = await getFiles();
        if (files.length > 0) {
            const guid = files[0].metaData.guid;
            const result = await deleteFile(guid);
            return result;
        }
    } catch (err) {
        console.error("Failed to delete the file:", err);
        return false;
        // Handle the error appropriately, e.g. show an error message to the user
    }
}
