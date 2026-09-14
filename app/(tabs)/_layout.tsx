import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/context/ThemeContext";

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "map-outline",
  features: "albums-outline",
  export: "download-outline",
  settings: "settings-outline",
};

export default function TabLayout() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          backgroundColor: palette.bgElevated,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 58 + bottomPadding,
          paddingTop: 6,
          paddingBottom: bottomPadding,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].replace("-outline", "") as keyof typeof Ionicons.glyphMap : TAB_ICONS[route.name]}
            size={size - 2}
            color={color}
          />
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "الخريطة" }} />
      <Tabs.Screen name="features" options={{ title: "العناصر" }} />
      <Tabs.Screen name="export" options={{ title: "التصدير" }} />
      <Tabs.Screen name="settings" options={{ title: "الإعدادات" }} />
    </Tabs>
  );
}
