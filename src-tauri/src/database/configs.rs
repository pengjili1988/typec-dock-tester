use crate::commands::config_commands::TestConfig;
use rusqlite::params;
use rusqlite::{Connection, Result as SqlResult};
use std::collections::HashMap;

/// 获取所有配置
pub fn list_configs() -> SqlResult<Vec<TestConfig>> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let mut stmt = conn.prepare(
        "SELECT config_data FROM configs ORDER BY updated_at DESC"
    )?;
    
    let configs = stmt.query_map([], |row| {
        let data: String = row.get(0)?;
        let config: TestConfig = serde_json::from_str(&data).unwrap_or_else(|_| {
            // 返回空配置作为fallback
            TestConfig {
                id: None,
                version: "1.0.0".to_string(),
                name: "Unknown".to_string(),
                created_at: None,
                updated_at: None,
                product: crate::commands::config_commands::ProductConfig {
                    model: "Unknown".to_string(),
                    vid: "0x0000".to_string(),
                    pid: "0x0000".to_string(),
                },
                test_items: crate::commands::config_commands::TestItemsConfig {
                    usb: true,
                    video: true,
                    audio: true,
                    network: true,
                    pd: true,
                    sd: true,
                    firmware: true,
                },
                usb: crate::commands::config_commands::UsbConfig {
                    enabled: true,
                    protocols: vec!["USB3.0".to_string()],
                    speed_thresholds: crate::commands::config_commands::SpeedThresholds {
                        read_min: 100.0,
                        write_min: 50.0,
                    },
                    voltage_range: crate::commands::config_commands::VoltageRange {
                        min: 4.75,
                        max: 5.25,
                    },
                    ovp_threshold: 5.8,
                    vid_pid_check: crate::commands::config_commands::VidPidCheck {
                        expected_vid: "0x1234".to_string(),
                        expected_pid: "0x5678".to_string(),
                    },
                    timeout: 30000,
                    retries: 3,
                },
                video: crate::commands::config_commands::VideoConfig {
                    enabled: true,
                    ports: vec![],
                },
                audio: crate::commands::config_commands::AudioConfig {
                    enabled: true,
                    ports: vec![],
                },
                network: crate::commands::config_commands::NetworkConfig {
                    enabled: true,
                    supported_speeds: vec!["1G".to_string()],
                    speed_thresholds: HashMap::new(),
                    mac_validation: crate::commands::config_commands::MacValidation {
                        format: "XX:XX:XX:XX:XX:XX".to_string(),
                    },
                    mac_burn_enabled: false,
                    mac_source: "config".to_string(),
                },
                pd: crate::commands::config_commands::PdConfig {
                    enabled: true,
                    protocols: vec!["PD3.0".to_string()],
                    voltages: vec![5.0, 9.0, 12.0],
                    currents: vec![1.5, 3.0],
                    max_power: 65.0,
                },
                sd: crate::commands::config_commands::SdConfig {
                    enabled: true,
                    protocols: vec!["SD".to_string()],
                    speed_thresholds: crate::commands::config_commands::SpeedThresholds {
                        read_min: 20.0,
                        write_min: 10.0,
                    },
                },
                firmware: crate::commands::config_commands::FirmwareConfig {
                    enabled: true,
                    firmware_types: vec!["USB".to_string()],
                },
            }
        });
        Ok(config)
    })?;
    
    configs.collect()
}

/// 根据ID获取配置
pub fn get_config(id: &str) -> SqlResult<Option<TestConfig>> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let mut stmt = conn.prepare("SELECT config_data FROM configs WHERE id = ?")?;
    
    let result = stmt.query_row(params![id], |row| {
        let data: String = row.get(0)?;
        let config: TestConfig = serde_json::from_str(&data)
            .map_err(|_| rusqlite::Error::InvalidQuery)?;
        Ok(config)
    });
    
    match result {
        Ok(config) => Ok(Some(config)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e),
    }
}

/// 保存配置
pub fn save_config(config: &TestConfig) -> SqlResult<bool> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let config_data = serde_json::to_string(config)
        .map_err(|_| rusqlite::Error::InvalidQuery)?;
    
    let id = config.id.as_ref().cloned().unwrap_or_else(|| {
        // 如果没有ID，生成一个新的UUID
        uuid::Uuid::new_v4().to_string()
    });
    
    let now = super::chrono_lite_timestamp();
    
    conn.execute(
        "INSERT OR REPLACE INTO configs (id, name, version, config_data, created_at, updated_at)
         VALUES (?, ?, ?, ?, COALESCE((SELECT created_at FROM configs WHERE id = ?), ?), ?)",
        params![id, config.name, config.version, config_data, id, now, now],
    )?;
    
    Ok(true)
}

/// 删除配置
pub fn delete_config(id: &str) -> SqlResult<bool> {
    let guard = super::get_connection()?;
    let conn = guard.as_ref().unwrap();
    
    let rows = conn.execute("DELETE FROM configs WHERE id = ?", params![id])?;
    Ok(rows > 0)
}
