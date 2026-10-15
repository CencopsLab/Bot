import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ApiError } from '@/api/client';
import { checkQuizAnswer, fetchQuizQuestions } from '@/api/quizApi';
import { getTheme } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type {
  ScamQuizAnswer,
  ScamQuizQuestion,
  ScamQuizType,
} from '@/types';
import type { RootStackParamList } from '@/navigation/types';
import { useLanguage } from '@/i18n/LanguageContext';

const SCORE_STORAGE_KEY = 'CyberRakshak:quiz_best_scores';

const QUIZ_TYPES: {
  id: ScamQuizType;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'link', icon: 'link-outline' },
  { id: 'email', icon: 'mail-outline' },
  { id: 'sms', icon: 'chatbubble-ellipses-outline' },
  { id: 'phone', icon: 'call-outline' },
  { id: 'file', icon: 'document-outline' },
];

const CONFETTI_COLORS = [
  '#FFBE2E',
  '#00A6A0',
  '#CD2026',
  '#112E51',
  '#7B61FF',
  '#FF4F81',
  '#36C98F',
] as const;

const CONFETTI_COUNT = 220;
const POPPER_COUNT = 24;

const CONFETTI_PIECES = Array.from(
  { length: CONFETTI_COUNT },
  (_, index) => {
    const angle = index * 2.399963229728653;
    const spread =
      70 + Math.sqrt((index + 1) / CONFETTI_COUNT) * 340;

    return {
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      size: 4 + (index % 5) * 1.6,
      spin: index % 2 === 0 ? 1 : -1,
      translateX: Math.cos(angle) * spread,
      translateY: Math.sin(angle) * spread,
      gravity: 80 + (index % 6) * 24,
      duration: 1100 + (index % 5) * 140,
    };
  }
);

type SavedScores = Partial<Record<ScamQuizType, number>>;
type Navigation = NativeStackNavigationProp<RootStackParamList>;
type CelebrationLevel = 1 | 2;

function parseSavedScores(value: string | null): SavedScores {
  if (value === null) return {};

  const parsed: unknown = JSON.parse(value);

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    Array.isArray(parsed)
  ) {
    throw new Error('Saved quiz scores are not valid.');
  }

  const scores: SavedScores = {};

  for (const { id } of QUIZ_TYPES) {
    const score = (parsed as Record<string, unknown>)[id];

    if (score !== undefined) {
      if (
        !Number.isSafeInteger(score) ||
        Number(score) < 0 ||
        Number(score) > 10
      ) {
        throw new Error('Saved quiz scores are not valid.');
      }

      scores[id] = Number(score);
    }
  }

  return scores;
}

