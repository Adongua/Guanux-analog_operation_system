// 全局变量区--begin
class filemodal {
    constructor(filename, filetype, fileattr, startnum, size, isOnlyRead, isHide, fa, filecontent, subfile) {
        this.filename = filename;
        this.filetype = filetype;
        this.fileattr = fileattr;//2为文件，3为目录
        this.startnum = startnum;
        this.size = size;
        this.isOnlyRead = isOnlyRead;
        this.isHide = isHide;
        this.fa = fa;
        this.filecontent = filecontent;
        this.subfile = subfile;
    }
}

const MAX_DISK_SIZE = 128;

var fat;
var totalFiles;
var root;
var nowCatalog;
var editing;


// 全局变量区--end

// 方法区--begin
function initFileSys() {
    totalFiles = new Map();
    root = new filemodal("root", "", 3, 2, 1, false, false, null, "", new Map());
    totalFiles.set("root", root);
    $("#commandInput").prop("placeholder", "root/");
    // 初始化磁盘
    var cnt = 0;
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 16; j++) {
            var ele = "<div id='db" + cnt + "' style='width:12px;height: 12px;background-color:rgb(0, 195, 255);float: left;margin-left:2.8%;margin-top:4.4%'></div>";
            $("#disk").append(ele);
            cnt++;
        }
    }
    fat = new Array();
    // fat.push(125), fat.push(255), fat.push(255);//第0，1块存放文件分配表，fat[0]=125表示剩余125个磁盘块，fat[i]=255表示磁盘块占用
    // $("#db0").css("background-color", "red"); $("#db1").css("background-color", "red"); $("#db2").css("background-color", "red");
    // for (var i = 3; i < MAX_DISK_SIZE; i++) fat.push(0);
    readFile();
    console.log(totalFiles);
    nowCatalog = root;
    console.log("当前目录为：");
    console.log(nowCatalog);
    for (var i = 0; i < MAX_DISK_SIZE; i++) {
        console.log(fat[i]);
        if (fat[i] == 0) $("#db" + i).css("background-color", "rgb(0, 195, 255)");
        else $("#db" + i).css("background-color", "red");
    }
}

// 向fat表申请空间
function setFat(size) {
    var startnum = new Array();
    var i = 3;
    for (var j = 0; j < size; i++) {
        if (fat[i] == 0) {
            startnum.push(i);
            if (j > 0) {
                fat[startnum[j - 1]] = i;
                $("#db" + startnum[j - 1]).css("background-color", "red");
            }
            j++;
        }
    }
    fat[i - 1] = 255;
    $("#db" + (i - 1)).css("background-color", "red");
    return startnum[0];
}

// 删除时释放FAT表的空间
function delFat(startnum) {
    var nextp = fat[startnum];
    var nowp = startnum;
    var cnt = 0;
    while (fat[nowp] != 0) {
        nextp = fat[nextp];
        if (nextp == 255) {
            fat[nowp] = 0;
            $("#db" + nowp).css("background-color", "rgb(0, 195, 255)");
            cnt++;
            break;
        }
        else {
            fat[nowp] = 0;
            $("#db" + nowp).css("background-color", "rgb(0, 195, 255)");
            cnt++;
            nowp = nextp;
        }
    }
    fat[0] += cnt;
}

// 向文件追加内容，需打开文件后操作
function reAdd(filename, addsize) {
    // size是所占磁盘数？
    if (fat[0] >= addsize) {
        nowCatalog = nowCatalog.fa;
        if (nowCatalog.subfile.has(filename)) {
            var value = nowCatalog.subfile.get(filename);
            if (value.fileattr == 2) {
                value.size += addsize;
                reAddFat(value.startnum, addsize);
                console.log("追加内容成功！");//提示追加内容成功
                //openFile();打开文件
            }
            else {
                console.log("追加内容失败！");//提示追加内容失败
            }
        }
        else {
            console.log("追加内容失败！");//提示追加内容失败
            //showFile();
        }
    }
    else {
        console.log("磁盘空间不足");//提示追加内容失败
    }
}

// 追加内容修改fat表
function reAddFat(startnum, addsize) {
    var nowp = startnum;
    var nextp = fat[startnum];
    while (fat[nowp] != 255) {
        nowp = nextp;
        nextp = fat[nowp];
    }
    for (var i = 3, cnt = 0; i < MAX_DISK_SIZE && cnt < addsize; i++) {
        if (fat[i] == 0) {
            fat[nowp] = i;
            $("#db" + nowp).css("background-color", "red");
            nowp = i;
            cnt++;
            fat[nowp] = 255;
            $("#db" + nowp).css("background-color", "red");
        }
    }
}

