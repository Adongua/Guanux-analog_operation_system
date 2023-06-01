<?php

namespace app\index\controller;

use think\Controller;

use app\common\AppException;
use app\common\AppLog;
use app\common\RedisConnector;

use yibanApi\YBOpenApi;

/**
 * ThinkPHP 5.1
 * Class Index
 * @package app\index\controller
 * @author 城府
 * @data 2021-07-30 19:00:21
 */
class Index extends Controller
{
    /**
     * 入口函数
     */
    public function index()
    {
        return view('index', ['WEB' => WEB_DIR, 'DIR' => STATIC_DIR, 'FDIR' => FILE_DIR]);
    }

    /**
     * 将进程结果写入文件
     */
    public function writeRes()
    {
        $data = $_POST;
        $fp = fopen(FILE_DIR . "data/" . $data['filename'] . "_res.txt", 'w');
        fwrite($fp, "PATH:" . FILE_DIR . "data/" . $data['filename'] . "_res.txt\n" . "RES:" . $data['res']);
        fclose($fp);
        return 1;
    }

    /**
     * 将信息写入磁盘文件
     */
    public function writeDisk()
    {
        $data = $_POST;
        $fp = fopen(FILE_DIR . "disk/dist_C.txt", 'w');
        fwrite($fp, "fat:\n".$data['fat']."\n"."totalFiles:\n".$data['totalFiles']);
        fclose($fp);
        return 1;
    }

    /**
     * 将信息从磁盘文件中读出
     */
    public function readDisk()
    {
        $fp = fopen(FILE_DIR . "disk/dist_C.txt", 'r');
        $filesize = filesize(FILE_DIR . "disk/dist_C.txt");
        $content = fread($fp,$filesize);
        return $content;
    }

}
