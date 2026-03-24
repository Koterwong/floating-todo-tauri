<!--
  SettingsPanel - 设置面板组件
  功能：配置语言、颜色、窗口尺寸、字体大小、快捷键、自动启动
-->
<script setup lang="ts">
import { useI18n } from '../composables/useI18n';
import { useSettings } from '../composables/useSettings';
import { useShortcut } from '../composables/useShortcut';

const { t, switchLanguage } = useI18n();
const { settings, isSettingsOpen, saveSettings } = useSettings();
const { recordingShortcut, setupShortcut, handleShortcutKeypress } = useShortcut();

/** 保存并关闭设置 */
async function handleSave() {
  // 先切换语言
  switchLanguage(settings.value.language);
  // 重新注册快捷键
  await setupShortcut(settings.value.shortcut);
  // 保存设置到持久化存储
  await saveSettings();
}

/** 录制快捷键的回调 */
function onShortcutRecorded(shortcut: string) {
  settings.value.shortcut = shortcut;
}

/** 键盘事件转发 */
function onKeydown(e: KeyboardEvent) {
  handleShortcutKeypress(e, onShortcutRecorded);
}
</script>

<template>
  <div
    v-show="isSettingsOpen"
    class="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] transition-opacity p-4"
  >
    <div
      class="bg-[#1e1e2a]/95 border border-white/15 rounded-2xl p-3.5 w-full max-h-[90vh] shadow-2xl backdrop-blur-xl flex flex-col"
    >
      <!-- 标题栏 -->
      <div class="flex justify-between items-center mb-3 pb-2 border-b border-white/15 shrink-0">
        <h2 class="text-base font-medium">{{ t.settingsTitle }}</h2>
        <button
          @click="isSettingsOpen = false"
          class="text-white/60 hover:text-white text-lg cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- 设置选项（可滚动） -->
      <div class="flex flex-col gap-2 overflow-y-auto pr-2">
        <!-- 语言 -->
        <div class="flex flex-col">
          <label class="text-[0.85em] mb-1 text-white/60 font-medium">{{ t.language }}</label>
          <select
            v-model="settings.language"
            class="bg-black/20 border border-white/15 text-white px-2 py-1.5 rounded-lg outline-none focus:border-[#9d4edd]"
          >
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        <!-- 背景颜色和透明度 -->
        <div class="flex flex-col">
          <label class="text-[0.85em] mb-1 text-white/60 font-medium">{{ t.color }}</label>
          <div class="flex gap-2 items-center">
            <input
              type="color"
              v-model="settings.bgColor"
              class="w-10 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
            />
            <input
              type="range"
              v-model="settings.opacity"
              min="0"
              max="100"
              class="flex-1 cursor-pointer accent-[#9d4edd]"
            />
          </div>
        </div>

        <!-- 窗口尺寸 -->
        <div class="flex flex-col">
          <label class="text-[0.85em] mb-1 text-white/60 font-medium">{{ t.size }}</label>
          <div class="flex gap-2 items-center">
            <input
              type="number"
              v-model="settings.windowWidth"
              class="flex-1 min-w-0 bg-black/20 border border-white/15 text-white px-2 py-1.5 rounded-lg outline-none focus:border-[#9d4edd] text-center"
            />
            <span class="text-white">x</span>
            <input
              type="number"
              v-model="settings.windowHeight"
              class="flex-1 min-w-0 bg-black/20 border border-white/15 text-white px-2 py-1.5 rounded-lg outline-none focus:border-[#9d4edd] text-center"
            />
          </div>
        </div>

        <!-- 字体大小 -->
        <div class="flex flex-col">
          <label class="text-[0.85em] mb-1 text-white/60 font-medium">{{ t.font }}</label>
          <input
            type="range"
            v-model="settings.fontSize"
            min="12"
            max="28"
            class="cursor-pointer accent-[#9d4edd]"
          />
        </div>

        <!-- 快捷键 -->
        <div class="flex flex-col">
          <label class="text-[0.85em] mb-1 text-white/60 font-medium">{{ t.shortcut }}</label>
          <input
            type="text"
            :value="recordingShortcut ? '按下按键录制...' : settings.shortcut"
            @focus="recordingShortcut = true"
            @blur="recordingShortcut = false"
            @keydown="onKeydown"
            readonly
            class="bg-black/20 border border-white/15 text-white px-2 py-1.5 rounded-lg outline-none text-center font-mono tracking-wider cursor-pointer focus:border-[#9d4edd] text-xs"
          />
          <small class="text-xs text-[#c77dff] mt-1 text-center">{{ t.shortcutHint }}</small>
        </div>

        <!-- 自动启动 -->
        <div class="flex justify-between items-center mt-1">
          <label class="text-[0.9em] text-white/60 font-medium">{{ t.autostart }}</label>
          <input
            type="checkbox"
            v-model="settings.autoStart"
            class="w-4 h-4 accent-[#9d4edd] cursor-pointer"
          />
        </div>

        <!-- 保存按钮 -->
        <button
          @click="handleSave"
          class="w-full mt-2 p-1.5 bg-gradient-to-br from-[#9d4edd] to-[#7b2cbf] hover:from-[#c77dff] hover:to-[#9d4edd] text-white font-semibold rounded-lg shadow-[0_4px_15px_rgba(123,44,191,0.4)] hover:shadow-[0_6px_20px_rgba(123,44,191,0.6)] transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          {{ t.save }}
        </button>
      </div>
    </div>
  </div>
</template>
