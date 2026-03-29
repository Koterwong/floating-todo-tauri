<!--
  TitleBar - 标题栏组件
  功能：窗口拖拽、置顶切换、实时日期、设置按钮、关闭按钮
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { useI18n } from '../composables/useI18n';
import { useSettings } from '../composables/useSettings';
import { useTodos } from '../composables/useTodos';

const { t, currentLang } = useI18n();
const { isSettingsOpen } = useSettings();
const { isInputVisible } = useTodos();

/** 窗口是否置顶 */
const isAlwaysOnTop = ref(false);

/** 当前日期字符串 */
const dateStr = ref('');

/** 获取并格式化实时日期 */
function updateDate() {
  const d = new Date();
  const weekDay = d.toLocaleDateString(currentLang.value === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short' });
  const day = d.getDate();
  const month = d.getMonth() + 1;
  dateStr.value = currentLang.value === 'zh' ? `${month}/${day} ${weekDay}` : `${weekDay} ${month}/${day}`;
}

let timer: any = null;

/** 初始化时同步置顶状态及日期 */
onMounted(async () => {
  const appWindow = getCurrentWindow();
  isAlwaysOnTop.value = await appWindow.isAlwaysOnTop();
  updateDate();
  // 每一分钟更新一次日期
  timer = setInterval(updateDate, 60000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

/** 切换置顶状态 */
const toggleAlwaysOnTop = async () => {
  const appWindow = getCurrentWindow();
  const newState = !isAlwaysOnTop.value;
  await appWindow.setAlwaysOnTop(newState);
  isAlwaysOnTop.value = newState;
};

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
    <div class="flex items-baseline gap-2 pointer-events-none select-none">
      <h1
        class="text-xl font-semibold uppercase tracking-wide bg-gradient-to-r from-[#e0aaff] to-[#c77dff] text-transparent bg-clip-text"
      >
        {{ t.title }}
      </h1>
      <span class="text-[0.65rem] text-white/40 font-medium font-mono uppercase">
        {{ dateStr }}
      </span>
    </div>

    <!-- 操作按钮：需要 no-drag 以可点击 -->
    <div class="flex gap-4 no-drag items-center">
      <!-- 添加按钮 -->
      <button
        @click.stop="isInputVisible = !isInputVisible"
        title="添加任务"
        class="text-xl transition-all duration-300 cursor-pointer hover:scale-125 flex items-center justify-center p-1 rounded-full hover:bg-white/10"
        :class="isInputVisible 
          ? 'text-[#c77dff] rotate-45 drop-shadow-[0_0_8px_rgba(199,125,255,0.8)]' 
          : 'text-white/70 hover:text-white'"
      >
        ➕
      </button>

      <!-- 置顶按钮 -->
      <button
        @click.stop="toggleAlwaysOnTop"
        :title="isAlwaysOnTop ? t.unpinWindow : t.pinWindow"
        class="text-lg transition-all cursor-pointer hover:scale-110 flex items-center justify-center p-1 rounded-md"
        :class="isAlwaysOnTop ? 'text-[#c77dff] drop-shadow-[0_0_8px_rgba(199,125,255,0.8)]' : 'text-white/40 hover:text-white'"
      >
        📌
      </button>

      <button
        @click.stop="isSettingsOpen = true"
        class="text-white/40 hover:text-white hover:scale-110 transition-transform cursor-pointer p-1"
      >
        ⚙️
      </button>
      <button
        @click.stop="closeApp"
        class="text-white/40 hover:text-red-400 hover:scale-110 transition-transform cursor-pointer p-1"
      >
        ✕
      </button>
    </div>
  </div>
</template>
