<?php

// +----------------------------------------------------------------------
// | 常量定义
// +----------------------------------------------------------------------

/** 应用名称 */
define('APP_NAME', Config::get('app.app_name'));

/** 网址 */
define('WEB_DIR', Config::get('app.app_host') . '/');
/** 静态资源地址 */
define('STATIC_DIR', Config::get('app.app_host') . '/public/static/');
/** 易班默认返回地址 */
define('YIBAN_DEFAULT_RETURN_DIR', '');
/** 微信默认返回地址 */
define('WECHAT_DEFAULT_RETURN_DIR', WEB_DIR . 'index/index/wechatIndex');

define('ROOT_DIR', str_replace('\\', '/', dirname(dirname(__FILE__))) . '/');
define('FILE_DIR', ROOT_DIR . 'public/static/');

/** SESSION名称 */
define('LOGIN_TYPE', APP_NAME . '_login_type');
define('YIBAN_ID_SESSION_NAME', APP_NAME . '_yiban_id');
define('WECHAT_ID_SESSION_NAME', APP_NAME . '_wechat_id');

/** Redis名称 */
define('YIBAN_ACCESS_TOKEN_NAME', APP_NAME . '_yiban_access_token_');
define('WECHAT_ACCESS_TOKEN_NAME', APP_NAME . '_yiban_access_token_');
define('ADMIN_ACCESS_TOKEN_NAME', 'index_access_token_');

/** 登录状态 */
define('YIBAN', 'YiBan');
define('WECHAT', 'WeChat');

/** 日志级别（级别递增） */
define('DEBUG_LOG', 'debug');           // 调试时使用（默认线上不打印该级别日志）
define('INFO_LOG', 'info');             // 一般日志
define('NOTICE_LOG', 'notice');         // 不报错，不影响正常流程，但是需要注意
define('WARNING_LOG', 'warning');       // 报错，不影响正常流程
define('ERROR_LOG', 'error');           // 报错，影响正常流程
define('CRITICAL_LOG', 'critical');     // 一般不使用该级别日志
define('ALERT_LOG', 'alert');           // 一般不使用该级别日志
define('EMERGENCY_LOG', 'emergency');   // 一般不使用该级别日志

//authcode加解密算法，密钥，如未使用可忽略此设置
define('AUTHKEY', '');
