// app/(tabs)/index.tsx
import { useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";

import HomeHeader from "../HomeHeader";
import { useSession } from "../../src/context/SessionContext";

type DestinationType = "I" | "E";

export default function HomePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { auth } = useSession();

  const displayName = useMemo(() => {
    if (auth.status === "loggedInWithProfile" && auth.profile.displayName) {
      return auth.profile.displayName;
    }
    return "there";
  }, [auth]);

  const greeting = `Hi ${displayName}`;

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType | null>(null);

  const hasDestination = query.trim().length > 0;

  const contentWidth = useMemo(() => {
    const padding = 24;
    const max = 720;
    return Math.min(max, Math.max(320, width - padding * 2));
  }, [width]);

  const goToEmergency = () => router.push("/emergency" as any);
  const goToCamera = () => router.push("/camera");


  const openSearch = () => {
    setQuery("");
    setDestinationType(null);
    setShowSearch(true);
  };

  const closeSearch = () => {
    setShowSearch(false);
    setQuery("");
    setDestinationType(null);
  };

  const onPressInterior = () => {
    if (!hasDestination) return;
    if (destinationType === "E") {
      Alert.alert(
        "Try Maps instead",
        "This looks like an outdoor destination. Use the MAPS button to navigate there."
      );
      return;
    }
    closeSearch();
    router.push({ pathname: "/indoor" } as any);
  };

  const onPressMaps = () => {
    if (!hasDestination) return;
    if (destinationType === "I") {
      Alert.alert(
        "Try Interior instead",
        "This looks like an indoor destination. Use the INTERIOR button to navigate there."
      );
      return;
    }
    const destinationText = query.trim();
    closeSearch();
    router.push({
      pathname: "exterior",
      params: { presetDestination: destinationText, presetType: "E" },
    } as any);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={[styles.content, { width: contentWidth }]}>
        <ScrollView
          style={styles.pageScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <HomeHeader
            greeting={greeting}
            appTitle="WalkBuddy"
            showDivider
          />

          <View style={styles.mainArea}>
            <BounceButton label="SEARCH" onPress={openSearch} search />

            <View style={styles.grid}>
              <ActionTile
                icon="camera"
                label="Open Smart Scanner"
                onPress={goToCamera}
                hint="Opens the camera to detect objects and read text aloud"
              />
              <ActionTile
                icon="exclamation-triangle"
                label="Click for Emergency"
                onPress={goToEmergency}
                emergency
                hint="Opens emergency contact options"
              />
            </View>
          </View>

        </ScrollView>
      </View>

      {/* ─── Search Modal ─── */}
      <Modal
        visible={showSearch}
        transparent
        animationType="fade"
        onRequestClose={closeSearch}
      >
        <Pressable style={styles.modalOverlay} onPress={closeSearch}>
          <Pressable onPress={() => {}} style={styles.modalCard}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Icon name="search" size={18} color={tokens.blue} />
              <Text style={styles.modalTitle}>Where to?</Text>
              <Pressable
                onPress={closeSearch}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close search"
              >
                <Icon name="times" size={20} color={tokens.muted} />
              </Pressable>
            </View>

            <View style={styles.modalDivider} />

            {/* Search input */}
            <View style={styles.searchBar}>
              <Icon name="search" size={16} color={tokens.muted} />
              <TextInput
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setDestinationType(null);
                }}
                placeholder="Enter a destination"
                placeholderTextColor={tokens.muted}
                style={styles.searchInput}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="search"
                autoFocus
                accessibilityLabel="Destination"
                accessibilityHint="Type a place to navigate to"
              />
              {query.length > 0 && (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search text"
                >
                  <Icon name="times-circle" size={16} color={tokens.muted} />
                </Pressable>
              )}
            </View>

            {/* Result preview */}
            {hasDestination && (
              <View style={styles.resultCard}>
                <Icon name="map-marker" size={20} color={tokens.blue} />
                <Text style={styles.resultTitle} numberOfLines={2}>
                  {query}
                </Text>
                <Text style={styles.resultSub}>Tap a mode below to navigate</Text>
              </View>
            )}

            {!hasDestination && (
              <View style={styles.emptyState}>
                <Icon name="location-arrow" size={28} color={tokens.muted} />
                <Text style={styles.emptyStateText}>
                  Type a destination to get started
                </Text>
              </View>
            )}

            <View style={styles.modalDivider} />

            {/* Mode buttons */}
            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.modeBtn, !hasDestination && styles.modeBtnDisabled]}
                onPress={onPressInterior}
                disabled={!hasDestination}
                accessibilityRole="button"
                accessibilityLabel="Navigate using interior route"
                accessibilityState={{ disabled: !hasDestination }}
              >
                <Icon name="building" size={18} color={hasDestination ? tokens.blue : tokens.muted} />
                <Text style={[styles.modeBtnText, !hasDestination && styles.modeBtnTextDisabled]}>
                  INTERIOR
                </Text>
              </Pressable>

              <Pressable
                style={[styles.modeBtn, styles.modeBtnblue, !hasDestination && styles.modeBtnDisabled]}
                onPress={onPressMaps}
                disabled={!hasDestination}
                accessibilityRole="button"
                accessibilityLabel="Navigate using maps route"
                accessibilityState={{ disabled: !hasDestination }}
              >
                <Icon name="map" size={18} color={hasDestination ? "#071a2a" : tokens.muted} />
                <Text style={[styles.modeBtnText, hasDestination && styles.modeBtnTextDark, !hasDestination && styles.modeBtnTextDisabled]}>
                  MAPS
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* COMPONENTS */

