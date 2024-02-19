import { View } from 'react-native';
import logoData from './my-path.json'
import MyPreview from '@c/my-preview';

const MyPathLogo = ({ width, height, animate }) =>
    <View style={{ width: width, height: height }}>
        <MyPreview data={logoData} animate={animate} />
    </View>

export default MyPathLogo