import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Svg, { Circle } from 'react-native-svg';

type SessionStep = 'intention' | 'breathe' | 'active';

function getStepText(step: SessionStep): string {
  if (step === 'intention') {
    return 'Step 1 of 3';
  } else if (step === 'breathe') {
    return 'Step 2 of 3';
  } else {
    return 'Focus';
  }
}

export default function ActiveSessionScreen() {
  const [step, setStep] = useState<SessionStep>('intention');
  const [intention, setIntention] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleClose = () => {
    router.back();
  };

  const renderStep = () => {
    switch (step) {
      case 'intention':
        return (
          <IntentionStep
            intention={intention}
            setIntention={setIntention}
            onNext={() => setStep('breathe')}
          />
        );
      case 'breathe':
        return <BreatheStep onNext={() => setStep('active')} onSkip={() => setStep('active')} />;
      case 'active':
        return <ActiveTimerStep intention={intention || 'Morning Silence'} onEnd={handleClose} />;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.iconButton}>
          <IconSymbol name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerLabel}>
            {step === 'active' ? 'IN SESSION' : 'PREPARATION'}
          </ThemedText>
          <ThemedText style={styles.headerStep}>{getStepText(step)}</ThemedText>
        </View>
        <View style={styles.iconButtonPlaceholder} />
      </View>

      {/* Progress Bar */}
      {step !== 'active' && (
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              { backgroundColor: colorScheme === 'light' ? '#e2e8f0' : '#1e293b' },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.primary,
                  width: step === 'intention' ? '33.33%' : '66.66%',
                },
              ]}
            />
          </View>
        </View>
      )}

      {renderStep()}
    </ThemedView>
  );
}

/* --- STEP 1: INTENTION --- */
interface IntentionStepProps {
  intention: string;
  setIntention: (value: string) => void;
  onNext: () => void;
}

function IntentionStep({ intention, setIntention, onNext }: IntentionStepProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const presets = [
    { label: 'Peace', icon: 'eco', color: theme.primary },
    { label: 'Gratitude', icon: 'heart.fill', color: '#f87171' },
    { label: 'Guidance', icon: 'sparkles', color: '#fbbf24' },
    { label: 'Healing', icon: 'auto.stories', color: '#a78bfa' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.stepContent} bounces={false}>
      <View style={styles.headlineContainer}>
        <ThemedText style={styles.headline}>Set your intention for this session.</ThemedText>
        <ThemedText style={styles.subheadline}>What is on your heart today?</ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.inputLabel}>Your Intention</ThemedText>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.surface,
              color: theme.text,
              borderColor: colorScheme === 'light' ? '#e2e8f0' : '#1e293b',
            },
          ]}
          placeholder="Write your own intention..."
          placeholderTextColor="#64748b"
          multiline
          value={intention}
          onChangeText={setIntention}
        />
      </View>

      <View style={styles.presetsSection}>
        <ThemedText style={styles.inputLabel}>Suggestions</ThemedText>
        <View style={styles.presetsGrid}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p.label}
              onPress={() => setIntention(p.label)}
              style={[
                styles.presetChip,
                {
                  backgroundColor: theme.surface,
                  borderColor: colorScheme === 'light' ? '#e2e8f0' : '#1e293b',
                },
              ]}
            >
              <IconSymbol name={p.icon as any} size={18} color={p.color} />
              <ThemedText style={styles.presetLabel}>{p.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title="Next" size="lg" onPress={onNext} />
        <View style={styles.privacyBadge}>
          <IconSymbol name="lock.fill" size={12} color="#94a3b8" />
          <ThemedText style={styles.privacyText}>YOUR DATA IS STORED LOCALLY ONLY</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

/* --- STEP 2: BREATHE --- */
interface BreatheStepProps {
  onNext: () => void;
  onSkip: () => void;
}

function BreatheStep({ onNext, onSkip }: BreatheStepProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const breathAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    );
    animation.start();

    const timer = setTimeout(onNext, 12000); // Auto-advance after 2 breath cycles
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [breathAnim, onNext]);

  const scale = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const opacity = breathAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <View style={styles.stepContentCenter}>
      <View style={styles.headlineContainer}>
        <ThemedText style={styles.headline}>Take a moment to settle your mind.</ThemedText>
        <ThemedText style={styles.subheadline}>
          Focus on the rhythm of your breath and find a quiet center.
        </ThemedText>
      </View>

      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.orbGlow,
            { backgroundColor: theme.primary, opacity, transform: [{ scale: 1.5 }] },
          ]}
        />
        <Animated.View
          style={[styles.orb, { backgroundColor: theme.primary, transform: [{ scale }] }]}
        >
          <View style={styles.orbInner}>
            <IconSymbol name="spa" size={48} color="#fff" style={{ opacity: 0.4 }} />
          </View>
        </Animated.View>
        <View style={[styles.orbRing, { borderColor: `${theme.primary}33` }]} />
      </View>

      <View style={styles.breathInstruction}>
        <Animated.View style={{ opacity: breathAnim }}>
          <ThemedText style={[styles.breathText, { color: theme.primary }]}>
            SLOWLY INHALE
          </ThemedText>
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            opacity: breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          }}
        >
          <ThemedText style={[styles.breathText, { color: theme.primary }]}>
            GENTLY EXHALE
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
          <ThemedText style={styles.skipText}>Skip preparation</ThemedText>
        </TouchableOpacity>
        <View style={styles.privacyBadge}>
          <IconSymbol name="database" size={12} color="#94a3b8" />
          <ThemedText style={styles.privacyText}>DATA STORED LOCALLY ON DEVICE</ThemedText>
        </View>
      </View>
    </View>
  );
}

