<!--
  App.vue - 根组件
  职责：纯布局编排，不包含任何业务逻辑
  所有逻辑均由 composables 和子组件承担
-->
<script setup lang="ts">
import { onMounted } from 'vue';
import { Store } from '@tauri-apps/plugin-store';

// Composables
import { useI18n } from './composables/useI18n';
import { useTodos } from './composables/useTodos';
import { useSettings } from './composables/useSettings';
import { useShortcut } from './composables/useShortcut';
import { useEdgeDocking } from './composables/useEdgeDocking';

// 子组件
import TitleBar from './components/TitleBar.vue';
import TodoInput from './components/TodoInput.vue';
import TodoList from './components/TodoList.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const { switchLanguage } = useI18n();
const { initTodos } = useTodos();
const { settings, initSettings, setupWindowListeners } = useSettings();
const { setupShortcut } = useShortcut();
const { setupEdgeDocking } = useEdgeDocking();
// const { isDocked, dockedEdge, isRevealed } = useEdgeDocking(); // 暂时未使用，等还原指示条时再开启

/**
 * 应用初始化
 * 1. 加载持久化存储
 * 2. 恢复待办事项和设置
 * 3. 应用语言和快捷键
 * 4. 启动边缘吸附监听
 * 5. 初始化完成后显示窗口（避免启动白闪）
 */
onMounted(async () => {
  const store = await Store.load('store.json');

  await initTodos(store);
  await initSettings(store);

  // 恢复语言设置
  switchLanguage(settings.value.language);
  // 注册全局快捷键
  await setupShortcut(settings.value.shortcut);
  // 启动尺寸记忆
  await setupWindowListeners();
  // 启动边缘吸附
  setupEdgeDocking();
});
</script>

<template>
  <div class="flex flex-col h-screen w-screen overflow-hidden bg-transparent">
    <!-- 内层：玻璃拟态效果容器 -->
    <div
      class="relative flex flex-col h-full w-full overflow-hidden text-white base-font text-[var(--base-font-size)]"
      :style="{
        backgroundColor: 'var(--bg-color)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.15)',
      }"
    >
      <!-- 标题栏 -->
      <TitleBar />

      <!-- 主体内容 -->
      <div class="flex flex-col flex-1 px-4 pt-2 pb-4 overflow-hidden">
        <TodoInput />
        <TodoList />
      </div>

      <!-- 设置面板 -->
      <SettingsPanel />
    </div>

    <!--
      吸附指示条：窗口吸附隐藏后，在屏幕边缘显示一条发光的紫色指示条，
      让用户知道窗口在哪里，以及可以通过鼠标悬停呼出。
    -->
    <!-- <div
      v-if="isDocked && !isRevealed"
      class="fixed z-[200] pointer-events-none"
      :class="{
        'bottom-0 left-1/2 -translate-x-1/2 w-16 h-1': dockedEdge === 'top',
        'top-1/2 -translate-y-1/2 left-0 w-1 h-16': dockedEdge === 'left',
        'top-1/2 -translate-y-1/2 right-0 w-1 h-16': dockedEdge === 'right',
      }"
    >
      <div class="w-full h-full rounded-full bg-[#9d4edd] shadow-[0_0_12px_#9d4edd,0_0_4px_#c77dff] animate-pulse"></div>
    </div> -->
  </div>
</template>