<?php

namespace weixinApi;

use think\facade\Config;

class WXOpenApi {

    /** @var string 授权地址 */
    const AUTHORIZEURL = "https://open.weixin.qq.com/connect/oauth2/authorize";

    /** @var string sns授权地址 */
    const OPENURL = "https://api.weixin.qq.com/sns/";

    /**
     * 获取授权Code
     * @return string 需要访问的链接
     */
    public function getCode() {
        // 返回授权地址
        return self::AUTHORIZEURL . 
            "?appid=" . Config::get('wechat_auth.app_id') . 
            "&redirect_uri=" . Config::get('wechat_auth.call_back') . 
            "&response_type=code" . 
            "&scope=snsapi_userinfo" . 
            "&state= " . Config::get('wechat_auth.app_id') . "#wechat_redirect";
    }


    /**
     * 微信sns授权通用接口（理论上）
     * @param string $url api接口地址
     * @param array $param 请求参数数组
     * @param false $isPOST 是否使用POST方式请求,默认使用GET方式
     * @return array 服务返回的JSON数组
     */
    public function snsRequest($url, $param = array(), $isPOST = false){

        // 发送HTTP请求
        return self::QueryURL(self::OPENURL.$url, $param, $isPOST);
    }

    /**
     * HTTP请求辅助函数
     * 对CURL使用简单封装，实现POST与GET请求
     * @param string $url api接口地址
     * @param array $param 请求参数数组
     * @param boolean $isPOST 是否使用POST方式请求,默认使用GET方式
     * @return array 服务返回的JSON数组
     */
    public static function QueryURL($url, $param = array(), $isPOST = false) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_HEADER, false);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
//         // 设置代理IP（测试时使用）
//        curl_setopt($ch, CURLOPT_PROXY, "127.0.0.1");
//         // 设置代理端口（测试时使用）
//        curl_setopt($ch, CURLOPT_PROXYPORT, "8080");
        if($isPOST) {
            // POST方式
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $param);
        }else if(!empty($param)) {
            // GET方式
            $xi = parse_url($url);
            $url .= empty($xi['query']) ? '?' : '&';
            $url .= http_build_query($param);
        }
        curl_setopt($ch, CURLOPT_URL, $url);
        $result = curl_exec($ch);
        curl_close($ch);

        return json_decode($result, true);
    }

}