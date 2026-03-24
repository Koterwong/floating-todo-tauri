// Tauri 后端入口
// 提供窗口管理、插件初始化和自定义命令

use serde::Serialize;

/// 光标坐标结构体，序列化后传递给前端
#[derive(Serialize)]
struct CursorPosition {
    x: i32,
    y: i32,
}

/// 获取当前鼠标光标的屏幕坐标（物理像素）
/// 通过 Windows API `GetCursorPos` 实现，无需依赖 WebView 事件
#[tauri::command]
fn get_cursor_position() -> CursorPosition {
    #[cfg(target_os = "windows")]
    {
        use std::mem::MaybeUninit;

        #[repr(C)]
        struct POINT {
            x: i32,
            y: i32,
        }

        extern "system" {
            fn GetCursorPos(lp_point: *mut POINT) -> i32;
        }

        let mut point = MaybeUninit::<POINT>::uninit();
        unsafe {
            GetCursorPos(point.as_mut_ptr());
            let point = point.assume_init();
            CursorPosition {
                x: point.x,
                y: point.y,
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 非 Windows 平台暂时返回 (0, 0)
        CursorPosition { x: 0, y: 0 }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_cursor_position])
        .run(tauri::generate_context!())
        .expect("启动 Tauri 应用失败");
}
