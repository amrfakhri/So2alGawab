import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

import App from './App';

registerRootComponent(App);
