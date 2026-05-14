use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

// 测试状态
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestStatus {
    pub is_running: bool,
    pub is_paused: bool,
    pub progress: u32,
    pub current_item: Option<String>,
    pub start_time: Option<String>,
}

// 测试结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub id: String,
    pub config_id: String,
    pub config_name: String,
    pub start_time: String,
    pub end_time: String,
    pub status: String,
    pub summary: TestSummary,
    pub items: Vec<TestResultItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestSummary {
    pub total: u32,
    pub passed: u32,
    pub failed: u32,
    pub pass_rate: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResultItem {
    pub code: String,
    pub name: String,
    pub status: String,
    pub actual_value: Option<f64>,
    pub expected_value: Option<f64>,
    pub unit: Option<String>,
    pub error_message: Option<String>,
}

// 应用状态
pub struct AppState {
    pub test_running: Mutex<bool>,
    pub test_result: Mutex<Option<TestResult>>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            test_running: Mutex::new(false),
            test_result: Mutex::new(None),
        }
    }
}

/// 开始测试
#[tauri::command]
pub async fn test_start(
    config_id: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    tracing::info!("Starting test with config: {}", config_id);
    
    // 在await之前设置状态
    {
        let mut running = state.test_running.lock().map_err(|e| e.to_string())?;
        *running = true;
    }
    
    // TODO: 实现实际的测试逻辑
    // 这里模拟测试过程
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    
    Ok(true)
}

/// 停止测试
#[tauri::command]
pub async fn test_stop(state: State<'_, AppState>) -> Result<bool, String> {
    tracing::info!("Stopping test");
    
    let mut running = state.test_running.lock().map_err(|e| e.to_string())?;
    *running = false;
    
    Ok(true)
}

/// 获取测试状态
#[tauri::command]
pub async fn test_get_status(state: State<'_, AppState>) -> Result<TestStatus, String> {
    let running = state.test_running.lock().map_err(|e| e.to_string())?;
    
    Ok(TestStatus {
        is_running: *running,
        is_paused: false,
        progress: 0,
        current_item: None,
        start_time: None,
    })
}

/// 获取测试结果
#[tauri::command]
pub async fn test_get_result(state: State<'_, AppState>) -> Result<Option<TestResult>, String> {
    let result = state.test_result.lock().map_err(|e| e.to_string())?;
    Ok(result.clone())
}
