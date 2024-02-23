/**
 * Converts an HSL color to RGB.
 * @param hsl - The HSL color to convert. Must be a string in the format 'hsl(h, s%, l%)'.
 * @returns The RGB color as a hexadecimal string in the format '#RRGGBB'.
 * @throws Will throw an error if the input color is not a valid HSL color.
 */
export function hslToRgb(hsl: string): string {
    // Use a regular expression to extract the hue, saturation, and lightness values from the input string
    const match = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i);
    if (!match) {
        throw new Error('Invalid HSL color');
    }

    // Convert the hue, saturation, and lightness values to numbers between 0 and 1
    let h = parseInt(match[1]) / 360;
    let s = parseInt(match[2]) / 100;
    let l = parseInt(match[3]) / 100;

    let r: number, g: number, b: number;

    // If the saturation is 0, the color is achromatic (i.e., a shade of gray)
    if (s === 0) {
        r = g = b = l;
    } else {
        // The hue2rgb function converts a hue and a pair of RGB values to a single RGB value
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        // Calculate the intermediate values p and q
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        // Convert the hue and the intermediate values to RGB values
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    // Convert the RGB values to a hexadecimal string and return it
    return `#${((1 << 24) | ((r * 255) << 16) | ((g * 255) << 8) | (b * 255)).toString(16).slice(1)}`;
}


/**
 * Converts an RGB color to HSL.
 * @param rgb - The RGB color to convert. Can be a string in the format '#RRGGBB' or 'hsl(h, s%, l%)'.
 * @returns The HSL color as a string in the format 'hsl(h, s%, l%)'. If the input color is already in HSL format, it simply returns the input color.
 */
export function rgbToHsl(rgb: string): string {
    // If the input color is already in HSL format, return it as is
    if (rgb.startsWith('hsl')) {
        return rgb;
    }

    // If the input color is in hexadecimal format, remove the leading '#'
    if (rgb.startsWith('#')) {
        rgb = rgb.substring(1);
    }

    // Convert the red, green, and blue values from hexadecimal to decimal and normalize to the range 0-1
    const r = parseInt(rgb.substring(0, 2), 16) / 255;
    const g = parseInt(rgb.substring(2, 4), 16) / 255;
    const b = parseInt(rgb.substring(4, 6), 16) / 255;

    // Find the maximum and minimum values among the red, green, and blue values
    const max = Math.max(r, g, b), min = Math.min(r, g, b);

    // Calculate the lightness value
    let h, s, l = (max + min) / 2;

    // If the maximum and minimum values are the same, the color is achromatic, so set the hue and saturation to 0
    if (max === min) {
        h = s = 0;
    } else {
        // Calculate the difference between the maximum and minimum values
        const d = max - min;

        // Calculate the saturation value
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        // Calculate the hue value based on which color channel is the maximum
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        // Normalize the hue value to the range 0-1
        h /= 6;
    }

    // Convert the hue, saturation, and lightness values to the format 'hsl(h, s%, l%)' and return it
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}