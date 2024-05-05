import { pathAnimation } from "./path";
import { shapeAnimation } from "./shape";

export { pathAnimation, shapeAnimation };

// ---- Animation effect supported by lottie----

/*

Trim Paths: Animation of the stroke along a path.

Basic Shapes and Paths: You can animate rectangles, ellipses, and freeform vector paths. This includes animating their position, size, rotation, and color.

Transforms: You can animate the position, scale, rotation, and opacity of any element.

Parenting: You can parent one element to another, so that when the parent element moves, the child element moves with it.

Masks: You can use one shape to hide or reveal parts of another shape.

Track Mattes: You can use one layer to define the transparency of another layer.

Stroke Effects: You can animate the color, opacity, width, and dash pattern of strokes.

Fill Effects: You can animate the color and opacity of fills.

Gradient Effects: You can animate the colors, opacity, and position of gradients.

Layer Modes: You can use layer modes to blend the colors of different layers.

Text: You can animate the position, scale, rotation, and opacity of text. You can also animate the color, size, and font of text.

Images: You can animate the position, scale, rotation, and opacity of images.

3D Layers: You can move and rotate layers in 3D space.

Cameras: You can animate the position and rotation of a camera to create a 3D effect.

Nulls: You can use nulls to control the animation of multiple layers at once.

Shape Morphing: You can animate a shape to morph into another shape.

Expressions: You can use JavaScript expressions to create complex animations.

Markers: You can use markers to synchronize your animation with sound or to trigger events at specific times.

----------------

Most of the animations supported by Lottie can also be achieved with SVG animations using SMIL or CSS, but there are some differences and limitations:

1. **Basic Shapes and Paths**: SVG supports animation of basic shapes and paths using both SMIL and CSS.

2. **Transforms**: SVG supports animation of transforms (scale, translate, rotate, skew) using both SMIL and CSS.

3. **Parenting**: SVG supports the concept of grouping (`<g>` tag) which can be used to achieve similar effects to parenting in Lottie.

4. **Masks**: SVG supports masks.

5. **Track Mattes**: SVG doesn't directly support track mattes, but similar effects can be achieved using masks or clip paths.

6. **Stroke Effects**: SVG supports animation of stroke properties.

7. **Fill Effects**: SVG supports animation of fill properties.

8. **Gradient Effects**: SVG supports gradients, but animating them can be complex and may not be fully supported across all browsers.

9. **Layer Modes**: SVG doesn't support layer modes like Lottie does.

10. **Text**: SVG supports text and its animation.

11. **Images**: SVG supports embedding images and animating them.

However, it's important to note that while SVG with SMIL or CSS can achieve many of the same animations as Lottie, the latter is often more performant and easier to work with for complex animations. Additionally, SMIL is deprecated in many browsers and its use is generally discouraged in favor of CSS or JavaScript-based animations.


*/



