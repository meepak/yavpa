
import React from "react";
import { Image } from "react-native-svg";
import { ImageDataType } from "@u/types";


class MyPathImage extends React.PureComponent<{ prop: ImageDataType, keyProp: string }> {

    render() {
        if (this.props.prop.type !== "image") {
            return null;
        }


        return (
            <Image
                x={this.props.prop.x}
                y={this.props.prop.y}
                width={this.props.prop.width}
                height={this.props.prop.height}
                preserveAspectRatio="xMidYMid slice"
                opacity={this.props.prop.opacity}
                href={{ uri: this.props.prop.data } as any}
                key={this.props.prop.guid}
                transform={`rotate(${this.props.prop.rotation} ${this.props.prop.x + this.props.prop.width / 2} ${this.props.prop.y + this.props.prop.height / 2}) scale(${this.props.prop.scale})`}
            />
        );
    }
}

export default MyPathImage