// 将数据保存到本地的模拟磁盘的文件（即存入totalfiles和fat）
function writeToFile() {
    $.ajax({
        url: "index.php/index/index/writeDisk",
        data: {
            fat: String(fat),
            totalFiles: mapToJson(totalFiles)
        },
        type: 'POST',
        success: function (result) {

        },
        error: function (ex) {
            console.log(ex)
        }
    })
}

// 将结果从上次修改的文件读取出来
function readFile() {
    $.ajax({
        url: "index.php/index/index/readDisk",
        async: false,
        success: function (result) {
            var info = result.split("\n");
            var fatstr = String(info[1]).split(",");
            console.log(info.length);
            for (var i = 0; i < fatstr.length; i++) {
                fat.push(parseInt(fatstr[i]));
            }
            if (info[3] != "") totalFiles = jsonToMap(info[3]);
            // console.log(totalFiles.get("test"));
        },
        error: function (ex) {
            console.log(ex)
        }
    });
}

// 打开文件编辑器
function openFileEditor(path) {

}

// 显示文件
function show(path) {
    var name;//

    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") == -1) {
        path += ".txt";
        patharr[patharr.length - 1] = String(patharr[patharr.length - 1]) + ".txt";
    }
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹/文件
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) {
                    $('#fileDisplayBtn').trigger('click');
                    $("#fileDisplayTitle").html(path);
                    $("#fileDisplayConetent").val(value.filecontent);
                }
                else {
                    alert("打开失败，不存在该路径！");
                    break;
                }
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            alert("打开失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

function edit(path) {
    var name;//

    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") == -1) {
        path += ".txt"
        patharr[patharr.length - 1] = String(patharr[patharr.length - 1]) + ".txt";
    }
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹/文件
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) {
                    if (value.isOnlyRead) {
                        alert("打开失败，该文件为只读文件！");
                        break;
                    }
                    $('#fileEditBtn').trigger('click');
                    $("#fileEditTitle").html(path);
                    $("#fileEditContent").val(value.filecontent);
                    editing = value;
                }
                else {
                    alert("打开失败，不存在该路径！");
                    break;
                }
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            alert("打开失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

// 保存文件
function save() {
    var tmp = nowCatalog;
    nowCatalog = editing;
    var content = $("#fileEditContent").val();
    console.log(content)
    var bytesize = Math.round(content.length / 2);
    var size = bytesize > 64 ? bytesize % 64 + 1 : 1;
    editing.filecontent = content;
    reAdd(editing.filename, size - editing.size);
    nowCatalog = tmp;
}

// 创建文件
function createFiles(path) {
    var name, type, content = "";//

    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") != -1) {
        type = String(patharr[patharr.length - 1]).split(".")[1];
    }
    else {
        type = "txt";
        path += ".txt";
        patharr[patharr.length - 1] = String(patharr[patharr.length - 1]) + ".txt";
    }
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹/文件
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) createFile(name, type, content);
                else {
                    createCatolog(name);
                    nowCatalog = nowCatalog.subfile.get(name);
                }
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            if (i == patharr.length - 1) createFile(name, type, content);
            else {
                createCatolog(name);
                nowCatalog = nowCatalog.subfile.get(name);
            }
        }
    }
    nowCatalog = tmp;
}

function createFile(name, type, content) {
    var bytesize = Math.round(content.length / 2);//一个汉字占两字节
    var size = bytesize + 8 > 64 ? (bytesize % 64 + 1) : 1;
    if (fat[0] >= size) {
        var value = nowCatalog.subfile.get(name);
        if (value != null) {
            if (value.fileattr == 3) {
                var startnum = setFat(size);
                var file = new filemodal(name, type, 2, startnum, size, false, false, null, "", new Map());
                file.filecontent = content;
                file.fa = nowCatalog;
                nowCatalog.subfile.set(name, file);
                totalFiles.set(file.filename, file);

                fat[0] -= size;
                alert("文件创建成功！");
                //showFile();
                //更新文件显示树
            }
            else if (value.fileattr == 2)//同名文件
            {
                alert("创建失败，该文件已存在！");
                //
                //showFile();
            }
        }
        else {
            var startnum = setFat(size);
            var file = new filemodal(name, type, 2, startnum, size, false, false, null, "", new Map());
            file.filecontent = content;
            file.fa = nowCatalog;
            nowCatalog.subfile.set(name, file);
            totalFiles.set(file.filename, file);

            fat[0] -= size;
            alert("文件创建成功！");
            //showFile();
            //更新文件显示树
        }
    }
    else {
        alert("创建文件失败，磁盘空间不足！");
    }
}

