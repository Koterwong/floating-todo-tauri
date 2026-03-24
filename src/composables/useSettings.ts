/**
 * useSettings - 设置管理
 *
 * 功能：
 * - 加载和保存用户设置
 * - 将设置应用到 CSS 变量和窗口尺寸
 * - 对外暴露响应式 settings 对象
 */
import { ref } from 'vue';
import { Store } from '@tauri-apps/plugin-store';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import type { Settings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const settings = ref<Settings>({ ...DEFAULT_SETTINGS });
const isSettingsOpen = ref(false);
let store: Store | null = null;

/**
 * 初始化：从存储加载设置并应用
 * @param storeInstance - 共享的 Store 实例
 */
async function initSettings(storeInstance: Store) {
  store = storeInstance;
  const saved = await store.get<Settings>('settings');
  if (saved) {
    settings.value = { ...DEFAULT_SETTINGS, ...saved };
  }
  await applySettings(settings.value);
}

/**
 * 将设置应用到界面：CSS 变量 + 窗口尺寸
 */
async function applySettings(s: Settings) {
  // 字体大小
  document.documentElement.style.setProperty('--base-font-size', `${s.fontSize}px`);

  // 背景颜色 + 透明度
  const hex = s.bgColor || '#191923';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = (s.opacity ?? 65) / 100;
  document.documentElement.style.setProperty('--bg-color', `rgba(${r}, ${g}, ${b}, ${a})`);

  // 窗口尺寸
  try {
    const appWindow = getCurrentWindow();
    await appWindow.setSize(new LogicalSize(s.windowWidth, s.windowHeight));
  } catch (e) {
    console.warn('[Settings] 设置窗口尺寸失败:', e);
  }
}

/**
 * 保存设置到持久化存储并重新应用
 */
async function saveSettings() {
  if (store) {
    await store.set('settings', settings.value);
    await store.save();
  }
  await applySettings(settings.value);
  isSettingsOpen.value = false;
}

/**
 * 设置管理 composable
 */
export function useSettings() {
  return {
    settings,
    isSettingsOpen,
    initSettings,
    applySettings,
    saveSettings,
  };
}
