use crate::models::*;

/// 获取配置
#[tauri::command]
pub async fn config_get(config_id: String) -> Result<Option<TestConfig>, String> {
    tracing::info!("Getting config: {}", config_id);
    match crate::database::configs::get_config(&config_id) {
        Ok(config) => Ok(config),
        Err(e) => {
            tracing::error!("Failed to get config: {:?}", e);
            Err(e.to_string())
        }
    }
}

/// 保存配置
#[tauri::command]
pub async fn config_save(config: TestConfig) -> Result<bool, String> {
    tracing::info!("Saving config: {}", config.name);
    match crate::database::configs::save_config(&config) {
        Ok(result) => Ok(result),
        Err(e) => {
            tracing::error!("Failed to save config: {:?}", e);
            Err(e.to_string())
        }
    }
}

/// 获取配置列表
#[tauri::command]
pub async fn config_list() -> Result<Vec<TestConfig>, String> {
    tracing::info!("Listing configs");
    match crate::database::configs::list_configs() {
        Ok(configs) => Ok(configs),
        Err(e) => {
            tracing::error!("Failed to list configs: {:?}", e);
            Err(e.to_string())
        }
    }
}

/// 删除配置
#[tauri::command]
pub async fn config_delete(config_id: String) -> Result<bool, String> {
    tracing::info!("Deleting config: {}", config_id);
    match crate::database::configs::delete_config(&config_id) {
        Ok(result) => Ok(result),
        Err(e) => {
            tracing::error!("Failed to delete config: {:?}", e);
            Err(e.to_string())
        }
    }
}

/// 导入配置
#[tauri::command]
pub async fn config_import(file_path: String) -> Result<TestConfig, String> {
    tracing::info!("Importing config from: {}", file_path);
    
    let content = std::fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
    
    let config: TestConfig = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config: {}", e))?;
    
    Ok(config)
}

/// 导出配置
#[tauri::command]
pub async fn config_export(config: TestConfig, file_path: String) -> Result<bool, String> {
    tracing::info!("Exporting config to: {}", file_path);
    
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    
    std::fs::write(&file_path, content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(true)
}
