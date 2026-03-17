import React, { forwardRef } from "react";
import { ScrollView, StyleSheet, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

export const FocusZoneReader = forwardRef<
  ScrollView,
  {
    children: React.ReactNode;
    activeIndex?: number;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  }
>(function FocusZoneReader({ children, activeIndex = 0, onScroll }, ref) {
  return (
    <ScrollView
      ref={ref}
      style={styles.scroll}
      contentContainerStyle={styles.content}
      onScroll={onScroll}
      scrollEventThrottle={32}
    >
      {children}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 24 },
});
