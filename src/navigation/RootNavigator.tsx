import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from '../features/home/screens/HomeScreen';
import { GameSetupScreen } from '../features/setup/screens/GameSetupScreen';
import { TeamSetupScreen } from '../features/setup/screens/TeamSetupScreen';
import { CountdownScreen } from '../features/game/screens/CountdownScreen';
import { QuestionScreen } from '../features/game/screens/QuestionScreen';
import { FeedbackScreen } from '../features/game/screens/FeedbackScreen';
import { ResultsScreen } from '../features/results/screens/ResultsScreen';
import { SelectionBoardScreen } from '../features/game/screens/SelectionBoardScreen';
import { AuthStartScreen } from '../features/auth/screens/AuthStartScreen';
import { EmailLoginScreen } from '../features/auth/screens/EmailLoginScreen';
import { SignUpScreen } from '../features/auth/screens/SignUpScreen';
import { GamesScreen } from '../features/games/screens/GamesScreen';
import { RanksScreen } from '../features/ranks/screens/RanksScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { GameMode } from '../features/game/types/game';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { dark } from '../shared/theme/tokens';

// ─── Param lists ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  AuthStart: undefined;
  EmailLogin: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Games: undefined;
  Ranks: undefined;
  Profile: undefined;
  GameSetup: undefined;
  TeamSetup: undefined;
  Countdown: { gameMode: GameMode };
  Question: undefined;
  Feedback: undefined;
  Results: undefined;
  SelectionBoard: undefined;
};

// Keep the union for backwards compatibility with existing navigation.navigate calls
export type RootStackParamList = AuthStackParamList & AppStackParamList;

// ─── Navigators ───────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack  = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <AuthStack.Screen name="AuthStart"   component={AuthStartScreen} />
      <AuthStack.Screen name="EmailLogin"  component={EmailLoginScreen} />
      <AuthStack.Screen name="SignUp"      component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <AppStack.Screen name="Home"    component={HomeScreen}    options={{ animation: 'fade' }} />
      <AppStack.Screen name="Games"   component={GamesScreen}   options={{ animation: 'fade' }} />
      <AppStack.Screen name="Ranks"   component={RanksScreen}   options={{ animation: 'fade' }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ animation: 'fade' }} />
      <AppStack.Screen name="GameSetup"      component={GameSetupScreen} />
      <AppStack.Screen name="TeamSetup"      component={TeamSetupScreen} />
      <AppStack.Screen name="Countdown"      component={CountdownScreen} />
      <AppStack.Screen name="Question"       component={QuestionScreen} />
      <AppStack.Screen name="Feedback"       component={FeedbackScreen} />
      <AppStack.Screen name="Results"        component={ResultsScreen} />
      <AppStack.Screen name="SelectionBoard" component={SelectionBoardScreen} />
    </AppStack.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);

  return (
    <NavigationContainer>
      {status === 'initializing' ? (
        <View style={styles.splash}>
          <ActivityIndicator color={dark.textAccent} size="large" />
        </View>
      ) : status === 'authenticated' || status === 'guest' ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: dark.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
