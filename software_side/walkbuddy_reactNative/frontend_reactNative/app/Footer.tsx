import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, StyleSheet, Animated, Easing } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// `icon` is the solid/filled Ionicons name — the outline variant is
// derived by appending "-outline" for inactive tabs.
const TABS = [
  { icon: "home", route: "index" },
  { icon: "camera", route: "camera" },
  { icon: "business", route: "indoor" },
  { icon: "navigate", route: "exterior" },
  { icon: "book", route: "audiobooks" },
  { icon: "help-circle", route: "ask-a-friend-web" },
  { icon: "map", route: "places" },
  { icon: "compass", route: "predictive-path" },
];

const BAR_SIDE_PADDING = 8;

export default function Footer({ navigation }: any) {
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  const usable = segments.filter((s) => !s.startsWith("(") && s.length > 0);
  const currentRoute =
    usable.length === 0 ? "index" : usable[usable.length - 1];

  const activeIndex = useMemo(() => {
    const idx = TABS.findIndex((tab) => tab.route === currentRoute);
    return idx === -1 ? 0 : idx;
  }, [currentRoute]);

  const translateX = useRef(new Animated.Value(0)).current;

  const innerWidth = useMemo(() => {
    if (!barWidth) return 0;
    return barWidth - BAR_SIDE_PADDING * 2;
  }, [barWidth]);

  const slotWidth = useMemo(() => {
    if (!innerWidth) return 0;
    return innerWidth / TABS.length;
  }, [innerWidth]);

  // wider pill so it feels more flush at the edges
  const pillWidth = useMemo(() => {
    if (!slotWidth) return 0;
    return slotWidth + 6;
  }, [slotWidth]);

  const getIndicatorX = (index: number) => {
    if (!slotWidth || !pillWidth) return 0;
    return BAR_SIDE_PADDING + index * slotWidth + (slotWidth - pillWidth) / 2;
  };

  useEffect(() => {
    const targetX = getIndicatorX(activeIndex);

    Animated.timing(translateX, {
      toValue: targetX,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [activeIndex, slotWidth, pillWidth, translateX]);

  const isActive = (routeName: string) => currentRoute === routeName;

  return (
    <View style={[styles.footWrap, { paddingBottom: insets.bottom }]}>
      <View
        style={styles.bottomBar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
      >
        {barWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeLine,
              {
                width: pillWidth,
                transform: [{ translateX }],
              },
            ]}
          />
        )}

        {TABS.map((tab) => (
          <Pressable
            key={tab.route}
            style={({ pressed }) => [
              styles.bottomItem,
              pressed && styles.pressedItem,
            ]}
            onPress={() => navigation.navigate(tab.route)}
          >
            <Icon
              name={isActive(tab.route) ? tab.icon : `${tab.icon}-outline`}
              size={26}
              color={isActive(tab.route) ? "#5B9BD5" : "#B0B3B8"}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footWrap: {
    width: "100%",
    paddingHorizontal: 14,
    backgroundColor: "#000000",
  },

  bottomBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 14,
    paddingHorizontal: BAR_SIDE_PADDING,
    marginTop: 5,
    marginBottom: 6,
    overflow: "hidden",
  },

  bottomItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  activeLine: {
    position: "absolute",
    left: 0,
    bottom: 0,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#5B9BD5",

    // soft glow
    shadowColor: "#5B9BD5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 6,
    elevation: 10,
  },

  pressedItem: {
    transform: [{ scale: 0.96 }],
  },
});