// 复制粘贴
function copyFile(path1, path2) {
    var name;
    if (path1[0] == '/') path1 = "root" + path1;
    var patharr1 = path1.split('/');
    if (path2[0] == '/') path2 = "root" + path2;
    var patharr2 = path2.split('/');
    if (String(patharr2[patharr2.length - 1]).indexOf(".") != -1) {
        alert("复制粘贴失败，存在非法输入！");
        return;
    }
    var tmp = nowCatalog;
    var filetmp;
    var i;
    //找位置，拿要复制的文件
    for (i = 0; i < patharr1.length; i++) {
        name = patharr1[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                if (i == patharr1.length - 1) filetmp = value;
                else {
                    alert("复制失败，不存在该路径！");
                    break;
                }
            }
            else {
                if (i == patharr1.length - 1) {
                    filetmp = value;
                }
                else nowCatalog = value;
            }
        }
        else {
            alert("复制失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
    if (i < patharr1.length) return;
    //找位置，createFile
    for (i = 0; i < patharr2.length; i++) {
        name = patharr2[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                alert("粘贴失败，不存在该路径！");
                break;
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            alert("粘贴失败，不存在该路径！");
            break;
        }
    }
    if (filetmp.fileattr == 2) {
        createFile(filetmp.filename, filetmp.type, filetmp.filecontent);
        alert("复制粘贴成功！");
    }
    else {
        createCatolog(filetmp.filename);
        alert("复制粘贴失败！");
    }
    nowCatalog = tmp;
}

// 剪切粘贴
function move(path1, path2) {
    var name;
    if (path1[0] == '/') path1 = "root" + path1;
    var patharr1 = path1.split('/');
    if (path2[0] == '/') path2 = "root" + path2;
    var patharr2 = path2.split('/');
    if (String(patharr2[patharr2.length - 1]).indexOf(".") != -1) {
        alert("剪切粘贴失败，存在非法输入！");
        return;
    }
    var tmp = nowCatalog, lasttmp;
    var filetmp;
    var i;
    //找位置，拿要复制的文件
    for (i = 0; i < patharr1.length; i++) {
        name = patharr1[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                if (i == patharr1.length - 1) {
                    filetmp = value;
                    lasttmp = nowCatalog;
                }
                else {
                    alert("剪切失败，不存在该路径！");
                    break;
                }
            }
            else {
                if (i == patharr1.length - 1) {
                    filetmp = value;
                    lasttmp = nowCatalog;
                }
                else nowCatalog = value;
            }
        }
        else {
            alert("剪切失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
    if (i < patharr1.length) return;
    //找位置，createFile
    for (i = 0; i < patharr2.length; i++) {
        name = patharr2[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                alert("粘贴失败，不存在该路径！");
                break;
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            alert("粘贴失败，不存在该路径！");
            break;
        }
    }
    if (filetmp.fileattr == 2) {
        createFile(filetmp.filename, filetmp.type, filetmp.filecontent);
        nowCatalog = lasttmp;
        deleteFile(filetmp.filename);
        alert("剪切粘贴成功！");
    }
    else {
        createCatolog(filetmp.filename);
        deleteNotNullCatalog(filetmp.filename);
        alert("剪切粘贴成功！");
    }
    nowCatalog = tmp;
}

function makdir(path) {
    var name;
    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") != -1) {
        alert("创建失败，存在非法输入！");
        return;
    }
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                createCatolog(name);
                nowCatalog = nowCatalog.subfile.get(name);
            }
            else {
                if (i == patharr.length - 1) {
                    if (createCatolog(name)) alert("创建目录成功！");
                }
                else nowCatalog = value;
            }
        }
        else {
            createCatolog(name);
            if (i == patharr.length - 1) alert("创建目录成功！");
            nowCatalog = nowCatalog.subfile.get(name);
        }
    }
    nowCatalog = tmp;
}

function createCatolog(name) {
    if (fat[0] >= 1) {
        var value = nowCatalog.subfile.get(name);
        if (value != null) {
            if (value.fileattr == 2) {
                var startnum = setFat(1);
                var catalog = new filemodal(name, "", 3, startnum, 1, false, false, null, "", new Map());
                catalog.fa = nowCatalog;
                nowCatalog.subfile.set(name, catalog);
                fat[0]--;
                totalFiles.set(catalog.filename, catalog);
                console.log("创建目录：" + catalog.filename + " " + catalog.startnum);
                //showFile();
                //更新目录树
                return true;
            }
            else if (value.fileattr == 3) {
                alert("创建目录失败，该目录已存在！");
                console.log(111);
                //showFile();
                return false;
            }
        }
        else if (value == null) {
            var startnum = setFat(1);
            var catalog = new filemodal(name, "", 3, startnum, 1, false, false, null, "", new Map());
            catalog.fa = nowCatalog;
            nowCatalog.subfile.set(name, catalog);
            fat[0]--;
            totalFiles.set(catalog.filename, catalog);
            console.log("创建目录：" + catalog.filename + " " + catalog.startnum);
            //showFile();
            //更新目录树
            return true;
        }
    }
    else {
        alert("创建目录失败，磁盘空间不足！");
        return false;
    }
    return false;
}

