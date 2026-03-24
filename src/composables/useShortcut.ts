/**
 * useShortcut - 全局快捷键管理
 *
 * 功能：
 * - 注册/注销全局快捷键
 * - 快捷键按下时切换窗口可见性
 * - 提供快捷键录制逻辑
 */
import { ref } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { register, unregisterAll } from '@tauri-apps/plugin-global-shortcut';

const recordingShortcut = ref(false);

/**
 * 注册全局快捷键，按下后切换窗口显示/隐藏
 * @param shortcut - 快捷键字符串，如 'Alt+T'
 */
async function setupShortcut(shortcut: string) {
  await unregisterAll();
  try {
    await register(shortcut, async () => {
      const appWindow = getCurrentWindow();
      const visible = await appWindow.isVisible();
      if (visible) {
        await appWindow.hide();
      } else {
        await appWindow.show();
        await appWindow.setFocus();
      }
    });
  } catch (e) {
    console.warn('[Shortcut] 快捷键注册失败:', e);
  }
}

/**
 * 处理快捷键录制时的键盘事件
 * @param e - 键盘事件
 * @param onRecorded - 录制完成的回调，参数为快捷键字符串
 */
function handleShortcutKeypress(e: KeyboardEvent, onRecorded: (shortcut: string) => void) {
  if (!recordingShortcut.value) return;
  e.preventDefault();

  const keys: string[] = [];
  if (e.ctrlKey) keys.push('CommandOrControl');
  if (e.altKey) keys.push('Alt');
  if (e.shiftKey) keys.push('Shift');

  // 忽略单独的修饰键
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

  let keyText = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  if (keyText === ' ') keyText = 'Space';

  keys.push(keyText);
  const result = keys.join('+');

  onRecorded(result);
  recordingShortcut.value = false;
  (e.target as HTMLElement).blur();
}

/**
 * 全局快捷键 composable
 */
export function useShortcut() {
  return {
    recordingShortcut,
    setupShortcut,
    handleShortcutKeypress,
  };
}
