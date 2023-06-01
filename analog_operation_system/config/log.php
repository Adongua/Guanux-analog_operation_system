<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006~2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

// +----------------------------------------------------------------------
// | 日志设置
// +----------------------------------------------------------------------
$config = [
    // 日志记录方式，内置 file socket 支持扩展
    'type'        => 'File',
    // 日志保存目录
    'path'        => '',
    // 日志记录级别
    'level'       => [INFO_LOG, NOTICE_LOG, WARNING_LOG, ERROR_LOG, CRITICAL_LOG, ALERT_LOG, EMERGENCY_LOG],
    // 单文件日志写入
    'single'      => false,
    // 独立日志级别
    'apart_level' => [NOTICE_LOG, WARNING_LOG, ERROR_LOG, CRITICAL_LOG, ALERT_LOG, EMERGENCY_LOG],
    // 最大日志文件数量
    'max_files'   => 30,
    // 是否关闭日志写入
    'close'       => false,
];

// .env可配置的字段
$env = [
    'level',
];

foreach ($env as $item) {
    $config[$item] = Env::get('log.' . $item, $config[$item]);
}

return $config;
