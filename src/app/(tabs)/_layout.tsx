import { FontSize, Radius, Spacing } from "@/constants/theme";
import { useThemeColors } from "@/contexts/ThemeContext";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  index: { active: "house.fill", inactive: "house" },
  list: { active: "list.bullet", inactive: "list.bullet" },
  stats: { active: "chart.bar.fill", inactive: "chart.bar" },
  settings: { active: "gearshape.fill", inactive: "gearshape" },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const C = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingBottom: insets.bottom + Spacing.sm },
      ]}
    >
      <View style={[styles.tabBar, { backgroundColor: C.white }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const label = descriptors[route.key].options.title ?? route.name;
          const icons = TAB_ICONS[route.name] ?? {
            active: "circle.fill",
            inactive: "circle",
          };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
                isFocused && [
                  styles.tabActive,
                  { backgroundColor: C.accentLight },
                ],
              ]}
            >
              <SymbolView
                name={
                  isFocused ? (icons.active as any) : (icons.inactive as any)
                }
                size={22}
                tintColor={isFocused ? C.primary : C.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isFocused ? C.primary : C.textMuted },
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="list" options={{ title: "내역" }} />
      <Tabs.Screen name="stats" options={{ title: "통계" }} />
      <Tabs.Screen name="settings" options={{ title: "설정" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  tabBar: {
    flexDirection: "row",
    borderRadius: Radius.xl + Radius.sm,
    height: 64,
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.xl,
  },
  tabActive: {},
  tabLabel: {
    fontSize: FontSize.label,
  },
  tabLabelActive: {
    fontWeight: "700",
  },
});
