<?php

// +----------------------------------------------------------------------
// | Redis设置
// +----------------------------------------------------------------------

$config = [
    //本地服务器地址
    'hostname'        => '127.0.0.1',
    // 端口
    'hostport'        => '6379',
];

// .env可配置的字段
$env = [
    'hostname',
    'hostport'
];

foreach ($env as $item) {
    $config[$item] = Env::get('redis.' . $item, $config[$item]);
}

return $config;
