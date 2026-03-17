import React, { useState, useRef, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Linking } from "react-native";
import { parseHandoffUrl } from "./src/utils/deepLinkHandoff";
import Constants from "expo-constants";
import { useShareIntent } from "expo-share-intent";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ImageFocusScreen } from "./src/screens/ImageFocusScreen";
import { LiveLensScreen } from "./src/screens/LiveLensScreen";
import { AudioIdentifyScreen } from "./src/screens/AudioIdentifyScreen";
import { ArticleScreen } from "./src/screens/ArticleScreen";
import { ShareIntakeScreen } from "./src/screens/ShareIntakeScreen";
import { TracePreviewScreen } from "./src/screens/TracePreviewScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { SceneExploreScreen } from "./src/screens/SceneExploreScreen";
import { CameraCaptureScreen } from "./src/screens/CameraCaptureScreen";
import { CapturedSceneReviewScreen } from "./src/screens/CapturedSceneReviewScreen";
import { NodeViewerScreen } from "./src/screens/NodeViewerScreen";
import { BranchViewerScreen } from "./src/screens/BranchViewerScreen";
import { ClaimViewerScreen } from "./src/screens/ClaimViewerScreen";
import { RelationEvidenceViewerScreen } from "./src/screens/RelationEvidenceViewerScreen";
import { ExplorationTransitionSlot } from "./src/experience/exploration-transition";
import { api } from "./src/api/client";
import { addHistoryEntry } from "./src/utils/historyStore";
import { trackEvent } from "./src/utils/analytics";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageLocationContext, setImageLocationContext] = useState<import("@rabbit-hole/contracts").LocationContext | null>(null);

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="Home" options={{ title: "Rabbit Hole" }}>
        {({ navigation, route }) => (
          <HomeScreen
            initialSearchQuery={(route.params as { initialSearchQuery?: string } | undefined)?.initialSearchQuery}
            onImageReady={(id, uri) => {
              setUploadId(id);
              setImageUri(uri);
              setImageLocationContext(null);
              navigation.navigate("ImageFocus", {});
            }}
            onOpenLiveLens={() => navigation.navigate("LiveLens", {})}
            onOpenShareIntake={() => navigation.navigate("ShareIntake", {})}
            onOpenShareIntakeWithText={(text: string) => navigation.navigate("ShareIntake", { sharedText: text })}
            onOpenShareIntakeWithCaptions={() => navigation.navigate("ShareIntake", { inputSource: "subtitle" })}
            onOpenAudioIdentify={() => navigation.navigate("AudioIdentify", {})}
            onOpenSceneExplore={() => navigation.navigate("SceneExplore", {})}
            onOpenCameraCapture={() => navigation.navigate("CameraCapture", {})}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="LiveLens" options={{ title: "Live Lens" }}>
        {({ navigation }) => (
          <LiveLensScreen
            onImageReady={(id, uri, locationContext) => {
              setUploadId(id);
              setImageUri(uri);
              setImageLocationContext(locationContext ?? null);
              navigation.navigate("ImageFocus", {});
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="AudioIdentify" options={{ title: "Identify audio" }}>
        {() => <AudioIdentifyScreen />}
      </Stack.Screen>
      <Stack.Screen name="ImageFocus" options={{ title: "Tap to explore" }}>
        {({ navigation }) => (
          <ExplorationTransitionSlot
            capturedImageUri={imageUri}
            triggerTransition={true}
          >
            <ImageFocusScreen
              uploadId={uploadId!}
              imageUri={imageUri!}
              locationContext={imageLocationContext ?? undefined}
              onSelectArticle={(articleId) => {
                trackEvent("article_opened", { source: "image", articleId });
                addHistoryEntry({ articleId, title: "", source: "image" });
                navigation.navigate("Article", { articleId });
              }}
            />
          </ExplorationTransitionSlot>
        )}
      </Stack.Screen>
      <Stack.Screen name="Article" options={{ title: "Article" }}>
        {() => <ArticleScreen />}
      </Stack.Screen>
      <Stack.Screen name="ShareIntake" options={{ title: "Open in Rabbit Hole" }}>
        {() => <ShareIntakeScreen />}
      </Stack.Screen>
      <Stack.Screen name="TracePreview" options={{ title: "Trace" }}>
        {({ route, navigation }) => (
          <TracePreviewScreen
            nodeId={(route.params as { nodeId: string }).nodeId}
            onOpenNode={(nodeId) =>
              api.getArticleByNode(nodeId).then((a) => {
                trackEvent("article_opened", { source: "trace", articleId: a.id });
                addHistoryEntry({
                  articleId: a.id,
                  title: a.title,
                  subtitle: a.blocks?.find((b) => b.blockType === "identification")?.text,
                  source: "trace",
                });
                navigation.navigate("Article", { articleId: a.id });
              })
            }
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CameraCapture" options={{ title: "Capture object" }}>
        {({ navigation }) => (
          <CameraCaptureScreen
            onCaptured={(envelope, imageUri) =>
              navigation.navigate("CapturedSceneReview" as never, { envelope, imageUri } as never)
            }
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CapturedSceneReview" options={{ title: "Select object" }}>
        {() => <CapturedSceneReviewScreen />}
      </Stack.Screen>
      <Stack.Screen name="SceneExplore" options={{ title: "Tap to explore" }}>
        {({ navigation }) => (
          <SceneExploreScreen
            onOpenNode={(node) => navigation.navigate("NodeViewer" as never, { node } as never)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="NodeViewer" options={{ title: "Node" }}>
        {() => <NodeViewerScreen />}
      </Stack.Screen>
      <Stack.Screen name="BranchViewer" options={{ title: "Branch" }}>
        {() => <BranchViewerScreen />}
      </Stack.Screen>
      <Stack.Screen name="ClaimViewer" options={{ title: "Claim" }}>
        {() => <ClaimViewerScreen />}
      </Stack.Screen>
      <Stack.Screen name="RelationEvidenceViewer" options={{ title: "Why this connection?" }}>
        {() => <RelationEvidenceViewerScreen />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function HistoryTab() {
  return <HistoryScreen />;
}

function SettingsTab() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings (stub)</Text>
    </View>
  );
}

export default function App() {
  const navigationRef = useRef<any>(null);
  const [isNavReady, setIsNavReady] = useState(false);
  const isExpoGo = Constants.appOwnership === "expo";
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent({ disabled: isExpoGo });

  useEffect(() => {
    if (!hasShareIntent || !shareIntent || !isNavReady || !navigationRef.current) return;
    const text = (shareIntent.webUrl || shareIntent.text || "").trim();
    if (!text) {
      resetShareIntent();
      return;
    }
    // Route to Share Intake (single source of truth for shared text/URL).
    // Requires development build; does not work in Expo Go.
    navigationRef.current.navigate("Explore", { screen: "ShareIntake", params: { sharedText: text } });
    // Reset after a tick so the screen has committed the params.
    setTimeout(() => resetShareIntent(), 0);
  }, [hasShareIntent, shareIntent, isNavReady, resetShareIntent]);

  // Browser extension handoff: rabbit-hole://share?text=... opens Share Intake with sharedText.
  useEffect(() => {
    if (!isNavReady || !navigationRef.current) return;
    const handleUrl = (url: string) => {
      const sharedText = parseHandoffUrl(url);
      if (sharedText)
        navigationRef.current?.navigate("Explore", { screen: "ShareIntake", params: { sharedText } });
    };
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const sub = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, [isNavReady]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => setIsNavReady(true)}
    >
      <Tab.Navigator>
        <Tab.Screen name="Explore" options={{ title: "Home", headerShown: false }} component={HomeStack} />
        <Tab.Screen name="History" component={HistoryTab} />
        <Tab.Screen name="Settings" component={SettingsTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
