
import React from 'react';
import {Brushes, getBrush} from '@c/controls/my-brushes';
import {Path} from 'react-native-svg';
import {type BrushType, type PathDataType} from '@u/types';
import {isValidPath} from '@u/helper';
import myConsole from './my-console-log';

class MyPath extends React.PureComponent<{prop: PathDataType; keyProp: string; }> {
	static defaultProps = {
		showMarker: false,
	};

	render() {
		// Below region is for regular paths
		if (this.props.prop.type !== 'd') {
			return null;
		}

		if (!isValidPath(this.props.prop.path)) {
			myConsole.log('MyPath was given invalid path data - ', this.props.prop.path, ' -', this.props.prop.guid);
			return null;
		}

		let brush: BrushType | undefined;
		if (this.props.prop.stroke.startsWith('url(#')) {
			const brushGuid = this.props.prop.stroke.slice(5, -1);
			brush = Brushes.find(brush => brush.params.guid === brushGuid);
		}

		return (
			<React.Fragment key={`${this.props.keyProp}-${this.props.prop.updatedAt}`}>
				{brush && getBrush(brush)}
				<Path
					d={this.props.prop.path}
					stroke={this.props.prop.stroke}
					strokeWidth={this.props.prop.strokeWidth}
					strokeLinecap={this.props.prop.strokeCap}
					strokeLinejoin={this.props.prop.strokeJoin}
					opacity={this.props.prop.strokeOpacity}
					fill= {this.props.prop.fill ?? 'none'}
					strokeDasharray={this.props.prop.strokeDasharray ?? undefined}
					strokeDashoffset={this.props.prop.strokeDashoffset ?? undefined}
				/>
			</React.Fragment>
		);
	}
}

export default MyPath;
