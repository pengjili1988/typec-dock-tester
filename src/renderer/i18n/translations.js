window.i18n = {
  zh: {
    // 应用标题
    appTitle: 'XFANIC TYPE-C 扩展坞多功能测试系统',
    appSubtitle: '深圳市湘凡科技有限公司',
    
    // 导航
    nav: {
      home: '测试主界面',
      usb: 'USB功能',
      video: '视频接口',
      audio: '音频功能',
      sdcard: 'SD/TF卡',
      network: '网络接口',
      pd: 'PD充电',
      fw: '固件管理',
      settings: '系统设置',
      users: '用户管理',
      fileManager: '文件管理'
    },

    // 主界面
    home: {
      deviceInfo: '设备信息',
      testProgress: '测试进度',
      testResult: '测试结果',
      scanBarcode: '扫描条形码',
      startTest: '开始测试',
      stopTest: '停止测试',
      resetTest: '重置',
      selectModel: '选择机型',
      testMode: '测试模式',
      singleSide: '单面测试',
      doubleSide: '双面测试',
      currentFile: '当前测试文件',
      testStatus: '测试状态',
      waiting: '等待中',
      testing: '测试中',
      pass: '通过',
      fail: '不合格',
      noTest: '未测试',
      totalProgress: '总体进度',
      passRate: '良率',
      testCount: '测试次数',
      passCount: '通过数',
      failCount: '不合格数',
      errorCode: '不良代码',
      testTime: '测试时间',
      operator: '操作员',
      barcode: '产品条码',
      mesStatus: 'MES状态',
      connected: '已连接',
      disconnected: '未连接'
    },

    // USB功能
    usb: {
      title: 'USB功能测试',
      protocol: '协议',
      readSpeed: '读取速度',
      writeSpeed: '写入速度',
      voltage: '电压',
      shortCircuit: '开/短路',
      overvoltage: '过压保护',
      fw: '固件版本',
      pid: 'PID',
      vid: 'VID',
      usb20: 'USB 2.0',
      usb30: 'USB 3.0',
      usb31: 'USB 3.1',
      usb32: 'USB 3.2',
      usb4: 'USB 4',
      minSpeed: '最小速度',
      maxSpeed: '最大速度',
      minVoltage: '最小电压',
      maxVoltage: '最大电压',
      expectedFw: '预期固件',
      expectedPid: '预期PID',
      expectedVid: '预期VID',
      enabled: '启用',
      port1: '接口A面',
      port2: '接口B面'
    },

    // 视频
    video: {
      title: '视频接口测试',
      rgbColor: 'RGB色调',
      hz: '刷新率(Hz)',
      resolution: '分辨率',
      pixelCompare: '像素点对比',
      vga: 'VGA',
      dp12: 'DP 1.2',
      dp14: 'DP 1.4',
      hdmi14: 'HDMI 1.4',
      hdmi20: 'HDMI 2.0/2.1',
      minHz: '最小刷新率',
      maxHz: '最大刷新率',
      minResW: '最小宽度',
      minResH: '最小高度',
      maxResW: '最大宽度',
      maxResH: '最大高度'
    },

    // 音频
    audio: {
      title: '音频功能测试',
      channelDetect: '声道识别',
      freqDetect: '频率检测',
      freqJudge: '频率判定',
      sampleRate: '采样率',
      audioOut: '音频输出',
      audioIn: '录音',
      minFreq: '最小频率(Hz)',
      maxFreq: '最大频率(Hz)',
      expectedChannels: '预期声道数',
      minSampleRate: '最小采样率'
    },

    // SD卡
    sdcard: {
      title: 'SD/TF卡测试',
      protocol: '协议',
      readSpeed: '读取速度',
      writeSpeed: '写入速度',
      fw: '固件版本',
      sd30: 'SD/TF 3.0',
      sd40: 'SD/TF 4.0',
      minReadSpeed: '最小读速(MB/s)',
      minWriteSpeed: '最小写速(MB/s)',
      expectedFw: '预期固件'
    },

    // 网络
    network: {
      title: '网络接口测试',
      speed: '传输速率',
      macCode: 'MAC码',
      n100m: '100M',
      n1000m: '1000M',
      n25g: '2.5G',
      n5g: '5G',
      macBurn: 'MAC码烧录',
      macRule: 'MAC规则对比',
      macPrefix: 'MAC前缀',
      minSpeed: '最小速率(Mbps)'
    },

    // PD充电
    pd: {
      title: 'PD充电功能测试',
      protocol: '充电协议',
      voltage: '电压(V)',
      current: '电流(A)',
      power: '功率(W)',
      fw: '固件版本',
      pd20: 'PD 2.0',
      pd30: 'PD 3.0',
      pd31: 'PD 3.1',
      minVoltage: '最小电压',
      maxVoltage: '最大电压',
      minCurrent: '最小电流',
      maxCurrent: '最大电流',
      minPower: '最小功率',
      maxPower: '最大功率',
      expectedFw: '预期固件'
    },

    // 固件管理
    fw: {
      title: '固件管理',
      usbFw: 'USB固件',
      sdFw: 'SD/TF固件',
      videoFw: '视频固件',
      pdFw: 'PD固件',
      networkMac: '网络MAC码',
      read: '读取',
      compare: '对比判定',
      burn: '烧录',
      ruleCompare: '规则对比',
      expectedVersion: '预期版本',
      action: '操作'
    },

    // 设置
    settings: {
      title: '系统设置',
      language: '语言',
      mesServer: 'MES服务器',
      mesPort: 'MES端口',
      mesEnabled: '启用MES',
      plcServer: 'PLC控制器',
      plcPort: 'PLC端口',
      plcEnabled: '启用PLC',
      autoTest: '自动测试',
      buzzAlarm: '蜂鸣器报警',
      lightAlarm: '灯光报警',
      saveResult: '保存测试结果',
      resultPath: '结果保存路径',
      browse: '浏览',
      save: '保存',
      cancel: '取消',
      apply: '应用'
    },

    // 用户管理
    users: {
      title: '用户管理',
      login: '用户登录',
      logout: '注销',
      username: '用户名',
      password: '密码',
      role: '角色',
      admin: '管理员',
      operator: '操作员',
      engineer: '工程师',
      addUser: '添加用户',
      deleteUser: '删除用户',
      changePassword: '修改密码',
      currentUser: '当前用户',
      loginSuccess: '登录成功',
      loginFailed: '用户名或密码错误',
      noPermission: '权限不足，请先登录管理员账号',
      confirmDelete: '确认删除此用户？'
    },

    // 文件管理
    fileManager: {
      title: '测试文件管理',
      fileName: '文件名称',
      createTime: '创建时间',
      modifyTime: '修改时间',
      model: '机型',
      newFile: '新建',
      importFile: '导入',
      exportFile: '导出',
      applyFile: '应用',
      deleteFile: '删除',
      renameFile: '重命名',
      copyFile: '另存为',
      confirmApply: '确认应用此测试文件？',
      confirmDelete: '确认删除此测试文件？'
    },

    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      apply: '应用',
      reset: '重置',
      delete: '删除',
      edit: '编辑',
      add: '新增',
      import: '导入',
      export: '导出',
      close: '关闭',
      confirm: '确认',
      yes: '是',
      no: '否',
      enabled: '启用',
      disabled: '禁用',
      unit_mbps: 'MB/s',
      unit_v: 'V',
      unit_a: 'A',
      unit_w: 'W',
      unit_hz: 'Hz',
      status_pass: 'PASS',
      status_fail: 'FAIL',
      status_skip: 'SKIP',
      status_testing: '测试中',
      status_waiting: '等待中',
      testItem: '测试项目',
      measuredValue: '实测值',
      limitValue: '限制值',
      result: '结果',
      remarks: '备注',
      all: '全部',
      portA: 'A面',
      portB: 'B面'
    }
  },

  vi: {
    // Tiêu đề ứng dụng
    appTitle: 'Hệ thống kiểm tra đa chức năng XFANIC TYPE-C Dock',
    appSubtitle: 'Công ty TNHH Công nghệ Xiangfan Thâm Quyến',

    // Điều hướng
    nav: {
      home: 'Giao diện chính',
      usb: 'Chức năng USB',
      video: 'Giao diện video',
      audio: 'Chức năng âm thanh',
      sdcard: 'Thẻ SD/TF',
      network: 'Giao diện mạng',
      pd: 'Sạc PD',
      fw: 'Quản lý firmware',
      settings: 'Cài đặt hệ thống',
      users: 'Quản lý người dùng',
      fileManager: 'Quản lý tệp'
    },

    // Giao diện chính
    home: {
      deviceInfo: 'Thông tin thiết bị',
      testProgress: 'Tiến độ kiểm tra',
      testResult: 'Kết quả kiểm tra',
      scanBarcode: 'Quét mã vạch',
      startTest: 'Bắt đầu kiểm tra',
      stopTest: 'Dừng kiểm tra',
      resetTest: 'Đặt lại',
      selectModel: 'Chọn model',
      testMode: 'Chế độ kiểm tra',
      singleSide: 'Kiểm tra 1 mặt',
      doubleSide: 'Kiểm tra 2 mặt',
      currentFile: 'Tệp kiểm tra hiện tại',
      testStatus: 'Trạng thái kiểm tra',
      waiting: 'Đang chờ',
      testing: 'Đang kiểm tra',
      pass: 'Đạt',
      fail: 'Không đạt',
      noTest: 'Chưa kiểm tra',
      totalProgress: 'Tiến độ tổng thể',
      passRate: 'Tỉ lệ đạt',
      testCount: 'Số lần kiểm tra',
      passCount: 'Số lần đạt',
      failCount: 'Số lần không đạt',
      errorCode: 'Mã lỗi',
      testTime: 'Thời gian kiểm tra',
      operator: 'Người vận hành',
      barcode: 'Mã vạch sản phẩm',
      mesStatus: 'Trạng thái MES',
      connected: 'Đã kết nối',
      disconnected: 'Chưa kết nối'
    },

    // USB
    usb: {
      title: 'Kiểm tra chức năng USB',
      protocol: 'Giao thức',
      readSpeed: 'Tốc độ đọc',
      writeSpeed: 'Tốc độ ghi',
      voltage: 'Điện áp',
      shortCircuit: 'Hở/Ngắn mạch',
      overvoltage: 'Bảo vệ quá áp',
      fw: 'Phiên bản firmware',
      pid: 'PID',
      vid: 'VID',
      usb20: 'USB 2.0',
      usb30: 'USB 3.0',
      usb31: 'USB 3.1',
      usb32: 'USB 3.2',
      usb4: 'USB 4',
      minSpeed: 'Tốc độ tối thiểu',
      maxSpeed: 'Tốc độ tối đa',
      minVoltage: 'Điện áp tối thiểu',
      maxVoltage: 'Điện áp tối đa',
      expectedFw: 'Firmware dự kiến',
      expectedPid: 'PID dự kiến',
      expectedVid: 'VID dự kiến',
      enabled: 'Bật',
      port1: 'Cổng mặt A',
      port2: 'Cổng mặt B'
    },

    // Video
    video: {
      title: 'Kiểm tra giao diện video',
      rgbColor: 'Màu RGB',
      hz: 'Tần số quét (Hz)',
      resolution: 'Độ phân giải',
      pixelCompare: 'So sánh điểm ảnh',
      vga: 'VGA',
      dp12: 'DP 1.2',
      dp14: 'DP 1.4',
      hdmi14: 'HDMI 1.4',
      hdmi20: 'HDMI 2.0/2.1',
      minHz: 'Tần số tối thiểu',
      maxHz: 'Tần số tối đa',
      minResW: 'Chiều rộng tối thiểu',
      minResH: 'Chiều cao tối thiểu',
      maxResW: 'Chiều rộng tối đa',
      maxResH: 'Chiều cao tối đa'
    },

    // Âm thanh
    audio: {
      title: 'Kiểm tra chức năng âm thanh',
      channelDetect: 'Nhận dạng kênh',
      freqDetect: 'Phát hiện tần số',
      freqJudge: 'Đánh giá tần số',
      sampleRate: 'Tần số lấy mẫu',
      audioOut: 'Âm thanh ra',
      audioIn: 'Ghi âm',
      minFreq: 'Tần số tối thiểu (Hz)',
      maxFreq: 'Tần số tối đa (Hz)',
      expectedChannels: 'Số kênh dự kiến',
      minSampleRate: 'Tần số lấy mẫu tối thiểu'
    },

    // Thẻ SD
    sdcard: {
      title: 'Kiểm tra thẻ SD/TF',
      protocol: 'Giao thức',
      readSpeed: 'Tốc độ đọc',
      writeSpeed: 'Tốc độ ghi',
      fw: 'Phiên bản firmware',
      sd30: 'SD/TF 3.0',
      sd40: 'SD/TF 4.0',
      minReadSpeed: 'Tốc độ đọc tối thiểu (MB/s)',
      minWriteSpeed: 'Tốc độ ghi tối thiểu (MB/s)',
      expectedFw: 'Firmware dự kiến'
    },

    // Mạng
    network: {
      title: 'Kiểm tra giao diện mạng',
      speed: 'Tốc độ truyền',
      macCode: 'Mã MAC',
      n100m: '100M',
      n1000m: '1000M',
      n25g: '2.5G',
      n5g: '5G',
      macBurn: 'Ghi mã MAC',
      macRule: 'So sánh quy tắc MAC',
      macPrefix: 'Tiền tố MAC',
      minSpeed: 'Tốc độ tối thiểu (Mbps)'
    },

    // PD
    pd: {
      title: 'Kiểm tra chức năng sạc PD',
      protocol: 'Giao thức sạc',
      voltage: 'Điện áp (V)',
      current: 'Dòng điện (A)',
      power: 'Công suất (W)',
      fw: 'Phiên bản firmware',
      pd20: 'PD 2.0',
      pd30: 'PD 3.0',
      pd31: 'PD 3.1',
      minVoltage: 'Điện áp tối thiểu',
      maxVoltage: 'Điện áp tối đa',
      minCurrent: 'Dòng điện tối thiểu',
      maxCurrent: 'Dòng điện tối đa',
      minPower: 'Công suất tối thiểu',
      maxPower: 'Công suất tối đa',
      expectedFw: 'Firmware dự kiến'
    },

    // Firmware
    fw: {
      title: 'Quản lý firmware',
      usbFw: 'Firmware USB',
      sdFw: 'Firmware SD/TF',
      videoFw: 'Firmware video',
      pdFw: 'Firmware PD',
      networkMac: 'Mã MAC mạng',
      read: 'Đọc',
      compare: 'So sánh',
      burn: 'Ghi',
      ruleCompare: 'So sánh quy tắc',
      expectedVersion: 'Phiên bản dự kiến',
      action: 'Thao tác'
    },

    // Cài đặt
    settings: {
      title: 'Cài đặt hệ thống',
      language: 'Ngôn ngữ',
      mesServer: 'Máy chủ MES',
      mesPort: 'Cổng MES',
      mesEnabled: 'Bật MES',
      plcServer: 'Bộ điều khiển PLC',
      plcPort: 'Cổng PLC',
      plcEnabled: 'Bật PLC',
      autoTest: 'Kiểm tra tự động',
      buzzAlarm: 'Còi báo động',
      lightAlarm: 'Đèn báo động',
      saveResult: 'Lưu kết quả kiểm tra',
      resultPath: 'Đường dẫn lưu kết quả',
      browse: 'Duyệt',
      save: 'Lưu',
      cancel: 'Hủy',
      apply: 'Áp dụng'
    },

    // Người dùng
    users: {
      title: 'Quản lý người dùng',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      role: 'Vai trò',
      admin: 'Quản trị viên',
      operator: 'Người vận hành',
      engineer: 'Kỹ sư',
      addUser: 'Thêm người dùng',
      deleteUser: 'Xóa người dùng',
      changePassword: 'Đổi mật khẩu',
      currentUser: 'Người dùng hiện tại',
      loginSuccess: 'Đăng nhập thành công',
      loginFailed: 'Tên đăng nhập hoặc mật khẩu sai',
      noPermission: 'Không đủ quyền, vui lòng đăng nhập tài khoản quản trị viên',
      confirmDelete: 'Xác nhận xóa người dùng này?'
    },

    // Quản lý tệp
    fileManager: {
      title: 'Quản lý tệp kiểm tra',
      fileName: 'Tên tệp',
      createTime: 'Thời gian tạo',
      modifyTime: 'Thời gian sửa đổi',
      model: 'Model',
      newFile: 'Tạo mới',
      importFile: 'Nhập',
      exportFile: 'Xuất',
      applyFile: 'Áp dụng',
      deleteFile: 'Xóa',
      renameFile: 'Đổi tên',
      copyFile: 'Lưu thành',
      confirmApply: 'Xác nhận áp dụng tệp kiểm tra này?',
      confirmDelete: 'Xác nhận xóa tệp kiểm tra này?'
    },

    // Chung
    common: {
      save: 'Lưu',
      cancel: 'Hủy',
      apply: 'Áp dụng',
      reset: 'Đặt lại',
      delete: 'Xóa',
      edit: 'Chỉnh sửa',
      add: 'Thêm',
      import: 'Nhập',
      export: 'Xuất',
      close: 'Đóng',
      confirm: 'Xác nhận',
      yes: 'Có',
      no: 'Không',
      enabled: 'Bật',
      disabled: 'Tắt',
      unit_mbps: 'MB/s',
      unit_v: 'V',
      unit_a: 'A',
      unit_w: 'W',
      unit_hz: 'Hz',
      status_pass: 'ĐẠT',
      status_fail: 'KHÔNG ĐẠT',
      status_skip: 'BỎ QUA',
      status_testing: 'Đang kiểm tra',
      status_waiting: 'Đang chờ',
      testItem: 'Hạng mục kiểm tra',
      measuredValue: 'Giá trị đo được',
      limitValue: 'Giá trị giới hạn',
      result: 'Kết quả',
      remarks: 'Ghi chú',
      all: 'Tất cả',
      portA: 'Mặt A',
      portB: 'Mặt B'
    }
  }
};
