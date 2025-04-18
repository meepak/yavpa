import React from 'react';
import {
	SimplifySmooth,
	PathsAsLayers,
	SelectShape,
	StrokeWidth,
	StrokeOpacity,
} from 'component/controls';
import SelectBrushColor from '@c/controls/select-brush-color';

const createDrawControls = ({
	myPathData,
	setMyPathData,
	onUndo,
	onRedo,
	strokeWidth,
	setStrokeWidth,
	stroke,
	setStroke,
	strokeOpacity,
	setStrokeOpacity,
	simplifyTolerance,
	setSimplifyTolerance,
	d3CurveBasis,
	setD3CurveBasis,
	shape,
	drawShape,
	toggleErasure,
	pickImage,
	toggleEnhancedDrawing,
	togglePathEditing,
	toggleSnapping,
}) => {
	// MyConsole.log('createDrawControls', strokeWidth);
	const selectedPath = myPathData?.pathData.find(item => item.selected); // If (selectedPath) {
	//   stroke = selectedPath.stroke;
	//   strokeOpacity = selectedPath.strokeOpacity;
	//   strokeWidth = selectedPath.strokeWidth;
	// }

	return [
    {
      key: "path-edit",
      icon: "ok",
      toggleIcons: ["pencil", "ok"],
      onPress: togglePathEditing,
    },
    {
      key: "draw-mode",
      icon: "draw-text",
      toggleIcons: ["draw-line", "draw-text"],
      onPress: toggleEnhancedDrawing,
    },
    {
      key: "snap-points",
      icon: "plus-circle",
      toggleIcons: ["plus-circle", "minus-circle"],
      onPress: toggleSnapping,
    },
    {
      key: "undo",
      icon: "undo",
      onPress: onUndo,
    },
    {
      key: "redo",
      icon: "redo",
      onPress: onRedo,
    },
    {
      key: "erasure",
      icon: "erasure-off",
      toggleIcons: ["erasure", "erasure-off"],
      onPress: toggleErasure,
    },
    {
      key: "palette",
      icon: "palette",
      title: "Select Stroke Color",
      extraControl: (
        <SelectBrushColor
          value={selectedPath?.stroke || stroke}
          onValueChanged={(color: string) => setStroke(() => color)}
        />
      ),
      extraPanel: { width: 140, height: 500 },
    },
    // {
    //   key: "brush",
    //   icon: "palette",
    //   title: "Select Brush Stroke",
    //   extraControl: (
    //     <SelectBrush
    //       value={stroke.startsWith('url(#') ? stroke.slice(5, -1) : ''}
    //       onValueChanged={(guid: string) => setStroke(() => "url(#" + guid + ")")}
    //     />
    //   ),
    //   extraPanel: { width: 280, height: 320 }
    // },
    {
      key: "stroke-width",
      icon: "stroke-width",
      title: "Set Stroke Width",
      extraControl: (
        <StrokeWidth
          stroke={selectedPath?.stroke || stroke}
          strokeOpacity={selectedPath?.strokeOpacity || strokeOpacity}
          value={selectedPath?.strokeWidth || strokeWidth}
          onValueChanged={(value: number) => {
            setStrokeWidth(() => value);
          }}
        />
      ),
      extraPanel: { width: 100, height: 400 },
    },
    {
      key: "stroke-opacity",
      icon: "opacity",
      title: "Set Stroke Opacity",
      extraControl: (
        <StrokeOpacity
          stroke={selectedPath?.stroke || stroke}
          strokeWidth={selectedPath?.strokeWidth || strokeWidth}
          value={selectedPath?.strokeOpacity || strokeOpacity}
          onValueChanged={(value: number) => {
            setStrokeOpacity(() => value);
          }}
        />
      ),
      extraPanel: { width: 100, height: 400 },
    },
    {
      key: "line-simplify",
      icon: "line-simplify",
      title: "Simplify & Smooth",
      extraControl: (
        <SimplifySmooth
          simplifyValue={simplifyTolerance}
          onSimplifyValueChanged={(value: number) => {
            setSimplifyTolerance(() => value);
          }}
          d3Value={d3CurveBasis}
          onD3ValueChanged={(value: string) => {
            setD3CurveBasis(() => value);
          }}
        />
      ),
      extraPanel: { width: 300, height: 300 },
    },
    {
      key: "shapes",
      icon: "shapes",
      title: "Draw Shape",
      extraControl: (
        <SelectShape
          onValueChanged={(value: string) => {
            drawShape(value);
          }}
          value={shape}
        />
      ),
      extraPanel: { width: 150, height: 400 },
    },
    {
      key: "add-image",
      icon: "add-image",
      title: "Add Image",
      onPress: () => pickImage(),
    },
    {
      key: "layers",
      icon: "layers",
      title: "Layers",
      extraControl: <PathsAsLayers />,
      extraPanel: { width: 230, height: "auto" },
    },
  ];
};

export default createDrawControls;