// Search button component with press animation
function BounceButton({ label, onPress, search }: { label: string; onPress: () => void; search?: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 28,
        bounciness: 6,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 10,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel="Search for a destination"
    >
      <Animated.View
        style={[styles.searchButton, { transform: [{ scale }] }]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.searchPressOverlay, { opacity: overlayOpacity }]}
        />
        <Icon
          name="search"
          size={20}
          color={tokens.text}
          style={styles.searchIcon}
        />
        <Text style={styles.searchText}>Search Location</Text>
      </Animated.View>
    </Pressable>
  );
}

// Feature card component with press animation
function ActionTile({
  icon,
  label,
  onPress,
  emergency,
  hint,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  emergency?: boolean;
  hint?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 28,
        bounciness: 6,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 22,
        bounciness: 10,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.tile}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={{ color: "#1B3A6B22" }}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={hint}
      >
        <Animated.View
          style={[
            styles.tileOuter,
            emergency && styles.tileOuterEmergency,
            { transform: [{ scale }] },
          ]}
        >
          <View style={[styles.tileInner, emergency && styles.tileInnerEmergency]}>
            <Animated.View
              pointerEvents="none"
              style={[styles.tilePressOverlay, { opacity: overlayOpacity }]}
            />

            <Icon
              name={icon}
              size={40}
              color="#ede5e5"
              style={styles.tileIcon}
            />

            <Text style={[styles.tileText, emergency && styles.tileTextEmergency]}>{label}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

/* TOKENS */

const tokens = {
  bg: "#000000",
  tile: "#0b0f14",
  card: "#0d141c",
  surface: "#151b24",
  modalBg: "#0f1e2e",
  modalField: "#162233",
  text: "#ede5e5",
  muted: "#b8c6d4",
  blue: "#5B9BD5",
  green: "#2ecc71",
  border: "rgba(255,255,255,0.14)",
  accentBorder: "rgba(91,155,213,0.4)",
  accentBorderSoft: "rgba(91,155,213,0.32)",
  accentDivider: "rgba(91,155,213,0.22)",
  accentResult: "rgba(91,155,213,0.28)",
};

/* STYLES */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.bg,
    alignItems: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 12,
  },

  pageScroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    gap: 18,
    paddingBottom: 120,
  },

  mainArea: {
    gap: 0,
    width: "100%",
    paddingTop: 10,
  },

  // Search button styling
  searchButton: {
  width: "100%",
  backgroundColor: tokens.surface,
  borderWidth: 2,
  borderColor: tokens.border,
  borderRadius: 10,
  paddingVertical: 18,
  paddingHorizontal: 20,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: 10,
  marginBottom: 12,
  overflow: "hidden",
  },

  // Search button icon
  searchIcon: {
    marginRight: 2,
  },

  // Press animation overlay
  searchPressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  // Search button text
  searchText: {
    color: "#ede5e5",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },

  sectionCard: {
    backgroundColor: tokens.card,
    borderRadius: 16,
    padding: 12,
  },

  sectionLabel: {
    color: tokens.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 6,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 22,
    gap: 10,
  },

  // Feature card container
  tile: {
    width: "100%",
    marginBottom:8,
  },

  // Feature card outer border
  tileOuter: {},

  // Emergency tile outer border — red instead of blue
  tileOuterEmergency: {},

  // Feature card content
  tileInner: {
    width: "100%",
    height: 200,
    backgroundColor: "#2e59a9",
    borderWidth: 2,
    borderColor: tokens.border,
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },

  // Emergency tile content: red rectangle, closer in size to Camera so it reads as
  // equally important rather than an afterthought
  tileInnerEmergency: {
    aspectRatio: undefined,
    height: 160,
    backgroundColor: "#c55353",
    borderColor: "#942121",
    paddingVertical: 20,
  },

  tilePressOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  // Feature card icon
  tileIcon: {},

  // Feature card title
  tileText: {
    color: "#ede5e5",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Emergency tile text — white for contrast on red
  tileTextEmergency: {
    color: "#ede5e5",
  },

  // ─── Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: tokens.modalBg,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: tokens.accentBorder,
    overflow: "hidden",
    shadowColor: tokens.blue,
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
    padding: 20,
    gap: 16,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  modalTitle: {
    color: tokens.text,
    fontSize: 20,
    fontWeight: "800",
    flex: 1,
  },

  modalDivider: {
    height: 1,
    backgroundColor: tokens.accentDivider,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: tokens.modalField,
    borderWidth: 1.5,
    borderColor: tokens.accentBorderSoft,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: tokens.text,
    fontSize: 15,
    fontWeight: "600",
  },

  resultCard: {
    backgroundColor: tokens.modalField,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: tokens.accentResult,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },

  resultTitle: {
    color: tokens.text,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  resultSub: {
    color: tokens.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
  },

  emptyStateText: {
    color: tokens.muted,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },

  modeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: tokens.modalField,
    borderWidth: 1.5,
    borderColor: tokens.accentBorderSoft,
    borderRadius: 14,
    paddingVertical: 14,
  },

  modeBtnblue: {
    backgroundColor: tokens.blue,
    borderColor: tokens.blue,
  },

  modeBtnDisabled: {
    opacity: 0.4,
  },

  modeBtnText: {
    color: tokens.text,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  modeBtnTextDark: {
    color: "#071a2a",
  },

  modeBtnTextDisabled: {
    opacity: 0.7,
  },
});
