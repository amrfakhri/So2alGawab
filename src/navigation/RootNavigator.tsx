import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GameSetupScreen } from '../features/setup/screens/GameSetupScreen';
import { QuestionScreen } from '../features/game/screens/QuestionScreen';
import { FeedbackScreen } from '../features/game/screens/FeedbackScreen';
import { ResultsScreen } from '../features/results/screens/ResultsScreen';

export type RootStackParamList = {
  GameSetup: undefined;
  Question: undefined;
  Feedback: undefined;
  Results: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GameSetup" component={GameSetupScreen} />
        <Stack.Screen name="Question" component={QuestionScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
