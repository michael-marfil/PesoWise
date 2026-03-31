import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, Platform, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTransactions, Category } from '../../context/TransactionContext';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import * as ImagePicker from 'expo-image-picker';

const PRESET_ICONS = ["🎮", "🐶", "🎁", "🛠️", "💼", "🍿", "🏠", "✈️", "🛒", "🎓", "📱", "💇", "💪", "🌱"];
const PRESET_COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#D4537E", "#888780", "#6A5ACD", "#FF6347", "#20B2AA"];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, uploadAvatar, categories, addCategory, deleteCategory, isSubmitting } = useTransactions();
  
  const [name, setName] = useState(profile?.full_name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Manage Categories States
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatColor, setNewCatColor] = useState("#378ADD");

  const defaultCats = categories.filter(c => c.is_default);
  const customCats  = categories.filter(c => !c.is_default);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Needed", "Access needed for profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled) await uploadAvatar(result.assets[0].uri);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) return;
    await updateProfile({ full_name: name });
    setIsEditing(false);
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(newCatName, newCatIcon, newCatColor);
    setShowCatModal(false);
    setNewCatName("");
  };

  const onLogout = () => {
    Alert.alert("Logout", "Sign out?", [{ text: "Cancel" }, { text: "Logout", style: "destructive", onPress: signOut }]);
  };

  const onCheckForUpdates = async () => {
    setUpdateLoading(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert("Success", "Update downloaded. Restart now?", [
          { text: "Restart Now", onPress: () => Updates.reloadAsync() }
        ]);
      } else {
        Alert.alert("Up to Date", "You are already running the latest version.");
      }
    } catch (e: any) {
      Alert.alert("Update Check Failed", e.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const RenderCategory = ({ c }: { c: Category }) => (
    <View style={styles.catRow}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={[styles.catIcon, { backgroundColor: c.color + '20' }]}>
          <Text style={{ fontSize: 16 }}>{c.icon}</Text>
        </View>
        <Text style={styles.catNameText}>{c.name}</Text>
      </View>
      {!c.is_default ? (
        <TouchableOpacity onPress={() => deleteCategory(c.id)}>
          <Ionicons name="trash-outline" size={18} color="#F09595" />
        </TouchableOpacity>
      ) : (
        <Ionicons name="lock-closed-outline" size={14} color="#eee" />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={isSubmitting}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarCircle}><Text style={styles.avatarText}>{profile?.full_name?.charAt(0).toUpperCase() || "U"}</Text></View>
            )}
            <View style={styles.cameraBadge}><Ionicons name="camera" size={14} color="#fff" /></View>
          </TouchableOpacity>
          <Text style={styles.userName}>{profile?.full_name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={20} color="#666" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.settingLabel}>Display Name</Text>
                {isEditing ? (
                  <TextInput 
                    style={styles.input} 
                    value={name} 
                    onChangeText={setName} 
                    autoFocus
                    placeholder="Enter nickname"
                  />
                ) : (
                  <Text style={styles.settingValue}>{profile?.full_name || "Set a name"}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity 
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              style={styles.editBtn}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#378ADD" />
              ) : (
                <Text style={styles.editBtnText}>{isEditing ? "Save" : "Edit"}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="cloud-download-outline" size={20} color="#666" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.settingLabel}>App Updates</Text>
                <Text style={styles.settingValue}>Check for code fixes</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={onCheckForUpdates}
              style={styles.editBtn}
              disabled={updateLoading}
            >
              {updateLoading ? (
                <ActivityIndicator size="small" color="#378ADD" />
              ) : (
                <Text style={styles.editBtnText}>Check</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORIES SECTION */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={styles.sectionTitle}>Expense Categories</Text>
            <TouchableOpacity onPress={() => setShowCatModal(true)}>
              <Text style={{ color: '#378ADD', fontWeight: '700', fontSize: 13 }}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.groupLabel}>Essentials (Default)</Text>
          {defaultCats.map(c => <RenderCategory key={c.id} c={c} />)}

          {customCats.length > 0 && (
            <>
              <Text style={[styles.groupLabel, { marginTop: 15 }]}>Personal (Custom)</Text>
              {customCats.map(c => <RenderCategory key={c.id} c={c} />)}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#E24B4A" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Runtime: {Updates.runtimeVersion}</Text>
          <Text style={styles.debugText}>Update ID: {Updates.updateId || "None (Base APK)"}</Text>
          <Text style={styles.debugText}>Channel: {Updates.channel || "Preview"}</Text>
        </View>

        <Text style={styles.version}>PesoWise v1.0.1 - Build Reset Fix</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ADD CATEGORY MODAL */}
      <Modal visible={showCatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Category</Text>
            <TextInput style={styles.modalInput} placeholder="Category Name" value={newCatName} onChangeText={setNewCatName} />
            <Text style={styles.subLabel}>Icon</Text>
            <View style={styles.presetRow}>{PRESET_ICONS.map(i => <TouchableOpacity key={i} onPress={() => setNewCatIcon(i)} style={[styles.presetBtn, newCatIcon === i && styles.presetActive]}><Text style={{ fontSize: 20 }}>{i}</Text></TouchableOpacity>)}</View>
            <Text style={styles.subLabel}>Color</Text>
            <View style={styles.presetRow}>{PRESET_COLORS.map(c => <TouchableOpacity key={c} onPress={() => setNewCatColor(c)} style={[styles.colorBtn, { backgroundColor: c }, newCatColor === c && styles.colorActive]} />)}</View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCatModal(false)}><Text>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddCategory} disabled={!newCatName}><Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '800', color: '#111' },
  profileCard: { alignItems: 'center', marginBottom: 40, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 24 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#378ADD', justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1a1a2e', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: '#111' },
  userEmail: { fontSize: 14, color: '#888', marginTop: 4 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  groupLabel: { fontSize: 11, fontWeight: '800', color: '#bbb', textTransform: 'uppercase', marginBottom: 10, letterSpacing: 1 },
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingLabel: { fontSize: 12, color: '#888', textTransform: 'uppercase', fontWeight: '600' },
  settingValue: { fontSize: 15, color: '#333', fontWeight: '500', marginTop: 2 },
  input: { fontSize: 15, color: '#378ADD', fontWeight: '600', padding: 0, marginTop: 2 },
  editBtn: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 8, backgroundColor: '#E6F1FB' },
  editBtnText: { fontSize: 13, color: '#378ADD', fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  catIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  catNameText: { fontSize: 15, color: '#444', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 16, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FFE0E0' },
  logoutText: { fontSize: 16, color: '#E24B4A', fontWeight: '700' },
  debugInfo: { marginTop: 30, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 12 },
  debugText: { fontSize: 10, color: '#999', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  version: { textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#111' },
  modalInput: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20 },
  subLabel: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', marginBottom: 12 },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  presetBtn: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  presetActive: { borderColor: '#378ADD', backgroundColor: '#E6F1FB' },
  colorBtn: { width: 35, height: 35, borderRadius: 18, borderWidth: 3, borderColor: '#fff' },
  colorActive: { borderColor: '#eee', transform: [{ scale: 1.1 }] },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, alignItems: 'center', borderRadius: 14, backgroundColor: '#f5f5f5' },
  confirmBtn: { flex: 2, padding: 16, alignItems: 'center', borderRadius: 14, backgroundColor: '#378ADD' }
});
