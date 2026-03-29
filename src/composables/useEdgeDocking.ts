/**
 * useEdgeDocking - 边缘吸附与自动隐藏管理
 *
 * 【核心原理】
 * 1. 窗口位置记忆：通过监听窗口移动，判断是否靠近屏幕边缘。
 * 2. 物理坐标轮询：由于 WebView 的 mouseenter/mouseleave 在窗口移出屏幕或被遮挡时不可靠，
 *    我们通过调用 Rust 后端的 `get_cursor_position` 直接获取系统级的全局物理坐标。
 * 3. 像素单位对齐：Tauri 的窗口操作（setPosition）使用物理像素，而 CSS 中使用逻辑像素。
 *    本模块统一在物理像素层面进行碰撞检测和位置计算，以确保跨高分屏（DPI）的一致性。
 *
 * 【状态流转】
 * - 未吸附 → 窗口拖至边缘 → 进入吸附态 (isDocked=true)，窗口收缩至只留 5px。
 * - 吸附态下 → 鼠标进入边缘感应区 → 呼出窗口 (isRevealed=true)。
 * - 呼出态下 → 鼠标离开窗口扩展区 → 重新收缩。
 * - 呼出态下 → 拖拽窗口远离边缘 → 彻底脱离吸附 (isDocked=false)。
 */
import { ref, onUnmounted } from 'vue';
import { getCurrentWindow, PhysicalPosition, currentMonitor } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api/core';
import type { DockEdge } from '../types';

/** 吸附状态 */
const isDocked = ref(false);
/** 吸附的边缘方向 */
const dockedEdge = ref<DockEdge | null>(null);
/** 窗口是否已经呼出（光标悬停中） */
const isRevealed = ref(false);

/** 轮询定时器 ID */
let pollInterval: ReturnType<typeof setInterval> | null = null;

/** 吸附后保留的像素感应宽度（物理像素） */
const HANDLE_SIZE = 5;
/** 轮询扩展的感应边距（光标在窗口外多远仍视为悬停） */
const HOVER_MARGIN = 10;
/** 靠近边缘多少像素触发吸附 */
const DOCK_THRESHOLD = 10;
/** 拖离边缘多少像素取消吸附 */
const UNDOCK_THRESHOLD = 30;

/**
 * 初始化边缘吸附监听
 * 监听窗口移动事件，检测是否靠近屏幕边缘
 */
async function setupEdgeDocking() {
  const appWindow = getCurrentWindow();

  appWindow.onMoved(async () => {
    // 正在轮询中（已吸附），忽略手动触发的 moved 事件
    if (isDocked.value) return;

    try {
      const bounds = await appWindow.outerPosition();
      const size = await appWindow.outerSize();
      const monitor = await currentMonitor();
      if (!monitor) return;

      const workArea = monitor.position;
      const workAreaSize = monitor.size;

      // 碰撞检测：窗口是否靠近某个边缘
      let edge: DockEdge | null = null;
      if (bounds.y <= workArea.y + DOCK_THRESHOLD) {
        edge = 'top';
      } else if (bounds.x <= workArea.x + DOCK_THRESHOLD) {
        edge = 'left';
      } else if (bounds.x + size.width >= workArea.x + workAreaSize.width - DOCK_THRESHOLD) {
        edge = 'right';
      }

      if (edge) {
        await dockWindow(edge);
      }
    } catch (e) {
      console.error('[EdgeDocking] 边缘检测失败:', e);
    }
  });
}

/**
 * 执行吸附：将窗口移到屏幕边缘外，只留一条细边
 */
async function dockWindow(edge: DockEdge) {
  const appWindow = getCurrentWindow();
  const bounds = await appWindow.outerPosition();
  const size = await appWindow.outerSize();
  const monitor = await currentMonitor();
  if (!monitor) return;

  isDocked.value = true;
  dockedEdge.value = edge;
  isRevealed.value = false;

  const workArea = monitor.position;
  const workAreaSize = monitor.size;

  let hiddenX = bounds.x;
  let hiddenY = bounds.y;

  if (edge === 'top') hiddenY = workArea.y - size.height + HANDLE_SIZE;
  if (edge === 'left') hiddenX = workArea.x - size.width + HANDLE_SIZE;
  if (edge === 'right') hiddenX = workArea.x + workAreaSize.width - HANDLE_SIZE;

  await appWindow.setPosition(new PhysicalPosition(hiddenX, hiddenY));

  // 吸附完成后启动光标轮询
  startDockPolling();
}

