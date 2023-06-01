<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2016 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: 流年 <liu21st@gmail.com>
// +----------------------------------------------------------------------

// 应用公共文件

/**
 * 授权检查
 */
function authorizationCheck() {
    if (empty(session(YIBAN_ID_SESSION_NAME)) && empty(session(WECHAT_ID_SESSION_NAME))) {
        Header("HTTP/1.1 200 Success");
        Header("Location: http://yiban.hbu.cn/error_page/401.html");
        exit;
    }
}