import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrapper}>
      <Text style={[styles.iconLabel, focused && styles.iconLabelFocused]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#000",
        tabBarInactiveTintColor: "#aaa",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="홈" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: "목록",
          tabBarIcon: ({ focused }) => (
            <TabIcon label="목록" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    height: 60,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#aaa",
  },
  iconLabelFocused: {
    color: "#000",
    fontWeight: "700",
  },
});
