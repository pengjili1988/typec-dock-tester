use serde::{Deserialize, Serialize};
use tauri::Manager;

/// 配置数据结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestConfig {
    pub id: Option<String>,
    pub version: String,
    pub name: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
    pub product: ProductConfig,
    #[serde(rename = "testItems")]
    pub test_items: TestItemsConfig,
    pub usb: UsbConfig,
    pub video: VideoConfig,
    pub audio: AudioConfig,
    pub network: NetworkConfig,
    pub pd: PdConfig,
    pub sd: SdConfig,
    pub firmware: FirmwareConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductConfig {
    pub model: String,
    pub vid: String,
    pub pid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestItemsConfig {
    pub usb: bool,
    pub video: bool,
    pub audio: bool,
    pub network: bool,
    pub pd: bool,
    pub sd: bool,
    pub firmware: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsbConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: SpeedThresholds,
    #[serde(rename = "voltageRange")]
    pub voltage_range: VoltageRange,
    #[serde(rename = "ovpThreshold")]
    pub ovp_threshold: f64,
    #[serde(rename = "vidPidCheck")]
    pub vid_pid_check: VidPidCheck,
    pub timeout: u32,
    pub retries: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpeedThresholds {
    #[serde(rename = "readMin")]
    pub read_min: f64,
    #[serde(rename = "writeMin")]
    pub write_min: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoltageRange {
    pub min: f64,
    pub max: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VidPidCheck {
    #[serde(rename = "expectedVid")]
    pub expected_vid: String,
    #[serde(rename = "expectedPid")]
    pub expected_pid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoConfig {
    pub enabled: bool,
    pub ports: Vec<VideoPort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VideoPort {
    #[serde(rename = "portType")]
    pub port_type: String,
    pub protocol: String,
    pub resolutions: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioConfig {
    pub enabled: bool,
    pub ports: Vec<AudioPort>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioPort {
    #[serde(rename = "portType")]
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkConfig {
    pub enabled: bool,
    #[serde(rename = "supportedSpeeds")]
    pub supported_speeds: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: std::collections::HashMap<String, f64>,
    #[serde(rename = "macValidation")]
    pub mac_validation: MacValidation,
    #[serde(rename = "macBurnEnabled")]
    pub mac_burn_enabled: bool,
    #[serde(rename = "macSource")]
    pub mac_source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MacValidation {
    pub format: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PdConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    pub voltages: Vec<f64>,
    pub currents: Vec<f64>,
    #[serde(rename = "maxPower")]
    pub max_power: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SdConfig {
    pub enabled: bool,
    pub protocols: Vec<String>,
    #[serde(rename = "speedThresholds")]
    pub speed_thresholds: SpeedThresholds,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FirmwareConfig {
    pub enabled: bool,
    #[serde(rename = "firmwareTypes")]
    pub firmware_types: Vec<String>,
}

/// 获取配置
#[tauri::command]
pub async fn config_get(config_id: String) -> Result<Option<TestConfig>, String> {
    tracing::info!("Getting config: {}", config_id);
    // 从数据库加载配置
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
    // 保存到数据库
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
    // 从数据库加载配置列表
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
    // 从数据库删除配置
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