// 显示当前目录下所有信息
function showFile() {

}

// 删除该目录下文件
function del(path) {
    var name;
    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) {
                    deleteFile(name);
                }
                else {
                    alert("删除失败，不存在该路径！");
                    break;
                }
            }
            else {
                if (i == patharr.length - 1) alert("删除失败，只能删除文件！");
                else nowCatalog = value;
            }
        }
        else {
            alert("删除失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

// 删除目录下空文件夹
function rdir(path) {
    var name;
    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) {
                    alert("删除失败，只能删除空目录！");
                    break;
                }
                else {
                    alert("删除失败，不存在该路径！");
                    break;
                }
            }
            else {
                if (i == patharr.length - 1) deleteFile(name);
                else nowCatalog = value;
            }
        }
        else {
            alert("删除失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

function deleteFile(name) {
    var value = nowCatalog.subfile.get(name);
    if (value == null) {
        alert("删除失败，不存在该文件或文件夹！");
    }
    else if (value.subfile.size != 0) {
        alert("删除失败，该文件夹内含有文件！");//?
    }
    else {
        nowCatalog.subfile.delete(name);
        delFat(value.startnum);
        if (value.fileattr == 3) {
            alert("文件夹" + value.filename + "已成功删除！");
            //刷新目录树
            // showFile();
        }
        else if (value.fileattr == 2) {
            alert("文件" + value.filename + "已成功删除！");
            //刷新目录树
            // showFile();
        }
    }
}

// 删除非空目录
function deldir(path) {
    var name;
    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) deleteNotNullCatalog(name);
                else {
                    alert("删除失败，不存在该路径！");
                    break;
                }
            }
            else {
                if (i == patharr.length - 1) deleteNotNullCatalog(name);
                else nowCatalog = value;
            }
        }
        else {
            alert("删除失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

function deleteNotNullCatalog(name) {
    var value = nowCatalog.subfile.get(name);
    if (value == null) {
        alert("删除失败，没有该文件或文件夹！");
    }
    else if (value.subfile.size != 0) {
        var keyset = Array.from(value.subfile.keys());
        for (var i = 0; i < keyset.length; i++) {
            delFat(value.subfile.get(keyset[i]).startnum);
        }
        nowCatalog.subfile.delete(name);
        delFat(value.startnum);
        alert("删除非空目录成功！");
        //刷新目录树
    }
    else {
        deleteFile(name);
        //刷新目录树
        delFat(value.startnum);
    }
}

// 打开文件或文件夹
function openFile(name) {
    if (nowCatalog.subfile.has(name)) {
        var value = nowCatalog.subfile.get(name);
        if (value.fileattr == 2) {
            alert("文件已打开，文件大小为：" + value.size);
        }
        else if (value.fileattr == 3) {
            nowCatalog = value;
            alert("文件夹已打开");
            //更新目录
            //showFile();
        }
        return value;
    }
    else {
        alert("该目录不存在" + name);
        return null;
    }
}

// 更新路径
function updatePath() {
    console.log(nowCatalog);
    var tmp = nowCatalog;
    var path = "";
    strstk = new Array();
    while (nowCatalog != root) {
        strstk.unshift(nowCatalog.filename + "/");
        nowCatalog = nowCatalog.fa;
    }
    path += "root/";
    while (strstk.length != 0) {
        var top = strstk.shift();
        path += top;
    }
    //刷新路径
    $("#commandInput").prop("placeholder", path);
    nowCatalog = tmp;
}

// 改变文件属性
function change(path, flag) {
    var name;
    flag = parseInt(flag);

    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") == -1) {
        path += ".txt";
        patharr[patharr.length - 1] = String(patharr[patharr.length - 1]) + ".txt";
    }
    var tmp = nowCatalog;
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        if (value != null)//当前目录下存在路径上的这个文件夹/文件
        {
            if (value.fileattr == 2) {
                if (i == patharr.length - 1) {
                    changeAttr(name, flag);
                }
                else {
                    alert("修改失败，不存在该路径！");
                    break;
                }
            }
            else {
                nowCatalog = value;
            }
        }
        else {
            alert("修改失败，不存在该路径！");
            break;
        }
    }
    nowCatalog = tmp;
}

