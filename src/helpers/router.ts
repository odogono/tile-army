import { router as expoRouter } from 'expo-router';
import type { Router, Href } from 'expo-router';

export { Redirect, Slot, Stack, useLocalSearchParams } from 'expo-router';

// https://github.com/expo/router/discussions/495

interface ExtendedRouter extends Router {
  reset: <T extends string | object>(href: Href<T>) => void;
}

export const router: ExtendedRouter = {
  ...expoRouter,
  reset<T extends string | object>(route: Href<T>) {
    if (router.canGoBack()) router.dismissAll();
    router.replace(route);
  },
};
