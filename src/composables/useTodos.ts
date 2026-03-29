/**
 * useTodos - 待办事项管理 (增强版)
 *
 * 功能：
 * - 增删改查待办事项 (包含 ID、日期、优先级)
 * - 任务状态过滤 (全部/今日/即将/过期/完成)
 * - 任务数据统计 (进度百分比)
 * - 通过 tauri-plugin-store 持久化存储
 */
import { ref, computed } from 'vue';
import { Store } from '@tauri-apps/plugin-store';
import type { Todo, Priority } from '../types';

const todos = ref<Todo[]>([]);
const isInputVisible = ref(false);
const activeFilter = ref<'all' | 'today' | 'upcoming' | 'expired' | 'completed'>('today');
let store: Store | null = null;

/**
 * 初始化存储并加载已保存的待办事项
 * @param storeInstance - 共享的 Store 实例
 */
async function initTodos(storeInstance: Store) {
  store = storeInstance;
  const saved = await store.get<any[]>('todos');
  if (saved) {
    // 数据兼容性处理：为旧数据填充默认字段
    todos.value = saved.map((t) => ({
      id: t.id || Date.now().toString() + Math.random().toString(36).slice(2, 9),
      text: t.text || '',
      completed: !!t.completed,
      dueDate: t.dueDate || null,
      priority: t.priority || 'medium',
      createdAt: t.createdAt || new Date().toISOString(),
    }));
  }
}

/** 持久化保存到磁盘 */
async function persist() {
  if (store) {
    await store.set('todos', todos.value);
    await store.save();
  }
}

/** 添加新的待办事项 */
function addTodo(text: string, dueDate: string | null = null, priority: Priority = 'medium') {
  const trimmed = text.trim();
  if (!trimmed) return;
  
  const newTodo: Todo = {
    id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
    text: trimmed,
    completed: false,
    dueDate,
    priority,
    createdAt: new Date().toISOString(),
  };
  
  // 插入到开头以显示最新添加的任务
  todos.value.unshift(newTodo);
  persist();
}

/** 删除指定 ID 的待办事项 */
function deleteTodo(id: string) {
  const index = todos.value.findIndex(t => t.id === id);
  if (index !== -1) {
    todos.value.splice(index, 1);
    persist();
  }
}

/** 切换指定 ID 任务的完成状态 */
function toggleTodo(id: string) {
  const todo = todos.value.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    persist();
  }
}

/** 获取本地区域的当天日期字符串 (YYYY-MM-DD) */
export function getTodayStr() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** 过滤后的待办事项 */
const filteredTodos = computed(() => {
  const today = getTodayStr();
  let list = [...todos.value];
  
  /**
   * 基础排序逻辑：
   * 1. “未完成”任务优先级高于“已完成”。
   * 2. 对于“未完成”任务：按截止日期 (dueDate) 升序排列（越近的任务越靠前），没有日期的排在最后。
   * 3. 对于“已完成”任务：按创建时间 (createdAt) 倒序排列（最近完成的在前）。
   */
  list.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    
    if (!a.completed) {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 根据当前激活的过滤器返回对应的子集
  switch (activeFilter.value) {
    case 'completed':
      return list.filter(t => t.completed);
    case 'today':
      return list.filter(t => t.dueDate === today);
    case 'upcoming':
      return list.filter(t => t.dueDate && t.dueDate > today);
    case 'expired':
      return list.filter(t => t.dueDate && t.dueDate < today);
    case 'all':
    default:
      return list;
  }
});

/** 
 * 任务分组：仅在“全部 (All)”视图下生效。
 * 将任务细分为 今日、明天、即将、已过期、无日期、已完成历史 等分组。
 * 这里返回的 title 是 i18n 的 key。
 */
const groupedTodos = computed(() => {
  if (activeFilter.value !== 'all') return [];
  
  const today = getTodayStr();
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const day = String(d.getDate()).padStart(2, '0');
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  })();

  const groups: { title: string; items: Todo[] }[] = [];
  const list = filteredTodos.value;

  const todayItems = list.filter(t => t.dueDate === today);
  const tomorrowItems = list.filter(t => t.dueDate === tomorrow);
  const upcomingItems = list.filter(t => t.dueDate && t.dueDate > tomorrow);
  const expiredItems = list.filter(t => t.dueDate && t.dueDate < today && !t.completed);
  const noDateItems = list.filter(t => !t.dueDate);
  const completedHistory = list.filter(t => t.completed && t.dueDate !== today);

  if (todayItems.length > 0) groups.push({ title: 'filterToday', items: todayItems });
  if (tomorrowItems.length > 0) groups.push({ title: 'filterTomorrow', items: tomorrowItems });
  if (upcomingItems.length > 0) groups.push({ title: 'filterUpcoming', items: upcomingItems });
  if (expiredItems.length > 0) groups.push({ title: 'filterExpired', items: expiredItems });
  if (noDateItems.length > 0) groups.push({ title: 'filterNoDate', items: noDateItems });
  if (completedHistory.length > 0) groups.push({ title: 'filterCompleted', items: completedHistory });

  return groups;
});

/** 任务统计信息 (用于进度条等) */
const stats = computed(() => {
  // 统计逻辑根据当前过滤器动态变化
  const list = filteredTodos.value;
  const total = list.length;
  const completedCount = list.filter(t => t.completed).length;
  const ratio = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  
  return { total, completed: completedCount, ratio };
});

/**
 * 待办事项 composable
 */
export function useTodos() {
  return {
    todos,
    isInputVisible,
    activeFilter,
    filteredTodos,
    groupedTodos,
    stats,
    initTodos,
    addTodo,
    deleteTodo,
    toggleTodo,
    getTodayStr,
    saveTodos: persist,
  };
}