function formatStory(story: string, language: string): string {
  const trimmedStory = story.trim();
  if (!trimmedStory) return trimmedStory;

  const capitalizedStory = language === 'en'
    ? trimmedStory.charAt(0).toLocaleUpperCase() + trimmedStory.slice(1)
    : trimmedStory;

  return /[.!?।॥…]["'”’)\]]*$/u.test(capitalizedStory)
    ? capitalizedStory
    : `${capitalizedStory}${language === 'en' ? '.' : '।'}`;
}

/* Enhanced center confetti explosion */

function Confetti({
  burstKey,
  level,
}: {
  burstKey: number;
  level: CelebrationLevel;
}) {
  const particleCount = level === 1 ? 64 : CONFETTI_COUNT;
  const particles = useRef(
    CONFETTI_PIECES.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (burstKey === 0) return;

    particles.forEach((particle) => {
      particle.stopAnimation();
      particle.setValue(0);
    });

    const animation = Animated.parallel(
      particles.slice(0, particleCount).map((progress, index) => {
        const piece = CONFETTI_PIECES[index];

        return Animated.timing(progress, {
          toValue: 1,
          duration: piece.duration,
          useNativeDriver: true,
        });
      })
    );

    animation.start();

    return () => animation.stop();
  }, [burstKey, level, particleCount, particles]);

  return (
    <View pointerEvents="none" style={styles.confettiLayer}>
      {CONFETTI_PIECES.slice(0, particleCount).map((piece, index) => {
        const progress = particles[index];

        const translateY = progress.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [
            0,
            piece.translateY * 0.35,
            piece.translateY + piece.gravity,
          ],
        });

        return (
          <Animated.View
            key={`confetti-${index}`}
            style={[
              styles.confettiPiece,
              {
                width: piece.size,
                height: piece.size * 1.8,
                backgroundColor: piece.color,
                borderRadius: index % 4 === 0 ? piece.size : 2,
                opacity: progress.interpolate({
                  inputRange: [0, 0.06, 0.65, 1],
                  outputRange: [0, 1, 0.9, 0],
                }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, piece.translateX],
                    }),
                  },
                  { translateY },
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 0.1, 0.4, 1],
                      outputRange: [0.2, 1.3, 1, 0.6],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        '0deg',
                        `${piece.spin * (720 + (index % 5) * 180)}deg`,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/* Left and right party poppers */

function ConfettiPopper({
  burstKey,
  level,
  side,
}: {
  burstKey: number;
  level: CelebrationLevel;
  side: 'left' | 'right';
}) {
  const particles = useRef(
    Array.from(
      { length: POPPER_COUNT },
      () => new Animated.Value(0)
    )
  ).current;

  useEffect(() => {
    if (burstKey === 0) return;

    particles.forEach((particle) => {
      particle.stopAnimation();
      particle.setValue(0);
    });

    if (level < 2) return;

    const animation = Animated.parallel(
      particles.map((progress, index) =>
        Animated.timing(progress, {
          toValue: 1,
          duration: 850 + (index % 5) * 110,
          useNativeDriver: true,
        })
      )
    );

    animation.start();

    return () => animation.stop();
  }, [burstKey, level, particles]);

  if (level < 2) return null;

  return (
    <View pointerEvents="none" style={styles.popperLayer}>
      {particles.map((progress, index) => {
        const fraction = index / (POPPER_COUNT - 1);

        const angle =
          (side === 'left'
            ? -78 + fraction * 64
            : -166 + fraction * 64) *
          (Math.PI / 180);

        const distance = 200 + (index % 5) * 32;
        const fall = 100 + (index % 4) * 25;

        const translateY = progress.interpolate({
          inputRange: [0, 0.6, 1],
          outputRange: [
            0,
            Math.sin(angle) * distance * 0.6,
            Math.sin(angle) * distance + fall,
          ],
        });

        return (
          <Animated.View
            key={`${side}-${index}`}
            style={[
              styles.popperPiece,
              {
                [side]: 14,
                backgroundColor:
                  CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                opacity: progress.interpolate({
                  inputRange: [0, 0.12, 0.7, 1],
                  outputRange: [0, 1, 0.85, 0],
                }),
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        0,
                        Math.cos(angle) * distance,
                      ],
                    }),
                  },
                  { translateY },
                  {
                    scale: progress.interpolate({
                      inputRange: [0, 0.15, 1],
                      outputRange: [0.3, 1.3, 0.7],
                    }),
                  },
                  {
                    rotate: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [
                        '0deg',
                        `${(index % 2 === 0 ? 1 : -1) * 900}deg`,
                      ],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function QuizScreen() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const theme = getTheme(scheme);
  const { language, t } = useLanguage();
  const navigation = useNavigation<Navigation>();

  const [type, setType] = useState<ScamQuizType>('link');
  const [questions, setQuestions] = useState<ScamQuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<ScamQuizAnswer | null>(null);
  const [score, setScore] = useState(0);
  const [savedScores, setSavedScores] = useState<SavedScores>({});
  const [keepScore, setKeepScore] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState<
    'choose' | 'playing' | 'finished'
  >('choose');
  const [error, setError] = useState<string | null>(null);
  const [storageMessage, setStorageMessage] = useState<string | null>(
    null
  );
  const [burstKey, setBurstKey] = useState(0);
  const [celebrationLevel, setCelebrationLevel] =
    useState<CelebrationLevel>(2);

  useEffect(() => {
    AsyncStorage.getItem(SCORE_STORAGE_KEY)
      .then((value) => setSavedScores(parseSavedScores(value)))
      .catch(() => setStorageMessage(t('quiz.saveError')))
      .finally(() => setStorageReady(true));
  }, [t]);

  const question = questions[questionIndex];

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setStorageMessage(null);

    try {
      const loadedQuestions = await fetchQuizQuestions(type, language);

      if (loadedQuestions.length !== 10) {
        throw new Error('The quiz did not return ten questions.');
      }

      setQuestions(loadedQuestions);
      setQuestionIndex(0);
      setSelectedAnswer(null);
      setFeedback(null);
      setScore(0);
      setPhase('playing');
      setBurstKey(0);
      setCelebrationLevel(2);
    } catch (cause) {
      setError(
        cause instanceof ApiError ? cause.message : t('quiz.error')
      );
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answerIndex: number) => {
    if (!question || selectedAnswer !== null || checking) return;

    setSelectedAnswer(answerIndex);
    setChecking(true);
    setError(null);

    try {
      const answer = await checkQuizAnswer(
        type,
        question.id,
        answerIndex,
        language
      );

      setFeedback(answer);

      if (answer.correct) {
        setScore((currentScore) => currentScore + 1);
        setBurstKey((currentBurst) => currentBurst + 1);
      }
    } catch (cause) {
      setSelectedAnswer(null);
      setError(
        cause instanceof ApiError ? cause.message : t('quiz.error')
      );
    } finally {
      setChecking(false);
    }
  };

  const finishQuiz = async () => {
    setPhase('finished');

    if (score > 7) {
      setCelebrationLevel(2);
      setBurstKey((currentBurst) => currentBurst + 1);
    } else if (score >= 5) {
      setCelebrationLevel(1);
      setBurstKey((currentBurst) => currentBurst + 1);
    }

    if (!keepScore) {
      setStorageMessage(t('quiz.scoreNotSaved'));
      return;
    }

    setSaving(true);

    try {
      const currentScores = parseSavedScores(
        await AsyncStorage.getItem(SCORE_STORAGE_KEY)
      );

      const best = Math.max(currentScores[type] ?? 0, score);
      const nextScores = { ...currentScores, [type]: best };

      await AsyncStorage.setItem(
        SCORE_STORAGE_KEY,
        JSON.stringify(nextScores)
      );

      setSavedScores(nextScores);
      setStorageMessage(t('quiz.scoreSaved'));
    } catch {
      setStorageMessage(t('quiz.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      void finishQuiz();
      return;
    }

    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setFeedback(null);
    setError(null);
  };

  const chooseAnotherTopic = () => {
    setPhase('choose');
    setQuestions([]);
    setQuestionIndex(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setError(null);
    setStorageMessage(null);
    setBurstKey(0);
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
    >
      <View
        style={[
          styles.screenCard,
          { backgroundColor: theme.background },
        ]}
      >
        <View style={styles.modalHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.closeButton}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={theme.textMuted}
            />
          </Pressable>

          <View
            style={[
              styles.headerIcon,
              { backgroundColor: theme.primary + '12' },
            ]}
          >
            <Ionicons name="shield-checkmark-outline" size={23} color={theme.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[typography.h2, { color: theme.text }]}>
              {t('quiz.title')}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: theme.textMuted, marginTop: 3 },
              ]}
            >
              {t('quiz.subtitle')}
            </Text>
          </View>
        </View>

        {phase === 'choose' ? (
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text
              style={[
                typography.bodyBold,
                { color: theme.text, marginBottom: 10 },
              ]}
            >
              {t('quiz.chooseType')}
            </Text>

            {QUIZ_TYPES.map(({ id, icon }) => {
              const selected = type === id;

              return (
                <Pressable
                  key={id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => setType(id)}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: theme.surface,
                      borderColor: selected
                        ? theme.primary
                        : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={21}
                    color={selected ? theme.primary : theme.textMuted}
                  />

                  <View style={{ flex: 1, marginLeft: 11 }}>
                    <Text
                      style={[
                        typography.bodyBold,
                        { color: theme.text },
                      ]}
                    >
                      {t(`quiz.type.${id}`)}
                    </Text>
                    <Text
                      style={[
                        typography.caption,
                        { color: theme.textMuted, marginTop: 2 },
                      ]}
                    >
                      {t(`quiz.type.${id}Hint`)}
                    </Text>
                  </View>

                  {savedScores[id] !== undefined ? (
                    <View
                      style={[
                        styles.bestScoreBadge,
                        { backgroundColor: theme.primary + '10' },
                      ]}
                    >
                      <Text
                        style={[
                          typography.caption,
                          { color: theme.primary, fontWeight: '700' },
                        ]}
                      >
                        {t('quiz.savedBest', {
                          score: savedScores[id] ?? 0,
                        })}
                      </Text>
                    </View>
                  ) : null}

                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={21}
                    color={selected ? theme.primary : theme.textMuted}
                    style={styles.topicRadio}
                  />
                </Pressable>
              );
            })}

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: keepScore }}
              onPress={() => setKeepScore((keep) => !keep)}
              style={styles.checkboxRow}
            >
              <Ionicons
                name={keepScore ? 'checkbox' : 'square-outline'}
                size={21}
                color={theme.primary}
              />
              <Text
                style={[
                  typography.body,
                  { color: theme.text, marginLeft: 9, flex: 1 },
                ]}
              >
                {t('quiz.keepScore')}
              </Text>
            </Pressable>

            {storageReady && savedScores[type] === undefined ? (
              <Text
                style={[
                  typography.caption,
                  { color: theme.textMuted },
                ]}
              >
                {t('quiz.noSavedScore')}
              </Text>
            ) : null}

            {storageMessage ? (
              <Text
                style={[
                  typography.caption,
                  { color: theme.danger, marginTop: 8 },
                ]}
              >
                {storageMessage}
              </Text>
            ) : null}

            {error ? (
              <Text
                style={[
                  typography.caption,
                  { color: theme.danger, marginTop: 10 },
                ]}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={loading || !storageReady}
              onPress={() => {
                void startQuiz();
              }}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.primary,
                  opacity: loading || !storageReady ? 0.65 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={[
                    typography.bodyBold,
                    { color: '#fff' },
                  ]}
                >
                  {t('quiz.start')}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        ) : phase === 'playing' && question ? (
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              accessibilityRole="button"
              onPress={chooseAnotherTopic}
              disabled={loading || checking}
              style={[
                styles.changeCategory,
                {
                  borderColor: theme.border,
                  opacity: loading || checking ? 0.5 : 1,
                },
              ]}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={17}
                color={theme.primary}
              />
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={[
                  typography.caption,
                  { color: theme.primary, fontWeight: '700' },
                ]}
              >
                {t('quiz.changeType')}
              </Text>
            </Pressable>

            <View style={styles.progressRow}>
              <View style={styles.progressCopy}>
                <Text
                  style={[
                    typography.caption,
                    { color: theme.textMuted },
                  ]}
                >
                  {t('quiz.question', {
                    current: questionIndex + 1,
                    total: questions.length,
                  })}
                </Text>
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: theme.primary + '10' },
                  ]}
                >
                  <Ionicons name="sparkles" size={14} color={theme.primary} />
                  <Text
                    style={[
                      typography.caption,
                      { color: theme.primary, fontWeight: '800', marginLeft: 5 },
                    ]}
                  >
                    {t('quiz.score', { score })}
                  </Text>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('quiz.restart')}
                disabled={loading || checking}
                onPress={() => {
                  void startQuiz();
                }}
                style={[
                  styles.restartIcon,
                  {
                    borderColor: theme.border,
                    opacity: loading || checking ? 0.5 : 1,
                  },
                ]}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={theme.primary}
                />
              </Pressable>
            </View>

            <View
              style={[
                styles.progressTrack,
                { backgroundColor: theme.border + '80' },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${((questionIndex + 1) / questions.length) * 100}%`,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.storyCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  borderLeftColor: theme.primary,
                },
              ]}
            >
              <View style={styles.storyHeading}>
                <View
                  style={[
                    styles.storyIcon,
                    { backgroundColor: theme.primary + '10' },
                  ]}
                >
                  <Ionicons name="reader-outline" size={17} color={theme.primary} />
                </View>
                <Text
                  style={[
                    typography.overline,
                    { color: theme.primary },
                  ]}
                >
                  {t('quiz.story')}
                </Text>
              </View>
              <Text
                style={[
                  typography.body,
                  { color: theme.text, marginTop: 7 },
                ]}
              >
                {formatStory(question.story, language)}
              </Text>
            </View>

            <Text
              style={[
                typography.h3,
                {
                  color: theme.text,
                  marginTop: 16,
                  marginBottom: 10,
                },
              ]}
            >
              {t('quiz.questionPrompt')}
            </Text>

            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = feedback?.correctAnswer === option;
              const colonIndex = option.indexOf(':');
              const displayedOption =
                colonIndex === -1
                  ? option
                  : option.slice(colonIndex + 1).trim();
              const optionColor = feedback
                ? isCorrect
                  ? theme.success
                  : isSelected
                    ? theme.danger
                    : theme.border
                : isSelected
                  ? theme.primary
                  : theme.border;

              return (
                <Pressable
                  key={`${question.id}-${index}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  disabled={
                    selectedAnswer !== null || checking || loading
                  }
                  onPress={() => {
                    void submitAnswer(index);
                  }}
                  style={[
                    styles.answerOption,
                    {
                      backgroundColor:
                        theme.surface,
                      borderColor: optionColor,
                      borderWidth: feedback && (isCorrect || isSelected) ? 2 : 1.5,
                    },
                  ]}
                >
                  <Text
                    style={[
                      typography.body,
                      { color: theme.text, flex: 1 },
                    ]}
                  >
                    {displayedOption}
                  </Text>

                  {feedback && isCorrect ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.success}
                    />
                  ) : null}

                  {feedback && isSelected && !feedback.correct ? (
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color={theme.danger}
                    />
                  ) : null}
                </Pressable>
              );
            })}

            {checking ? (
              <View style={styles.checkingRow}>
                <ActivityIndicator color={theme.primary} />
                <Text
                  style={[
                    typography.caption,
                    { color: theme.textMuted, marginLeft: 8 },
                  ]}
                >
                  {t('quiz.checking')}
                </Text>
              </View>
            ) : null}

            {feedback ? (
              <View
                style={[
                  styles.feedbackBox,
                  {
                    backgroundColor: feedback.correct
                      ? theme.success + '14'
                      : theme.warning + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    {
                      color: feedback.correct
                        ? theme.success
                        : theme.warning,
                    },
                  ]}
                >
                  {feedback.correct
                    ? t('quiz.correct')
                    : t('quiz.incorrect')}
                </Text>

                <Text
                  style={[
                    typography.body,
                    { color: theme.text, marginTop: 5 },
                  ]}
                >
                  {feedback.explanation}
                </Text>
              </View>
            ) : null}

            {error ? (
              <Text
                style={[
                  typography.caption,
                  { color: theme.danger, marginTop: 10 },
                ]}
              >
                {error}
              </Text>
            ) : null}

            {feedback ? (
              <Pressable
                onPress={advance}
                style={[
                  styles.primaryButton,
                  { backgroundColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: '#fff' },
                  ]}
                >
                  {questionIndex === questions.length - 1
                    ? t('quiz.finish')
                    : t('quiz.next')}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        ) : (
          <View style={styles.finishedContent}>
            <Ionicons
              name="trophy"
              size={48}
              color={theme.accent}
            />
            <Text
              style={[
                typography.h2,
                { color: theme.text, marginTop: 10 },
              ]}
            >
              {t('quiz.finalScore', { score })}
            </Text>
            <Text
              style={[
                typography.body,
                {
                  color: theme.textMuted,
                  marginTop: 8,
                  textAlign: 'center',
                },
              ]}
            >
              {saving
                ? t('quiz.saving')
                : storageMessage ??
                  (keepScore
                    ? t('quiz.scoreSaved')
                    : t('quiz.scoreNotSaved'))}
            </Text>

            {error ? (
              <Text
                style={[
                  typography.caption,
                  { color: theme.danger, marginTop: 10 },
                ]}
              >
                {error}
              </Text>
            ) : null}

            <Pressable
              onPress={chooseAnotherTopic}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: theme.primary,
                  width: '100%',
                },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  { color: '#fff' },
                ]}
              >
                {t('quiz.changeType')}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={loading}
              onPress={() => {
                void startQuiz();
              }}
              style={[
                styles.restartButton,
                {
                  borderColor: theme.primary,
                  opacity: loading ? 0.65 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text
                  style={[
                    typography.bodyBold,
                    { color: theme.primary },
                  ]}
                >
                  {t('quiz.restart')}
                </Text>
              )}
            </Pressable>
          </View>
        )}

        <Confetti burstKey={burstKey} level={celebrationLevel} />
        <ConfettiPopper
          burstKey={burstKey}
          level={celebrationLevel}
          side="left"
        />
        <ConfettiPopper
          burstKey={burstKey}
          level={celebrationLevel}
          side="right"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenCard: {
    flex: 1,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8A9299',
  },
  closeButton: {
    padding: 6,
    marginRight: 8,
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  changeCategory: {
    minHeight: 40,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 30,
  },
  typeOption: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#112E51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  bestScoreBadge: {
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 8,
  },
  topicRadio: {
    marginLeft: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  primaryButton: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 15,
  },
  restartButton: {
    minHeight: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  progressCopy: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 10,
  },
  restartIcon: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  storyCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: '#D6D7D9',
    borderRadius: 17,
    padding: 15,
    shadowColor: '#112E51',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  storyHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  storyIcon: {
    width: 29,
    height: 29,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  answerOption: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#112E51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },
  checkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  feedbackBox: {
    padding: 13,
    borderRadius: 13,
    marginTop: 9,
  },
  finishedContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    flex: 1,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    left: '50%',
    top: '42%',
    marginLeft: -4,
    marginTop: -7,
  },
  popperLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 6,
    overflow: 'hidden',
  },
  popperPiece: {
    position: 'absolute',
    bottom: 30,
    width: 8,
    height: 13,
    borderRadius: 2,
  },
});