<?php
// +----------------------------------------------------------------------
// | 易班授权设置
// +----------------------------------------------------------------------
$config = [
    //此处填写你的AppID
    'app_id'        => '',
    //此处填写你的AppSecret
    'app_secret'    => '',
    //此处填写你的授权回调地址
    'call_back'     => '',
];

$env = [
    'app_id',
    'app_secret',
    'call_back'
];

foreach ($env as $item) {
    $config[$item] = Env::get('yiban_auth.' . $item, $config[$item]);
}

return $config;
