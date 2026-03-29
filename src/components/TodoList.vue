<!--
  TodoList - 任务列表组件 (增强版)
  功能：展示任务、分类过滤、进度条、动态动画、空状态显示
-->
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '../composables/useI18n';
import { useTodos } from '../composables/useTodos';
import ConfirmModal from './ConfirmModal.vue';

const { t } = useI18n();
const { activeFilter, filteredTodos, groupedTodos, stats, toggleTodo, deleteTodo, getTodayStr } = useTodos();

/** 删除确认状态 */
const isConfirmOpen = ref(false);
const itemToDelete = ref<string | null>(null);

/** 触发删除确认 */
function triggerDelete(id: string) {
  itemToDelete.value = id;
  isConfirmOpen.value = true;
}

/** 执行最终删除 */
function handleConfirmDelete() {
  if (itemToDelete.value) {
    deleteTodo(itemToDelete.value);
    itemToDelete.value = null;
  }
  isConfirmOpen.value = false;
}

/** 格式化日期显示 */
function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const today = getTodayStr();
  if (dateStr === today) return t.value.filterToday;
  
  // 简写日期格式
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

/** 检查任务是否过期 */
function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  const today = getTodayStr();
  return dateStr < today;
}
</script>

<template>
  <div class="flex flex-col flex-1 overflow-hidden">
    <!-- 过滤器标签 -->
    <div class="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-none no-drag">
      <button
        v-for="f in (['all', 'today', 'upcoming', 'expired', 'completed'] as const)"
        :key="f"
        @click="activeFilter = f"
        class="shrink-0 px-3 py-1 rounded-full text-[0.75rem] font-medium transition-all cursor-pointer whitespace-nowrap"
        :class="activeFilter === f 
          ? 'bg-[#9d4edd] text-white shadow-md shadow-[#9d4edd]/30' 
          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'"
      >
        {{ (t as any)[`filter${f.charAt(0).toUpperCase() + f.slice(1)}`] }}
      </button>
    </div>

    <!-- 进度统计 (仅在全部模式显示) -->
    <div v-if="stats.total > 0" class="mb-4 px-1">
      <div class="flex justify-between items-center mb-1 text-[0.7rem] text-white/40">
        <span>{{ stats.completed }} / {{ stats.total }}</span>
        <span>{{ stats.ratio }}%</span>
      </div>
      <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-[#9d4edd] to-[#c77dff] transition-all duration-500 ease-out"
          :style="{ width: `${stats.ratio}%` }"
        ></div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="flex-1 overflow-y-auto pr-1">
      <!-- 情况 A：全部视图 (分组显示) -->
      <div v-if="activeFilter === 'all'" class="space-y-6 pb-4">
        <div v-for="group in groupedTodos" :key="group.title" class="space-y-3">
          <!-- 分组标题 -->
          <div class="flex items-center gap-2 px-1">
            <div class="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
            <span class="text-[0.65rem] font-bold text-white/30 uppercase tracking-widest whitespace-nowrap">
              {{ (t as any)[group.title] || group.title }}
            </span>
            <div class="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
          </div>

          <!-- 分组内的任务 -->
          <ul class="list-none space-y-2.5">
            <li
              v-for="todo in group.items"
              :key="todo.id"
              class="relative flex items-center p-3 pl-4 bg-white/5 border border-white/10 rounded-xl group transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98]"
              :class="{ 'opacity-50 grayscale-[0.3]': todo.completed }"
            >
              <!-- 优先级色条装饰 -->
              <div 
                class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md transition-all duration-500"
                :class="{
                  'bg-[#ff4d6d] drop-shadow-[0_0_4px_#ff4d6d]': todo.priority === 'high',
                  'bg-[#ffb703]': todo.priority === 'medium',
                  'bg-[#8ac926]': todo.priority === 'low',
                }"
              ></div>

              <!-- 勾选框 -->
              <div class="shrink-0 mr-3 flex items-center justify-center">
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="toggleTodo(todo.id)"
                  class="w-5 h-5 rounded-md border-2 border-white/20 bg-transparent accent-[#9d4edd] cursor-pointer hover:scale-110 transition-transform"
                />
              </div>

              <!-- 任务文本和辅助信息 -->
              <div class="flex-1 min-w-0 pr-2 overflow-hidden">
                <div
                  class="text-[0.9rem] font-medium leading-snug break-words transition-all duration-300"
                  :class="{ 'line-through text-white/30': todo.completed, 'text-white/90': !todo.completed }"
                >
                  {{ todo.text }}
                </div>
                
                <!-- 标签行 (日期 - 全部视图下展示具体日期) -->
                <div v-if="todo.dueDate" class="flex items-center gap-2 mt-1.5">
                  <div 
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] border"
                    :class="isExpired(todo.dueDate) && !todo.completed
                      ? 'bg-[#ff4d6d]/10 border-[#ff4d6d]/30 text-[#ff4d6d]' 
                      : 'bg-white/5 border-white/10 text-white/40'"
                  >
                    <span class="mr-1">📅</span>
                    {{ formatDate(todo.dueDate) }}
                  </div>
                </div>
              </div>

              <!-- 删除按钮 -->
              <button
                @click="triggerDelete(todo.id)"
                class="shrink-0 w-8 h-8 flex items-center justify-center text-white/20 text-xl leading-none opacity-0 group-hover:opacity-100 hover:text-[#ff4d6d] hover:bg-[#ff4d6d]/10 rounded-lg transition-all cursor-pointer"
              >
                ×
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 情况 B：特定过滤器视图 (单列表显示) -->
      <transition-group v-else name="list-item" tag="ul" class="list-none space-y-2.5 pb-2">
        <li
          v-for="todo in filteredTodos"
          :key="todo.id"
          class="relative flex items-center p-3 pl-4 bg-white/5 border border-white/10 rounded-xl group transition-all duration-300 hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98]"
          :class="{ 'opacity-50 grayscale-[0.3]': todo.completed }"
        >
          <!-- 优先级色条装饰 -->
          <div 
            class="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-md transition-all duration-500"
            :class="{
              'bg-[#ff4d6d] drop-shadow-[0_0_4px_#ff4d6d]': todo.priority === 'high',
              'bg-[#ffb703]': todo.priority === 'medium',
              'bg-[#8ac926]': todo.priority === 'low',
            }"
          ></div>

          <!-- 勾选框 -->
          <div class="shrink-0 mr-3 flex items-center justify-center">
            <input
              type="checkbox"
              :checked="todo.completed"
              @change="toggleTodo(todo.id)"
              class="w-5 h-5 rounded-md border-2 border-white/20 bg-transparent accent-[#9d4edd] cursor-pointer hover:scale-110 transition-transform"
            />
          </div>

          <!-- 任务文本和辅助信息 -->
          <div class="flex-1 min-w-0 pr-2 overflow-hidden">
            <div
              class="text-[0.9rem] font-medium leading-snug break-words transition-all duration-300"
              :class="{ 'line-through text-white/30': todo.completed, 'text-white/90': !todo.completed }"
            >
              {{ todo.text }}
            </div>
            
            <!-- 标签行 (日期) -->
            <div v-if="todo.dueDate" class="flex items-center gap-2 mt-1.5">
              <div 
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] border"
                :class="isExpired(todo.dueDate) && !todo.completed
                  ? 'bg-[#ff4d6d]/10 border-[#ff4d6d]/30 text-[#ff4d6d]' 
                  : 'bg-white/5 border-white/10 text-white/40'"
              >
                <span class="mr-1">📅</span>
                {{ isExpired(todo.dueDate) && !todo.completed ? t.overdue : t.dueDateLabel }}
                {{ formatDate(todo.dueDate) }}
              </div>
            </div>
          </div>

          <!-- 删除按钮 -->
          <button
            @click="triggerDelete(todo.id)"
            class="shrink-0 w-8 h-8 flex items-center justify-center text-white/20 text-xl leading-none opacity-0 group-hover:opacity-100 hover:text-[#ff4d6d] hover:bg-[#ff4d6d]/10 rounded-lg transition-all cursor-pointer"
          >
            ×
          </button>
        </li>
      </transition-group>

      <!-- 空状态 -->
      <transition name="fade">
        <div v-if="filteredTodos.length === 0" class="flex flex-col items-center justify-center pt-10 px-4 text-center opacity-40">
          <div class="text-4xl mb-3">✨</div>
          <p class="text-[0.85rem] leading-relaxed">{{ t.noTasks }}</p>
        </div>
      </transition>
    </div>

    <!-- 确认删除弹窗 -->
    <ConfirmModal 
      :show="isConfirmOpen"
      @confirm="handleConfirmDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
