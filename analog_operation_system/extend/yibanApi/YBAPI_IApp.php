<?php


namespace yibanApi;

use app\common\AppException;

class YBAPI_IApp
{

    const API_OAUTH_CODE = "oauth/authorize";

    private $appJsUrl = 'http://f.yiban.cn/'; //

    /**
     * 构造函数
     *
     * 使用YBOpenApi里的config数组初始化
     *
     * @param Array 配置（对应YBOpenApi里的config数组）
     */
    public function __construct($config)
    {
        foreach ($config as $key => $val) {
            $this->$key = $val;
        }
    }

    /**
     * 对轻应用授权进行验证
     *
     * 对于轻应用通过页面跳转的方式，
     * 认证时从GET的参数verify_request串中解密出相关授权信息
     * 如已经授权，显示应用内容，
     * 若末授权，则跳转到授权服务去进行授权
     *
     * @return array|false|Array
     */
    public function perform()
    {
        $code = isset($_GET['verify_request']) ? $_GET['verify_request'] : null;
        $appException = new AppException();

        if (!isset($code) || empty($code)) {
            $appException->setErrMessage(__FILE__, __LINE__, 'perform()方法调用错误，请检查是否在轻应用入口页面进行调用！');
            throw $appException;
        }
        $decInfo = $this->decrypts($code);
        if (!$decInfo) {
            $appException->setErrMessage(__FILE__, __LINE__, 'verify_request参数解密失败！');
            throw $appException;
        }
        if (!is_array($decInfo) || !isset($decInfo['visit_oauth'])) {
            $appException->setErrMessage(__FILE__, __LINE__, 'verify_request参数解密异常！');
            throw $appException;
        }
        if (!$decInfo['visit_oauth']) { //未授权跳转
            header('Location: ' . $this->forwardurl());
            exit();
        }
        return $decInfo;
    }

    //解密授权信息
    public function decrypts($code)
    {
        $encText = addslashes($code);
        $strText = pack("H*", $encText);
        // mcrypt_decrypt 在PHP7.2已弃用
        // $decText = (strlen($this->appid) == 16) ?
        //     mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $this->seckey, $strText, MCRYPT_MODE_CBC, $this->appid)
        //     :
        //     mcrypt_decrypt(MCRYPT_RIJNDAEL_256, $this->seckey, $strText, MCRYPT_MODE_CBC, $this->appid);

        // $decText = (strlen($this->appid) == 16) ?
        //     openssl_decrypt($strText, 'AES-128-ECB', $this->seckey, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $this->appid)
        //     :
        //     openssl_decrypt($strText, 'AES-256-CBC', $this->seckey, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $this->appid);

        $decText = openssl_decrypt($strText, 'AES-256-CBC', $this->seckey, OPENSSL_RAW_DATA | OPENSSL_ZERO_PADDING, $this->appid);

        if (empty($decText)) {
            return false;
        }
        $decInfo = json_decode(trim($decText), true);
        return $decInfo;
    }


    /**
     * 生成授权认证地址
     *
     * 重定向到授权地址
     * 获取授权认证的CODE用于取得访问令牌
     *
     * @return	String 授权认证页面地址
     */
    private function forwardurl()
    {
        assert(!empty($this->appid),   '未设置AppID值！');
        assert(!empty($this->backurl), '未设置回调地址！');

        $query = http_build_query(array(
            'client_id'        => $this->appid,
            'redirect_uri'    => $this->backurl,
            'display'        => 'html',
        ));

        return YBOpenApi::YIBAN_OPEN_URL . self::API_OAUTH_CODE . '?' . $query;
    }
}
