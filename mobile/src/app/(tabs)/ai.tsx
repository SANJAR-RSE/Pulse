import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorState, LoadingState } from '@/components/ui';
import { actionTarget } from '@/lib/ai-actions';
import { useAIChat, useAIHistory } from '@/lib/queries';
import type { AIAction } from '@/lib/types';
import { colors, font, radius, space } from '@/theme';

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: AIAction | null;
  failed?: boolean;
}

const SUGGESTIONS = ["Boshim og'riyapti", 'Menga bugun LOR kerak', 'Navbatim qachon?', 'Bugun qancha suv ichdim?', "Tibbiy tariximni ko'rsat"];

export default function AIScreen() {
  const history = useAIHistory();
  const chat = useAIChat();
  const [local, setLocal] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<Msg>>(null);
  const seq = useRef(0); // unique ids for messages sent in this session

  const messages = useMemo<Msg[]>(
    () => [
      ...(history.data?.messages ?? []).map((m, i) => ({ id: `h${i}`, role: m.role, content: m.content })),
      ...local,
    ],
    [history.data, local]
  );

  const send = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message || chat.isPending) return;
    setInput('');
    seq.current += 1;
    const stamp = seq.current;
    setLocal((p) => [...p, { id: `u${stamp}`, role: 'user', content: message }]);
    chat.mutate(message, {
      onSuccess: (d) => setLocal((p) => [...p, { id: `a${stamp}`, role: 'assistant', content: d.reply, action: d.action }]),
      onError: () => setLocal((p) => [...p, { id: `e${stamp}`, role: 'assistant', content: "PULSE AI bilan aloqa o'rnatilmadi. Qayta urinib ko'ring.", failed: true }]),
    });
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Ionicons name="sparkles" size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={font.h2}>PULSE AI</Text>
          <Text style={font.tiny}>Yordamchi — tashxis qo'ymaydi, shifokor o'rnini bosmaydi.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {history.isLoading ? (
          <LoadingState label="Suhbat yuklanmoqda..." />
        ) : history.isError ? (
          <View style={{ padding: space.lg }}>
            <ErrorState onRetry={() => history.refetch()} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="sparkles" size={36} color={colors.primary} />
                <Text style={font.h2}>Sizga qanday yordam beray?</Text>
                <Text style={[font.small, { textAlign: 'center' }]}>Quyidagilardan birini so'rab ko'ring.</Text>
                <View style={styles.suggestions}>
                  {SUGGESTIONS.map((s) => (
                    <Pressable key={s} onPress={() => send(s)} style={({ pressed }) => [styles.suggestion, pressed && { backgroundColor: colors.primarySoft }]}>
                      <Text style={styles.suggestionText}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            }
            renderItem={({ item }) => <Bubble msg={item} />}
            ListFooterComponent={
              chat.isPending ? (
                <View style={[styles.bubble, styles.bot, { flexDirection: 'row', gap: 8, alignItems: 'center' }]}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={font.small}>PULSE AI yozmoqda...</Text>
                </View>
              ) : undefined
            }
          />
        )}

        {messages.length > 0 && (
          <View style={styles.quick}>
            {SUGGESTIONS.slice(0, 3).map((s) => (
              <Pressable key={s} onPress={() => send(s)} style={styles.quickChip}>
                <Text style={styles.quickText} numberOfLines={1}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.composer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Xabar yozing..."
            placeholderTextColor="#94A3B8"
            style={styles.input}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            maxLength={2000}
          />
          <Pressable onPress={() => send()} disabled={!input.trim() || chat.isPending} style={[styles.send, (!input.trim() || chat.isPending) && { opacity: 0.5 }]} accessibilityLabel="Yuborish">
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user';
  const emergency = msg.action?.type === 'emergency';
  const notice = !isUser && (msg.action?.medicalNotice || msg.content.includes("tashxis qo'y"));
  const target = actionTarget(msg.action);
  const style = isUser ? styles.user : emergency ? styles.emergency : notice ? styles.notice : msg.failed ? styles.failed : styles.bot;

  return (
    <View style={[styles.bubble, style]}>
      {!isUser && (emergency || notice) && (
        <View style={styles.noticeHead}>
          <Ionicons name={emergency ? 'warning' : 'shield-checkmark'} size={14} color={emergency ? colors.danger : colors.warning} />
          <Text style={[styles.noticeTitle, { color: emergency ? colors.danger : colors.warning }]}>
            {emergency ? 'FAVQULODDA HOLAT' : 'TIBBIY XAVFSIZLIK ESLATMASI'}
          </Text>
        </View>
      )}
      <Text style={[styles.text, isUser && { color: colors.white }]}>{msg.content}</Text>
      {target && (
        <Pressable
          onPress={() => (target.tel ? Linking.openURL(`tel:${target.tel}`) : target.href && router.push(target.href as never))}
          style={[styles.action, emergency && { backgroundColor: colors.danger }]}
        >
          <Ionicons name={target.tel ? 'call' : 'arrow-forward'} size={15} color={colors.white} />
          <Text style={styles.actionText}>{target.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingHorizontal: space.lg, paddingVertical: space.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  headIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: space.lg, gap: space.md, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.xxxl },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, marginTop: space.sm },
  suggestion: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  suggestionText: { fontSize: 14, color: colors.textSoft, fontWeight: '500' },
  bubble: { maxWidth: '86%', borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  user: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bot: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  notice: { alignSelf: 'flex-start', backgroundColor: colors.warningSoft, borderWidth: 1, borderColor: '#FDE68A', borderBottomLeftRadius: 4 },
  emergency: { alignSelf: 'flex-start', backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: '#FECACA', borderBottomLeftRadius: 4 },
  failed: { alignSelf: 'flex-start', backgroundColor: colors.dangerSoft, borderBottomLeftRadius: 4 },
  noticeHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  noticeTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  text: { fontSize: 15, lineHeight: 21, color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.md },
  actionText: { color: colors.white, fontWeight: '600', fontSize: 14 },
  quick: { flexDirection: 'row', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm },
  quickChip: { flexShrink: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  quickText: { fontSize: 12, color: colors.textSoft },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, height: 46, borderRadius: radius.pill, backgroundColor: colors.bg, paddingHorizontal: space.lg, fontSize: 15, color: colors.text },
  send: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
