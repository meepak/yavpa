import * as Crypto from "expo-crypto";
import {
  type PathDataType,
} from "../../utilities/types";


// ----------- animation function start ------------
export function shapeAnimation(
   path: PathDataType,
  pathStartFrame: number,
  pathEndFrame: number,
) {}


export function pathAnimation (
  path: PathDataType,
  pathStartFrame: number,
  pathEndFrame: number,
) {
  const start = 0;
  const end = 100;
  // Const offset = 0;
  return {
    ty: "tm",
    nm: "Trim Paths 1",
    mn: "{" + Crypto.randomUUID() + "}",
    s: {
      a: 1,
      k: [
        {
          t: pathStartFrame,
          s: [start],
          h: 0,
        },
        {
          t: pathEndFrame,
          s: [end],
        },
      ],
    },
    e: {
      a: 0,
      k: 0,
    },
    o: {
      a: 0,
      k: 0,
    },
    m: 1,
  };
}
