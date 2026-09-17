import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function BuildingModelModal({ visible, onClose, onCreate }: { visible: boolean; onClose: () => void; onCreate: (height: number) => void }) {
  const { palette } = useTheme();
  const [height, setHeight] = useState('8');
  const submit = () => {
    const value = Number(height.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) { Alert.alert('قيمة غير صحيحة', 'أدخل ارتفاعاً أكبر من صفر بالمتر.'); return; }
    onCreate(value);
  };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={[styles.backdrop, { backgroundColor: palette.overlay }]}>
      <View style={[styles.card, { backgroundColor: palette.bgElevated }]}>
        <Text style={[styles.title, { color: palette.text }]}>نموذج مبانٍ ثلاثي الأبعاد</Text>
        <Text style={[styles.help, { color: palette.textMuted }]}>تم تحديد منطقة على الخريطة. أدخل ارتفاعاً افتراضياً للمباني داخلها بالمتر.</Text>
        <TextInput value={height} onChangeText={setHeight} keyboardType="decimal-pad" textAlign="right" style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.card }]} placeholder="الارتفاع بالمتر" placeholderTextColor={palette.textMuted} />
        <View style={styles.actions}>
          <Pressable onPress={onClose} style={[styles.button, { backgroundColor: palette.card }]}><Text style={{ color: palette.text }}>إلغاء</Text></Pressable>
          <Pressable onPress={submit} style={[styles.button, { backgroundColor: palette.primary }]}><Text style={{ color: '#fff', fontWeight: '800' }}>إنشاء النموذج</Text></Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({ backdrop: { flex: 1, justifyContent: 'center', padding: 22 }, card: { borderRadius: 20, padding: 20 }, title: { fontSize: 18, fontWeight: '800', textAlign: 'right' }, help: { fontSize: 13, lineHeight: 21, textAlign: 'right', marginTop: 10 }, input: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 16, fontSize: 16 }, actions: { flexDirection: 'row-reverse', gap: 10, marginTop: 18 }, button: { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 12 } });
