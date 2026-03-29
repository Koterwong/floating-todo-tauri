<!--
  ConfirmModal - 确认对话框组件
  功能：悬浮遮罩、确认与取消操作、玻璃拟态风格
-->
<script setup lang="ts">
import { useI18n } from '../composables/useI18n';

defineProps<{
  show: boolean;
  title?: string;
  message?: string;
}>();

const emit = defineEmits(['confirm', 'cancel']);
const { t } = useI18n();
</script>

<template>
  <transition name="modal-fade">
    <div v-if="show" class="fixed inset-0 z-[1000] flex items-center justify-center p-6">
      <!-- 遮罩层 -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" @click="emit('cancel')"></div>
      
      <!-- 对话框主体 -->
      <div 
        class="relative w-full max-w-[280px] bg-[#191923]/90 border border-white/10 rounded-2xl p-6 shadow-2xl glass-effect transform transition-all"
      >
        <div class="text-center">
          <div class="text-3xl mb-3">⚠️</div>
          <h3 class="text-lg font-semibold text-white mb-2 italic">
            {{ title || t.confirmDelete }}
          </h3>
          <p v-if="message" class="text-sm text-white/60 mb-6">
            {{ message }}
          </p>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            @click="emit('cancel')"
            class="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors cursor-pointer"
          >
            {{ t.cancel }}
          </button>
          <button
            @click="emit('confirm')"
            class="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff4d6d] to-[#c9184a] text-white text-sm font-semibold shadow-lg shadow-[#ff4d6d]/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {{ t.delete }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.glass-effect {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
  transform: scale(1);
}
</style>
