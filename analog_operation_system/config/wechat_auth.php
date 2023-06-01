<?php
// +----------------------------------------------------------------------
// | 微信授权设置
// +----------------------------------------------------------------------
return [
    // AppID
    'app_id'        => '',
    // AppSecret
    'app_secret'    => '',
    // 授权回调地址
    'call_back'     => '',
    // state
    // 重定向后会带上state参数，该值会被微信原样返回，开发者可以将其进行比对，防止攻击
    'state'         => '',
];

$env = [
    'app_id',
    'app_secret',
    'call_back',
    'state'
];

foreach ($env as $item) {
    $config[$item] = Env::get('wechat_auth.' . $item, $config[$item]);
}

return $config;