/**
 * 【核心】启动光标坐标轮询
 * 每 100ms 调用 Rust 后端获取光标位置，判断是否在感应区内
 */
function startDockPolling() {
  stopDockPolling(); // 清理旧的定时器

  pollInterval = setInterval(async () => {
    try {
      const appWindow = getCurrentWindow();
      if (!(await appWindow.isVisible())) return;

      // 通过 Rust 获取光标物理坐标
      const cursor = await invoke<{ x: number; y: number }>('get_cursor_position');
      const bounds = await appWindow.outerPosition();
      const size = await appWindow.outerSize();
      const monitor = await currentMonitor();
      if (!monitor) return;

      const workArea = monitor.position;
      const workAreaSize = monitor.size;

      // 扩展窗口区域，给光标一个"缓冲带"
      const expanded = {
        x: bounds.x - HOVER_MARGIN,
        y: bounds.y - HOVER_MARGIN,
        width: size.width + HOVER_MARGIN * 2,
        height: size.height + HOVER_MARGIN * 2,
      };

      // 判断光标是否在扩展区域内
      const isHovering =
        cursor.x >= expanded.x &&
        cursor.x <= expanded.x + expanded.width &&
        cursor.y >= expanded.y &&
        cursor.y <= expanded.y + expanded.height;

      if (isHovering && !isRevealed.value) {
        // 光标进入感应区 → 呼出窗口
        isRevealed.value = true;
        let revealX = bounds.x;
        let revealY = bounds.y;

        if (dockedEdge.value === 'top') revealY = workArea.y;
        if (dockedEdge.value === 'left') revealX = workArea.x;
        if (dockedEdge.value === 'right') revealX = workArea.x + workAreaSize.width - size.width;

        await appWindow.setPosition(new PhysicalPosition(revealX, revealY));
      } else if (!isHovering && isRevealed.value) {
        // 光标离开扩展区 → 重新隐藏
        isRevealed.value = false;
        let hideX = bounds.x;
        let hideY = bounds.y;

        if (dockedEdge.value === 'top') hideY = workArea.y - size.height + HANDLE_SIZE;
        if (dockedEdge.value === 'left') hideX = workArea.x - size.width + HANDLE_SIZE;
        if (dockedEdge.value === 'right') hideX = workArea.x + workAreaSize.width - HANDLE_SIZE;

        await appWindow.setPosition(new PhysicalPosition(hideX, hideY));
      }

      // 检测手动脱离吸附：用户在呼出状态下将窗口拖离边缘
      if (isRevealed.value) {
        const currentBounds = await appWindow.outerPosition();
        let undocked = false;

        if (dockedEdge.value === 'top' && currentBounds.y > workArea.y + UNDOCK_THRESHOLD) {
          undocked = true;
        }
        if (dockedEdge.value === 'left' && currentBounds.x > workArea.x + UNDOCK_THRESHOLD) {
          undocked = true;
        }
        if (
          dockedEdge.value === 'right' &&
          currentBounds.x + size.width < workArea.x + workAreaSize.width - UNDOCK_THRESHOLD
        ) {
          undocked = true;
        }

        if (undocked) {
          stopDockPolling();
          isDocked.value = false;
          dockedEdge.value = null;
          isRevealed.value = false;
        }
      }
    } catch (e) {
      console.error('[EdgeDocking] 轮询失败:', e);
    }
  }, 100);
}

/** 停止光标轮询 */
function stopDockPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

/**
 * 边缘吸附 composable
 */
export function useEdgeDocking() {
  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopDockPolling();
  });

  return {
    isDocked,
    dockedEdge,
    isRevealed,
    setupEdgeDocking,
  };
}
