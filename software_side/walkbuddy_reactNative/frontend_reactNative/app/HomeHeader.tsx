import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useRouter, useSegments } from "expo-router";

type Props = {
  greeting?: string;
  appTitle?: string;
  onPressProfile?: () => void;
  showDivider?: boolean;
};

function titleCaseFromSegment(seg: string) {
  const cleaned = (seg ?? "").replace(/[-_]/g, " ").trim();
  if (!cleaned) return "";
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getRouteNameFromSegments(segments: string[]) {
  const usable = segments.filter((s) => !s.startsWith("(") && s.length > 0);
  if (usable.length === 0) return "";
  const last = usable[usable.length - 1];
  if (last.toLowerCase() === "index") return "Home";
  return titleCaseFromSegment(last);
}

function isHomeBySegments(segments: string[]) {
  const usable = segments.filter((s) => !s.startsWith("(") && s.length > 0);
  if (usable.length === 0) return true;
  const last = (usable[usable.length - 1] ?? "").toLowerCase();
  return last === "home" || last === "index";
}

export default function HomeHeader({
  greeting = "Hi there 👋",
  appTitle = "WalkBuddy",
  onPressProfile,
  showDivider = true,
}: Props) {
  const router = useRouter();
  const segments = useSegments();

  const derived = useMemo(() => {
    const onHome = isHomeBySegments(segments);
    const routeName = getRouteNameFromSegments(segments);
    const leftText = onHome ? greeting : routeName || "Page";

    return { leftText, onHome };
  }, [segments, greeting]);

  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
      return;
    }
    router.push("/profile" as any);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={handleProfilePress}
          hitSlop={10}
          style={styles.profileBtn}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Icon name="user-circle" size={38} color={tokens.accent} />
        </Pressable>

        <View style={styles.welcomeCol}>
          <Text style={styles.welcomeText} numberOfLines={1}>
            Welcome
          </Text>
          <Text style={styles.username} numberOfLines={1}>
            {derived.leftText}
          </Text>
        </View>

        {derived.onHome && (
          <Text style={styles.title} numberOfLines={1}>
            {appTitle}
          </Text>
        )}
      </View>

      {showDivider && <View style={styles.topDivider} />}
    </View>
  );
}

const tokens = {
  bg: "#000000",
  tile: "#0b0f14",
  text: "#F5F5F5",
  muted: "#9BB0CC",
  accent: "#5B9BD5",
  divider: "rgba(91,155,213,0.5)",
};

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    paddingBottom: 6,
    backgroundColor: "#000000",
  },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 18,
  },

  // Welcome/username column
  welcomeCol: {
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
  },

  welcomeText: {
    color: tokens.muted,
    fontSize: 14,
    fontWeight: "600",
  },

  username: {
    color: tokens.text,
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },

  // Application title styling — only shown on the home screen, so it stays
  // secondary to the personalised greeting/username
  title: {
    color: tokens.text,
    fontSize: 22,
    fontWeight: "700",
  },

  // Profile button styling
  profileBtn: {
    width: 44,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  topDivider: {
    borderBottomWidth: 2,
    borderBottomColor: tokens.divider,
    borderRadius: 5,
  },
});