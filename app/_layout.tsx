import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ProjectsProvider } from "@/context/ProjectsContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function AppShell() {
  const { palette } = useTheme();

  return (
    <>
      <StatusBar style={palette.isDark ? "light" : "dark"} />
      <ProjectsProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </ProjectsProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
