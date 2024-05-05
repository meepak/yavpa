import * as Crypto  from 'expo-crypto';
import { PathDataType } from "../../utilities/types";

export function shapeAnimation(
  path: PathDataType,
  pathStartFrame: number,
  pathEndFrame: number,
) {
  const startScale = 1;
  const endScale = 2;

  return {
    ty: "tr", // Transform
    nm: "Shape Transform",
    mn: "{" + Crypto.randomUUID() + "}",
    p: {
      // Position
      a: 1,
      k: [
        {
          t: pathStartFrame,
          s: [0, 0], // Start position
          h: 0,
        },
        {
          t: pathEndFrame,
          s: [100, 100], // End position
        },
      ],
    },
    s: {
      // Scale
      a: 1,
      k: [
        {
          t: pathStartFrame,
          s: [startScale, startScale], // Start scale
          h: 0,
        },
        {
          t: pathEndFrame,
          s: [endScale, endScale], // End scale
        },
      ],
    },
    r: {
      // Rotation
      a: 0,
      k: 0,
    },
    o: {
      // Opacity
      a: 0,
      k: 100,
    },
    sk: {
      // Skew
      a: 0,
      k: 0,
    },
    sa: {
      // Skew Axis
      a: 0,
      k: 0,
    },
  };
}
