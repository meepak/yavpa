import React from 'react';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Svg, Path } from 'react-native-svg';

export interface MyIconStyle {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

export interface MyIconProps {
  name: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  style?: MyIconStyle;
}

const MyIcon: React.FC<MyIconProps> = ({
  name,
  onPress = () => { },
  size = 26,
  color = "#FFFFFF",
  fill = 'none',
  strokeWidth = 1,
  style={},
}) => {
  const { paths, transform } = getPath(name);
  return (
    <TouchableOpacity onPress={onPress}>
    <Svg width={style.size || size} height={style.size || size} viewBox="0 0 26 26">
      {paths.map((path, index) => (
        <Path
          key={index}
          d={path}
          stroke={style.color || color}
          strokeWidth={style.strokeWidth || strokeWidth}
          fill={style.fill || fill}
          transform={transform}
        />
      ))}
    </Svg>
  </TouchableOpacity>
  );
};


const getPath = (name: string) => {

  let paths = [""];
  let transform = 'translate(2,2)';
  switch (name) {
    case 'new':
      paths = [
        `m18.85 10.39 1.06-1.06c.78-.78.78-2.05 0-2.83L18.5 5.09c-.78-.78-2.05-.78-2.83 0l-1.06 
        1.06 4.24 4.24zm-5.66-2.83L4 16.76V21h4.24l9.19-9.19-4.24-4.25zM19 17.5c0 2.19-2.54 3.5-5 
        3.5-.55 0-1-.45-1-1s.45-1 1-1c1.54 0 3-.73 3-1.5 0-.47-.48-.87-1.23-1.2l1.48-1.48c1.07.63 
        1.75 1.47 1.75 2.68zM4.58 13.35C3.61 12.79 3 12.06 3 11c0-1.8 1.89-2.63 3.56-3.36C7.59 7.18 
        9 6.56 9 6c0-.41-.78-1-2-1-1.26 0-1.8.61-1.83.64-.35.41-.98.46-1.4.12a.992.992 0 0 1-.15-1.38C3.73 
        4.24 4.76 3 7 3s4 1.32 4 3c0 1.87-1.93 2.72-3.64 3.47C6.42 9.88 5 10.5 5 11c0 .31.43.6 1.07.86l-1.49 1.49z`
      ]
      break;
    case 'pencil':
      paths = [
        `M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 
        0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z`
      ];
      break;
    case "edit":
      paths = [
        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      ];
      break;
    case "preview":
      paths = [
        `M 21,6 H 13.41 L 16.7,2.71 16,2 12,6 8,2 7.29,2.71 10.59,6 H 3 C 1.9,6 1,6.89 1,8 v 12 
        c 0,1.1 0.9,2 2,2 h 18 c 1.1,0 2,-0.9 2,-2 V 8 C 23,6.89 22.1,6 21,6 Z M 22.077222,21.130115 
        1.8839174,21.113225 1.805143,6.927542 22.080311,6.9209322 Z M 9,10 v 8 l 7,-4 z`
      ];
      transform = 'translate(2,0)';
      break;
    case "export":
      paths = [
        `M16.661 19.115l.939-.034v2.673c0 1.1-.855 1.08-1.955 1.08h-10c-1.1 0-2-.9-2-2v-18c0-1.1.9-1.99 
        2-1.99l10-.01c1.1 0 2.023-.373 2.023.727v2.225l-.881.048.028-2.23-10.992-.118c-1.273-.006-1.39.902-1.372 
        1.425l-.062 18.199c.476.748.634.579 
        1.211.752l3.582-.086c.199-1.822 3.068-1.823 3.118 0l4.361-.052zm5.8-7.281l-5.614-3.881v2.911H9.829v1.94h7.018v2.911z`
      ];
      break;
    case "undo":
      paths = [
        "M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
      ];
      break;
    case "redo":
      paths = [
        "M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"
      ];
      break;
    case "layers":
      paths = [
        "m 2,12 10,5 10,-5 M 2,17 12,22 22,17 M 12,2 2,7 12,12 22,7 Z"
      ];
      transform = "scale(0.8)translate(5,5)";
      break;
    case "palette":
      paths = [
        `M12 2.736C6.89 2.736 2.736 6.89 2.736 12S6.89 21.264 12 21.264c.982 0 1.764-.782 1.764-1.764 0-.424-.16-.842-.459-1.186a.736.736 
        0 0 1-.02-.025c-.153-.191-.291-.469-.291-.789a1.26 1.26 0 0 1 1.236-1.236H16A5.26 5.26 0 0 0 21.264 11c0-4.516-4.113-8.264-9.264-8.264zm0 
        .527c4.759 0 8.736 3.42 8.736 7.736A4.75 4.75 0 0 1 16 15.736h-1.77c-.982 0-1.764.782-1.764 1.764 0 .421.153.837.441 1.16a.736.736 
        0 0 1 .01.012 1.27 1.27 0 0 1 .318.828A1.26 1.26 0 0 1 12 20.736 8.76 8.76 0 0 1 3.264 12 8.76 8.76 0 0 1 12 3.264zM9.5 
        6.736c-.4 0-.764.364-.764.764s.364.764.764.764.764-.364.764-.764-.364-.764-.764-.764zm5 
        0c-.4 0-.764.364-.764.764s.364.764.764.764.764-.364.764-.764-.364-.764-.764-.764zm-8 
        4c-.4 0-.764.364-.764.764s.364.764.764.764.764-.364.764-.764-.364-.764-.764-.764zm11 0c-.4 
        0-.764.364-.764.764s.364.764.764.764.764-.364.764-.764-.364-.764-.764-.764z`
      ];
      break;
    case "stroke-width":
      paths = [
        `M3.165 6.777h17.8v-1.28h-17.8zm-.094.02h17.885V4.926H3.071zM3 20h18v-1H3zM3 4v4h18V4zm-.026 
        10.92h18v-3h-18zm-.072-1.152h18v-.795h-18zm.033.445h18v-1.504h-18z`
      ];
      break;
    case "opacity":
      paths = [
        `M10.118 0 2.97 7.02a10.429 10.429 0 0 0-2.189 3.188C.262 11.386 0 12.645 0 14.023c0 
        2.825.952 5.102 2.95 7.068C4.947 23.058 7.262 24 10.117 24c2.854 0 5.169-.942 7.168-2.91 
        1.998-1.965 2.95-4.242 2.95-7.067 0-1.378-.262-2.637-.783-3.815a10.427 10.427 0 0 0-2.189-3.188zm0 
        1.293a1.096 1.096 0 0 1 .77.316l5.957 5.887-.01-.01c.764.737 1.428 1.735 2.06 2.998.718 
        1.437.881 3.133.573 4.98a1.096 1.096 0 0 
        1-1.08.916H1.777a1.096 1.096 0 0 1-1.084-.93c-.282-1.848-.098-3.54.633-4.974.643-1.26 1.311-2.256 
        2.073-2.99l-.01.01L9.347 1.61a1.096 1.096 0 0 1 .77-.316z`
      ];
      transform = "scale(0.8)translate(5,5)";
      break;
    case "line-simplify":
      paths = [
        `M5.569 18.725l-3.9-6.829 4.664-6.231.47.503-4.357 5.802 3.87 6.811zM22.431 6.562c-6.343-1.38-4.986 
        14.784.327 11.329l.057.684c-6.657 2.633-6.796-14.023-.336-12.564zm-7.022 5.74l-4.192-2.618v1.964l-2.632.161c1.038.477.506 
        1.27.506 1.27l2.126-.122v1.964z`
      ];
      break;
    case "shapes":
      paths = [
        `M-.04 10.024l5.4-9.3 5.4 9.3zm5.433 13.5q-1.9 0-3.2-1.3-1.3-1.3-1.3-3.186 0-1.914 1.3-3.214 1.3-1.3 3.2-1.3 1.9 0 
        3.2 1.3 1.3 1.3 1.3 3.2 0 1.9-1.3 3.2-1.3 1.3-3.2 1.3zm0-.933q1.5 0 2.533-1.033 1.033-1.033 1.033-2.533 
        0-1.5-1.033-2.533-1.033-1.033-2.533-1.033-1.5 0-2.533 1.033-1.033 1.033-1.033 2.533 0 1.5 1.033 2.533 1.033 
        1.033 2.533 1.033zm-3.8-13.5H9.16l-3.8-6.5zm12.6 14.433v-9h9v9zm.933-.933h7.133v-7.133h-7.133zm3.567-12.567q-1.033-.8-1.983-1.567-.95-.767-1.683-1.55-.733-.783-1.167-1.583-.433-.8-.433-1.667 
        0-1.1.7-1.8.7-.7 1.8-.7.766 0 1.433.383.667.383 1.334 1.183.667-.767 1.367-1.167.7-.4 1.433-.4 1.054 0 1.76.753.706.753.706 1.847 
        0 .833-.433 1.617-.433.783-1.167 1.55-.733.767-1.683 1.533-.95.767-1.983 
        1.567zm0-1.2q2.3-1.733 3.317-2.933 1.017-1.2 1.017-2.167 0-.7-.45-1.167-.45-.467-1.117-.467-.46 0-.897.283-.437.283-1.237 
        1.083l-.633.633-.633-.633q-.833-.833-1.25-1.1-.417-.267-.883-.267-.7 0-1.133.417-.433.417-.433 
        1.15 0 1.033 1.017 2.233 1.017 1.2 3.317 2.933zm0-3.367zm-13.3.367zm0 13.2zm13.3 0z`
      ];
      transform = "scale(0.8)translate(5,5)";
      break;
    case "ok":
      paths = [
        `M11.959.03C7.948.034 3.723 2.138 1.394 6.354-.097 9.033-.474 12.617.529 15.648c1.414 4.506 5.101 7.27 8.793 8.07 4.523 1.069 
        9.658-.594 12.662-5.121 1.931-2.804 2.588-6.972 1.335-10.384-1.446-4.241-4.865-6.931-8.394-7.799A11.78 11.78 0 0 0 
        11.959.03zm-.002.194c4.157-.055 8.573 2.374 10.655 7.032 1.285 2.874 1.309 6.521.033 9.408-1.973 4.692-6.328 
        7.136-10.441 7.18-4.061.103-8.393-2.036-10.608-6.457-1.697-3.314-1.684-7.872.188-11.074C4.011 2.243 8.103.204 
        11.957.224zM9.642 6.492c-2.109.102-4.171 1.682-5.025 4.13-.443 1.182-.827 2.478-.804 3.795.165 1.516 1.552 
        1.902 2.579 2.015 2.08.195 4.44-.633 5.565-2.993.944-1.802.454-4.154-.317-5.906-.451-.77-1.264-1.067-1.998-1.041zm4.898.038c-.312.701-.373 2.242-.504 
        3.223-.185 2.066-.129 4.172-.34 6.223.315 1.179.258-1.233.48-1.612.103-1.151.768-2.377 1.695-1.327 1.022.394 1.899 2.398 2.562 
        2.499-.446-1.542-1.405-2.792-2.531-3.601-.386-1.178 1.158-1.723 1.635-2.666.469-.711 1.358-1.386 1.38-2.33-.669.358-1.132 
        1.593-1.806 2.176-.723.573-1.715 2.471-2.451 1.416.019-1.274-.038-2.557.028-3.824.096-.124-.104-.154-.148-.177zm-4.664.906c1.16.243 1.59 
        1.786 1.793 3.04.45 2.213-.876 4.446-2.556 5.06-1.235.492-2.688.575-3.853-.21-1.247-.924-.832-2.93-.34-4.27.558-1.667 1.613-3.286 3.148-3.476.597-.076 1.208-.219 1.807-.143z`
      ];
      break;
    case "select":
      paths = [
        `M5.99.379v.801h.799V.379zm5.609 0v.801h.801V.379zm5.611 0v.801h.799V.379zM1.18.447a1.12 1.12 0 0 0-.455.277 1.12 1.12 0 0 
        0-.277.455h.732zm21.641 0v.732h.732a1.12 1.12 0 0 0-.277-.455 1.12 1.12 0 0 0-.455-.277zM.379 5.99v.799h.801V5.99zm5.611 
        0v12.02h12.02V5.99zm16.83 0v.799h.801V5.99zm-16.119.332h10.598a.379.379 0 0 1 .379.379v10.598a.379.379 0 0 1-.379.379H6.701a.379.379 
        0 0 1-.379-.379V6.701a.379.379 0 0 1 .379-.379zM.379 11.6v.801h.801V11.6zm22.441 0v.801h.801V11.6zM.379 17.211v.799h.801v-.799zm22.441 
        0v.799h.801v-.799zM.447 22.82a1.12 1.12 0 0 0 .277.455 1.12 1.12 0 0 0 .455.277v-.732zm5.543 0v.801h.799v-.801zm5.609 0v.801h.801v-.801zm5.611 
        0v.801h.799v-.801zm5.609 0v.734a1.13 1.13 0 0 0 .457-.273 1.07 1.07 0 0 0 .277-.461z`
      ];
      transform = "scale(0.8)translate(5,5)";
      break;
    case "loop":
      paths = [
        "m 21,13 v 2 a 4,4 0 0 1 -4,4 H 3 M 7,23 3,19 7,15 M 3,11 V 9 A 4,4 0 0 1 7,5 h 14 m -4,-4 4,4 -4,4"
      ];
      break;
    case "play":
      paths = [
        "m 10,8 6,4 -6,4 z m 12,4 A 10,10 0 0 1 12,22 10,10 0 0 1 2,12 10,10 0 0 1 12,2 10,10 0 0 1 22,12 Z"
      ];
      break;
    case "stop":
      paths = [
        "m 9,9 h 6 v 6 H 9 Z m 13,3 A 10,10 0 0 1 12,22 10,10 0 0 1 2,12 10,10 0 0 1 12,2 10,10 0 0 1 22,12 Z"
      ];
      break;
    case "speed":
      paths = [
        `M15.214 4.176c-1.246.006-.633-2.065.408-1.358.594.373.299 1.396-.408 1.358zm-.084 17.126c-1.246.006-.633-2.065.408-1.358.594.373.299 1.396-.408 1.358zm4.47-13.484c-1.246.006-.633-2.065.408-1.358.594.373.299 1.396-.408 1.358zm-.084 9.928c-1.246.006-.633-2.065.408-1.358.594.373.299 1.396-.408 1.358zm1.481-5.007c-1.246.006-.633-2.065.408-1.358.594.373.299 1.396-.408 1.358zm-8.995 9.16c-3.861.06-7.583-2.498-9.004-6.149-1.429-3.445-.69-7.67 1.805-10.411 1.814-2.04 4.49-3.269 7.199-3.24-.027.398.18 1.022-.464.807-4.129.077-7.883 3.534-8.386 7.705-.411 2.825.457 5.854 2.507 7.846a8.63 8.63 0 0 0 6.342 2.646v.797zm0-8.364c-1.128.077-1.916-1.348-1.313-2.304L8.566 9.041c.242-.15.483-.774.727-.344l1.956 1.965c.812-.448 1.96-.078 2.202.876.308.961-.435 2.045-1.448 1.997z`
      ];
      break;
    case "copy":
      paths = [
        `M 5,15 H 4 A 2,2 0 0 1 2,13 V 4 A 2,2 0 0 1 4,2 h 9 a 2,2 0 0 1 2,2 v 1 m -4,4 h 9 c 1.108,0 2,0.892 2,2 v 9 c 0,1.108 -0.892,2 
        -2,2 H 11 C 9.892,22 9,21.108 9,20 V 11 C 9,9.892 9.892,9 11,9 Z`
      ];
      break;
    case "paste":
      paths = [
        `m 9,2 h 6 c 0.554,0 1,0.446 1,1 v 2 c 0,0.554 -0.446,1 -1,1 H 9 C 8.446,6 8,5.554 8,5 V 3 C 8,2.446 8.446,2 9,2 Z m 
        7,2 h 2 a 2,2 0 0 1 2,2 v 14 a 2,2 0 0 1 -2,2 H 6 A 2,2 0 0 1 4,20 V 6 A 2,2 0 0 1 6,4 h 2`
      ];
      break;
    case "lock":
      paths = [
        `M 7,11 V 7 a 5,5 0 0 1 10,0 v 4 M 5,11 h 14 c 1.108,0 2,0.892 2,2 v 7 c 0,1.108 -0.892,2 -2,2 H 5 C 3.892,22 3,21.108 3,20 
        v -7 c 0,-1.108 0.892,-2 2,-2 z`
      ];
      break;
    case "unlock":
      paths = [
        `M 7,11 V 7 A 5,5 0 0 1 16.9,6 M 5,11 h 14 c 1.108,0 2,0.892 2,2 v 7 c 0,1.108 -0.892,2 -2,2 H 5 C 3.892,22 3,21.108 3,20 
          v -7 c 0,-1.108 0.892,-2 2,-2 z`
      ];
      break;
    case "download":
      paths = [
        `M 12,15 V 3 m -5,7 5,5 5,-5 m 4,5 v 4 a 2,2 0 0 1 -2,2 H 5 A 2,2 0 0 1 3,19 v -4`
      ];
      break;
    case "menu":
      paths = [
        `m 13,19 a 1,1 0 0 1 -1,1 1,1 0 0 1 -1,-1 1,1 0 0 1 1,-1 1,1 0 0 1 1,1 z M 13,5 a 1,1 0 0 1 -1,1 1,1 0 0 1 -1,-1 1,1 0 
        0 1 1,-1 1,1 0 0 1 1,1 z m 0,7 a 1,1 0 0 1 -1,1 1,1 0 0 1 -1,-1 1,1 0 0 1 1,-1 1,1 0 0 1 1,1 z`
      ];
      break;
    case "back":
      paths = [
        `M 16.520795,21.362406 7.4791972,11.999999 16.520795,2.6375928`
      ];
      break;
    case "checkbox-empty":
      paths = [
        `M3.11 1.334c-.538 0-.863.134-1.253.523-.389.39-.523.715-.523 1.252v21.782c0 .537.134.862.523 
        1.252.389.388.716.523 1.254.523l21.778.002c.538 0 .865-.135 
        1.254-.523.388-.389.523-.716.523-1.254V3.109c0-.539-.133-.863-.521-1.252-.389-.388-.716-.523-1.254-.523zm0 .441h21.78a1.334 1.334 0 0 
        1 1.335 1.334v21.78a1.334 1.334 0 0 1-1.334 1.334H3.11a1.334 1.334 0 0 
        1-1.334-1.334l-.002-21.78A1.334 1.334 0 0 1 3.11 1.775z`
      ];
      break;
    case "checkbox-checked":
      paths = [
        `M2.928 1.314c-.494 0-.784.12-1.139.475s-.475.645-.475 1.139v20.498c0 .494.119.78.475 
        1.137.356.356.647.476 1.139.476h20.498c.492 0 .78-.12 
        1.137-.477s.476-.644.476-1.136v-9.49l-.299.298v9.192a1.315 1.315 0 0 1-1.314 
        1.314H2.928a1.315 1.315 0 0 1-1.315-1.314V2.928a1.315 1.315 0 0 1 1.315-1.315h18.304l.3-.299zm23.004 
        3.493L13.41 17.327a1.315 1.315 0 0 1-1.86 0l-5.29-5.292-.192.19 6.412 6.412L26.125 4.994z`
      ];
      break;

      default: [
        paths = []
      ];
      break;
  }
  return { paths, transform };
}

export default MyIcon;