function changeAttr(name, i) {
    if (!nowCatalog.subfile.has(name)) {
        alert("该文件不存在！");
    }
    else {
        var value = nowCatalog.subfile.get(name);
        var flag = "";
        if (i == 1) {
            value.isOnlyRead = true;
            flag = "只读";
        }
        else if (i == 2) {
            value.isOnlyRead = false;
            flag = "非只读";
        }
        else if (i == 3) {
            value.isHide = true;
            flag = "隐藏";
        }
        else if (i == 4) {
            value.isHide = false;
            flag = "非隐藏";
        }
        //刷新目录树
        alert("修改文件属性成功！修改后属性值为" + flag);
    }
}

// 返回上一层
function backFile() {
    if (nowCatalog.fa == null) {
        alert("当前没有上级目录！");
    }
    else {
        nowCatalog = nowCatalog.fa;
        updatePath();
        //showFile();
    }
}

// 格式化磁盘
function formatRoot() {
    totalFiles.clear();
    fat[0] = 125;
    root = new filemodal("root", "", 3, 2, 1, false, false, null, "", new Map());
    totalFiles.set("root", root);
    nowCatalog = root;
    for (var i = 3; i < MAX_DISK_SIZE; i++) {
        fat[i] = 0;
        $("#db" + i).css("background-color", "rgb(0, 195, 255)");
    }
    $("#commandInput").prop("placeholder", "root/");
    alert("格式化成功！");
}

// 跳转目录
function cd(path) {
    var name;
    if (path == "..") {
        backFile();
        return;
    }
    if (path[0] == '/') path = "root" + path;
    var patharr = path.split('/');
    if (String(patharr[patharr.length - 1]).indexOf(".") != -1) {
        alert("存在非法路径！");
        return;
    }
    for (var i = 0; i < patharr.length; i++) {
        name = patharr[i];
        if (name == "root") {
            nowCatalog = root;
            if (patharr.length == 1) updatePath();//更新路径
            continue;
        }
        var value = nowCatalog.subfile.get(name);
        console.log(value);
        if (value != null)//当前目录下存在路径上的这个文件夹
        {
            if (value.fileattr == 2) {
                alert("存在非法路径！");
                break;
            }
            else {
                nowCatalog = value;
                // console.log(nowCatalog);
                if (i == patharr.length - 1) {
                    updatePath();//更新路径
                }
            }
        }
        else {
            alert("不存在该路径！");
            break;
        }
    }
    if (i < patharr.length - 1) nowCatalog = tmp;//错误路径则恢复当前目录
}

function sendCommand() {
    var commandStr = $("#commandInput").val().split(" ");
    if (commandStr[0] == 'makdir') {
        makdir(commandStr[1]);
    }
    else if (commandStr[0] == 'deldir') {
        deldir(commandStr[1]);
    }
    else if (commandStr[0] == 'rdir') {
        rdir(commandStr[1]);
    }
    else if (commandStr[0] == 'create') {
        createFiles(commandStr[1]);
    }
    else if (commandStr[0] == 'del') {
        del(commandStr[1]);
    }
    else if (commandStr[0] == 'copy') {
        // console.log(commandStr[1] +" "+commandStr[2]);
        copyFile(commandStr[1], commandStr[2]);
    }
    else if (commandStr[0] == 'move') {
        move(commandStr[1], commandStr[2]);
    }
    else if (commandStr[0] == 'type') {
        show(commandStr[1]);
    }
    else if (commandStr[0] == 'edit') {
        edit(commandStr[1]);
    }
    else if (commandStr[0] == 'change') {
        change(commandStr[1], commandStr[2]);
    }
    else if (commandStr[0] == 'format') {
        formatRoot();
    }
    else if (commandStr[0] == 'cd') {
        cd(commandStr[1]);
    }
    else if (commandStr[0] == 'cd..') {
        cd("..");
    }
    else {
        alert("不存在该命令！");
    }
    $("#commandInput").val("");
}

// 关机
function shutdown() {
    writeToFile();
}

/**
  *map转换为obj
  */
function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
        obj[k] = v;
    }
    return obj;
}

/**
  *map转换为json
  */
function mapToJson(map) {
    return JSON.stringify(strMapToObj(map));
}

/**
 * obj转成map
 */
function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}

/**
 *json转换为map
 */
function jsonToMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
}


// 方法区--end