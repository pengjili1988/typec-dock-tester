// Prevents additional console window on Windows in release
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;

use commands::*;
use std::panic;

fn main() {
    // 初始化日志
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive(tracing::Level::INFO.into()),
        )
        .init();

    // 设置panic钩子
    panic::set_hook(Box::new(|panic_info| {
        tracing::error!("Application panicked: {:?}", panic_info);
    }));

    // 运行应用
    dock_tester_lib::run();
}
