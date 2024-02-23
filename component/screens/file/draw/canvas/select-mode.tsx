
// const tap = Gesture.Tap()
// tap.onEnd((event) => {
//   if (!selectMode) return;
//   // console.log('tap', event);
//   const pt = {
//     x: precise(event.x as unknown as string),
//     y: precise(event.y as unknown as string),
//   };
//   if (selectedPaths.length > 0) {
//     // if we are not inside boundary box, we restore selected path
//     const boundary = selectedPaths.find((item) => item.guid === 'boundary-box');
//     if (boundary) {
//       const points = getPointsFromPath(boundary.path);
//       const selected = points.find((point) => {
//         return calculateDistance(point, pt) < 10;
//       });
//       if (!selected) {
//         //put selectedPath back in completedPaths at selectedPathIndex
//         setEditMode(true);
//         setSelectMode(false); // set mode first to allow changes in completed bath get saved
//         const path = selectedPaths[0];
//         setCompletedPaths((paths) => {
//           paths.splice(selectedPathIndex, 0, path);
//           return paths;
//         });
//         setSelectedPaths(() => []);
//         setSelectedPathIndex(-1);
//         return;
//       }
//     }
//     // if we tapped inside, existing selected path, no need to do anything
//   } else {
//     // we should get here only if we have no selected path or 
//     const selected = completedPaths.find((item, index) => {
//       const points = getPointsFromPath(item.path);
//       const selected = points.find((point) => {
//         return calculateDistance(point, pt) < 10;
//       });
//       setSelectedPathIndex(index);
//       return selected;
//     });


//     if (selected) {
//       setEditMode(false);
//       setSelectMode(true);
//       //remove from completed paths
//       setCompletedPaths((paths) => paths.filter((item) => item.guid !== selected.guid));
//       // add to selected paths
//       setSelectedPaths(() => [selected]); //once this moves path may change though

//       // get min max points form path and draw a boundary box
//       const pathPoints = getPointsFromPath(selected.path);
//       const minX = Math.min(...pathPoints.map((point) => point.x));
//       const minY = Math.min(...pathPoints.map((point) => point.y));
//       const maxX = Math.max(...pathPoints.map((point) => point.x));
//       const maxY = Math.max(...pathPoints.map((point) => point.y));
//       const points = [
//         { x: minX, y: minY },
//         { x: maxX, y: minY },
//         { x: maxX, y: maxY },
//         { x: minX, y: maxY },
//       ];

//       const boundaryPath = `M${points[0].x},${points[0].y}L${points[1].x},${points[1].y}L${points[2].x},${points[2].y}L${points[3].x},${points[3].y}Z`;
//       setSelectedPaths((paths) => [...paths, {
//         path: boundaryPath,
//         stroke: "red",
//         strokeWidth: 5,
//         length: 0,
//         time: 0,
//         visible: true,
//         guid: 'boundary-box',
//       }]);
//     }
//   }
// });

// const handleSelectedPathPanning = (event, state) => {
//   const pt = {
//     x: precise(event.x),
//     y: precise(event.y),
//   };

//   switch (state) {
//     case "began":
//       // check if we are inside the boundary box
//       const boundary = selectedPaths.find((item) => item.guid === 'boundary-box');
//       if (boundary) {
//         const points = getPointsFromPath(boundary.path);
//         const selected = points.find((point) => {
//           return calculateDistance(point, pt) < 10;
//         });
//         if (selected) {
//           console.log('inside the boundary box');
//         }
//       }
//       break;
//     case "active":
//       break;
//     case "ended":
//       break;
//   }
// }
