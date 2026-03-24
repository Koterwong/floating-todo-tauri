<!--
  TitleBar - 标题栏组件
  功能：窗口拖拽、设置按钮、关闭按钮
-->
<script setup lang="ts">
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useI18n } from '../composables/useI18n';
import { useSettings } from '../composables/useSettings';

const { t } = useI18n();
const { isSettingsOpen } = useSettings();

/** 关闭应用 */
const closeApp = async () => {
  await getCurrentWindow().close();
};
</script>

<template>
  <div
    data-tauri-drag-region
    class="flex justify-between items-center px-5 py-3 border-b border-white/10 select-none cursor-move shrink-0"
  >
    <!-- 标题文字：渐变色，不可选中，不阻挡拖拽 -->
    <h1
      class="text-xl font-semibold uppercase tracking-wide bg-gradient-to-r from-[#e0aaff] to-[#c77dff] text-transparent bg-clip-text pointer-events-none select-none"
    >
      {{ t.title }}
    </h1>

    <!-- 操作按钮：需要 no-drag 以可点击 -->
    <div class="flex gap-4 no-drag">
      <button
        @click.stop="isSettingsOpen = true"
        class="text-white/60 hover:text-white hover:scale-110 transition-transform cursor-pointer"
      >
        ⚙️
      </button>
      <button
        @click.stop="closeApp"
        class="text-white/60 hover:text-red-400 hover:scale-110 transition-transform cursor-pointer"
      >
        ✕
      </button>
    </div>
  </div>
</template>
