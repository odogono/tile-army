import { createLogger } from '@helpers/log';
import { Slot } from '@helpers/router';
import * as SplashScreen from 'expo-splash-screen';
import { Suspense, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

const log = createLogger('_layout');

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Loading = () => (
  <View style={LoadingStyle.container}>
    <Text>Loading...</Text>
  </View>
);

const LoadingStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const RootLayout = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  log.info('RootLayout mounted');

  return (
    <Suspense fallback={<Loading />}>
      <Slot />
    </Suspense>
  );
};

export default RootLayout;