/* --- STEP 3: ACTIVE TIMER --- */
function ActiveTimerStep({ intention, onEnd }: any) {
  const [seconds, setSeconds] = useState(899); // 14:59
  const [isActive, setIsActive] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  useEffect(() => {
    let interval: any;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = seconds / 900;
  const strokeDashoffset = 301.59 * progress;

  return (
    <View style={styles.timerStepContent}>
      <View style={styles.timerHeader}>
        <ThemedText style={styles.timerIntentionLabel}>{intention}</ThemedText>
      </View>

      <View style={styles.timerDisplayContainer}>
        <View style={[styles.timerGlow, { backgroundColor: theme.primary }]} />
        <View style={styles.timerRing}>
          <Svg width="320" height="320" viewBox="0 0 100 100">
            <Circle
              cx="50"
              cy="50"
              r="48"
              stroke={colorScheme === 'light' ? '#e2e8f0' : '#1e293b'}
              strokeWidth="0.5"
              fill="none"
            />
            <Circle
              cx="50"
              cy="50"
              r="48"
              stroke={theme.primary}
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </Svg>
        </View>
        <ThemedText style={styles.timerText}>{formatTime(seconds)}</ThemedText>
      </View>

      <View style={styles.timerControls}>
        <TouchableOpacity
          style={[
            styles.distractedButton,
            {
              backgroundColor: theme.surface,
              borderColor: colorScheme === 'light' ? '#e2e8f0' : '#1e293b',
            },
          ]}
        >
          <IconSymbol name="waves" size={20} color="#94a3b8" />
          <ThemedText style={styles.distractedText}>I&apos;m distracted</ThemedText>
        </TouchableOpacity>

        <View style={styles.playbackRow}>
          <TouchableOpacity
            onPress={onEnd}
            style={[styles.controlButtonSmall, { backgroundColor: `${theme.surface}80` }]}
          >
            <IconSymbol name="close" size={24} color={theme.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsActive(!isActive)}
            style={[styles.controlButtonLarge, { backgroundColor: theme.primary }]}
          >
            <IconSymbol name={isActive ? 'pause.fill' : 'play.fill'} size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButtonSmall, { backgroundColor: `${theme.surface}80` }]}
          >
            <IconSymbol name="volume.up.fill" size={24} color={theme.muted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPlaceholder: {
    width: 40,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#64748b',
  },
  headerStep: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  stepContentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subheadline: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    borderRadius: 20,
    padding: 20,
    height: 160,
    fontSize: 18,
    borderWidth: 1,
    textAlignVertical: 'top',
  },
  presetsSection: {
    marginBottom: 40,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    gap: 8,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    gap: 16,
    width: '100%',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    opacity: 0.5,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  orbContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  orbGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    blur: 40,
  },
  orb: {
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(17, 82, 212, 1)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 0px 20px rgba(17, 82, 212, 0.5)',
      },
    }),
  },
  orbInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRing: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 1,
  },
  breathInstruction: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  timerStepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  timerHeader: {
    marginBottom: 40,
  },
  timerIntentionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerDisplayContainer: {
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timerGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.1,
    blur: 60,
  },
  timerRing: {
    position: 'absolute',
    opacity: 0.2,
  },
  timerText: {
    fontSize: 88,
    fontWeight: '200',
    letterSpacing: -2,
  },
  timerControls: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    gap: 40,
    width: '100%',
  },
  distractedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
  },
  distractedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  controlButtonSmall: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(17, 82, 212, 1)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(17, 82, 212, 0.3)',
      },
    }),
  },
});
