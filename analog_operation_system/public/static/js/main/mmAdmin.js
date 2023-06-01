// 全局变量区--begin

// 已分配区节点
class ut_Node {
    constructor(address, size, flag) {
        this.address = address;//首地址
        this.size = size;//空间大小
        this.flag = flag;//分配标志，存储占用该分配区的作业名，用-1表示未分配
    }
}

// 空闲区节点
class ft_Node {
    constructor(address, size, flag) {
        this.address = address;//首地址
        this.size = size;//空间大小
        this.flag = flag;//分配标志，用0表示空表项
    }
}

const maxn = 10, maxm = 10;//空闲区表最大为maxn，系统允许最大作业数量为maxm
const minsize = 50;
var free_table, used_table;//数组：空闲分区表，已分配区表
var mm;//模拟内存，长度为512的字符数组，表示512B内存

// 全局变量区--end

// 方法区--begin

// 初始化
function initMm() {
    $("#memory").empty();
    free_table = new Array();
    used_table = new Array();
    mm = new Array();
    for (var i = 0; i < 512; i++) mm.push('');
    for (var i = 0; i < maxm; i++) free_table.push(new ft_Node());
    for (var i = 0; i < maxn; i++) used_table.push(new ut_Node("", "", -1));
    used_table[0].address = 460, used_table[0].size = 52, used_table[0].flag = "os";//总共512B的空间，拿出460~512给os占用
    // 初始化内存显示
    for (var i = 0; i < 115; i++) {
        var ele = "<div test='init' id='mb" + i + "' role='progressbar'" +
            "style='width: 0.781%;background-color: rgb(0, 195, 255);border-right: 0.1px solid rgb(223, 222, 222);'" +
            "aria-valuenow='15' aria-valuemin='0' aria-valuemax='100'></div>";
        $("#memory").append(ele);
    }
    for (var i = 115; i < 128; i++) {
        var ele = "<div id='mb" + i + "' role='progressbar'" +
            "style='width: 0.781%;background-color: rgb(3, 148, 192);border-right: 0.1px solid rgb(223, 222, 222);'" +
            "aria-valuenow='15' aria-valuemin='0' aria-valuemax='100'></div>";
        $("#memory").append(ele);
    }
}

// 分配内存函数
function allocate(J, xk, commands)//作业名，作业大小，程序指令
{
    var i, k, a, b;
    var ad;
    k = -1;
    // 空闲分区里头找满足作业空间大小的最小的空闲分区块
    for (i = 0; i < maxn; i++) {
        console.log(free_table[i].size);
        if (free_table[i].size >= xk && free_table[i].flag == 1) {
            if (k == -1 || free_table[i].size < free_table[k].size) {
                k = i;
            }
        }
    }
    if (k == -1) return -1;
    if (free_table[k].size <= minsize) {
        free_table[k].flag = 0;
        ad = free_table[k].address;
        xk = free_table[k].size;
    }
    else {
        free_table[k].size = free_table[k].size - xk;
        ad = free_table[k].address;
        free_table[k].address = ad + xk;
    }
    i = 0;
    console.log("usedtable"+i);
    // 已分配区表里头找没有被使用过的分区块
    while (i < maxm && used_table[i].flag != -1) {
        i++;
        console.log("usedtable"+i);
    }
    if (i >= maxm) {
        if (free_table[k].flag == 0) {
            free_table[k].flag = 1;
        }
        else {
            free_table[k].size = free_table[k].size + xk;
        }
        return -2;
    }
    else {
        // alert(ad + " " + xk + " " + J);
        used_table[i].address = ad;
        used_table[i].size = xk;
        used_table[i].flag = J;
        var cnt = 0;
        console.log(commands);
        for (j = 0; commands != "" && j < commands.length; j++) {
            console.log("allocate:"+j);
            for (k = 0; k < 4; k++, cnt++) mm[ad + cnt] = commands[j][k];
        }
        a = Math.round(ad / 4); //四个字符占一个内存块
        b = Math.round(xk / 4);
        for (i = a; i < a + b; i++) {
            $("#mb" + i).css("background-color", "rgb(3, 148, 192)");
        }
        return ad;
    }
}

// 内存回收函数
function reclaim(J) {
    var i, k, j, s, t, a, b;
    var S, L;
    s = 0;
    // 在已分配区表中找J作业所占的分区块
    while (s < maxm && used_table[s].flag != J) {
        console.log("s:" + s);
        s++;
    }
    if (s >= maxm) return 0;
    used_table[s].flag = -1;
    S = used_table[s].address;
    L = used_table[s].size;
    a = S / 4;
    b = L / 4;
    for (var i = a; i < a + b; i++) {
        $("#mb" + i).css("background-color", "rgb(0, 195, 255)");
    }
    j = -1;
    k = -1;
    i = 0;
    //回收策略
    while (i < maxn && (j == -1 || k == -1)) {
        if (free_table[i].flag == 1) {
            if (free_table[i].address + free_table[i].size == S) k = i;
            if (free_table[i].address == S + L) j = i;
        }
        i++;
    }
    if (k != -1) {
        if (j != -1) {
            free_table[k].size = free_table[k].size + free_table[j].size + L;
            free_table[j].flag = 0;
        }
        else free_table[k].size = free_table[k].size + L;
    }
    else {
        if (j != -1) {
            free_table[j].address = S;
            free_table[j].size = free_table[j].size + L;
        }
        else {
            t = 0;
            while (t < maxn && free_table[t].flag == 1) {
                t++;
            }
            if (t >= maxn) {
                used_table[s].flag = J;
                return 0;
            }
            free_table[t].address = S;
            free_table[t].size = L;
            free_table[t].flag = 1;
        }
    }
    return 1;
}

// 重置内存
function mmReset() {
    initMm();
}

// 取消操作
function exit() {
    $("#mmOpConetent").val("");
    $("#utBtn").html("初始化已分配区");
    $("#ftBtn").html("初始化空闲分区");
    $("#ljBtn").html("装入作业");
    $("#rjBtn").html("回收作业");
    $("#utBtn").prop("disabled", "");
    $("#ftBtn").prop("disabled", "");
    $("#ljBtn").prop("disabled", "");
    $("#rjBtn").prop("disabled", "");
    $("#mmOpConetent").prop("placeholder", "");
}

// 初始化已分配区
function initUsedTable() {
    if ($("#utBtn").html() == "初始化已分配区") {
        $("#mmOpConetent").val("");
        $("#utBtn").html("确认");
        $("#ftBtn").prop("disabled", "disabled");
        $("#ljBtn").prop("disabled", "disabled");
        $("#rjBtn").prop("disabled", "disabled");
        $("#mmOpConetent").prop("placeholder", "起始地址 空间大小 作业名\n(输入exit退出初始化)");
    }
    else {
        var opStr = $("#mmOpConetent").val();
        var op = opStr.split(" ");
        if (op[0] == "exit") {
            $("#mmOpConetent").val("");
            $("#utBtn").html("初始化已分配区");
            $("#utBtn").prop("disabled", "");
            $("#ftBtn").prop("disabled", "");
            $("#ljBtn").prop("disabled", "");
            $("#rjBtn").prop("disabled", "");
            $("#mmOpConetent").prop("placeholder", "");
        }
        else {
            $("#mmOpConetent").val("");
            var i;
            var a = parseInt(op[0]);
            var xk = parseInt(op[1]);
            var b = a + xk;
            for (i = 0; i < maxm; i++) {
                if (!used_table[i].flag) {
                    used_table[i].address = parseInt(op[0]);
                    used_table[i].size = parseInt(op[1]);
                    used_table[i].flag = op[2];
                    ad = Math.round(used_table[i].address / 4);
                    xk = Math.round(used_table[i].size / 4);
                    for (var j = ad; j < ad + xk; j++) {
                        $("#mb" + j).css("background-color", "rgb(3, 148, 192)");
                    }
                    break;
                }
                else {
                    if (op[2] == used_table[i].flag || a >= used_table[i].address && a < used_table[i].address + used_table[i].size || b >= used_table[i].address && b < used_table[i].address + used_table[i].size) i = maxm;
                }
            }
            if (i >= maxm) $("#mmOpConetent").val("初始化失败，已分配区冲突或已满！");
        }
    }
}

// 初始化空闲分区
function initFreeTable() {
    if ($("#ftBtn").html() == "初始化空闲分区") {
        $("#mmOpConetent").val("");
        $("#ftBtn").html("确认");
        $("#utBtn").prop("disabled", "disabled");
        $("#ljBtn").prop("disabled", "disabled");
        $("#rjBtn").prop("disabled", "disabled");
        $("#mmOpConetent").prop("placeholder", "起始地址 空间大小 \n(输入exit退出初始化)");
    }
    else {
        var opStr = $("#mmOpConetent").val();
        var op = opStr.split(" ");
        if (op[0] == "exit") {
            $("#mmOpConetent").val("");
            $("#ftBtn").html("初始化空闲分区");
            $("#utBtn").prop("disabled", "");
            $("#ftBtn").prop("disabled", "");
            $("#ljBtn").prop("disabled", "");
            $("#rjBtn").prop("disabled", "");
            $("#mmOpConetent").prop("placeholder", "");
        }
        else {
            $("#mmOpConetent").val("");
            var i;
            var a = parseInt(op[0]);
            var xk = parseInt(op[1]);
            var b = a + xk;
            for (i = 0; i < maxn; i++) {
                if (!free_table[i].flag) {
                    free_table[i].address = parseInt(op[0]);
                    free_table[i].size = parseInt(op[1]);
                    free_table[i].flag = 1;//未分配
                    break;
                }
                else {
                    if (a >= free_table[i].address && a < free_table[i].address + free_table[i].size || b >= free_table[i].address && b < free_table[i].address + used_table[i].size) i = maxn;
                }
            }
            if (i >= maxn) $("#mmOpConetent").val("初始化失败，空闲分区冲突或已满！");
        }
    }
}

// 装入作业
function loadJob() {
    if ($("#ljBtn").html() == "装入作业") {
        $("#mmOpConetent").val("");
        $("#ljBtn").html("确认");
        $("#utBtn").prop("disabled", "disabled");
        $("#ftBtn").prop("disabled", "disabled");
        $("#rjBtn").prop("disabled", "disabled");
        $("#mmOpConetent").prop("placeholder", "空间大小 作业名\n");
    }
    else {
        var opStr = $("#mmOpConetent").val();
        if (opStr) {
            var op = opStr.split(" ");
            $("#mmOpConetent").val("");
            var J = op[1];
            var xk = parseInt(op[0]);
            var key = allocate(J, xk, "");
            if (key == -1) $("#mmOpConetent").val("主存分配失败");
            else if (key == -2) $("#mmOpConetent").val("已分配区表长度不足，分配失败");
            $("#ljBtn").html("装入作业");
            $("#utBtn").prop("disabled", "");
            $("#ftBtn").prop("disabled", "");
            $("#ljBtn").prop("disabled", "");
            $("#rjBtn").prop("disabled", "");
            $("#mmOpConetent").prop("placeholder", "");
        }
    }
}

// 回收作业
function reclaimJob() {
    if ($("#rjBtn").html() == "回收作业") {
        $("#mmOpConetent").val("");
        $("#rjBtn").html("确认");
        $("#utBtn").prop("disabled", "disabled");
        $("#ftBtn").prop("disabled", "disabled");
        $("#ljBtn").prop("disabled", "disabled");
        $("#mmOpConetent").prop("placeholder", "作业名\n");
    }
    else {
        var opStr = $("#mmOpConetent").val();
        if (opStr) {
            var op = opStr.split(" ");
            $("#mmOpConetent").val("");
            var J = op[0];
            var key = reclaim(J);
            if (!key) $("#mmOpConetent").val("未找到该作业，内存回收失败");
            $("#rjBtn").html("回收作业");
            $("#utBtn").prop("disabled", "");
            $("#ftBtn").prop("disabled", "");
            $("#ljBtn").prop("disabled", "");
            $("#rjBtn").prop("disabled", "");
            $("#mmOpConetent").prop("placeholder", "");
        }
    }
}

// 显示可变分区
function displayMmTable() {
    var details = "";
    details += "【已分配区】\n";
    details += "序号" + "\t" + "起始地址" + "\t" + "空间大小" + "\t" + "作业名" + "\n";
    for (var i = 0; i < maxn; i++) {
        if (used_table[i].flag != -1) {
            details += i + "\t" + used_table[i].address + "\t" + used_table[i].size + "\t" + used_table[i].flag + "\n";
        }
        else {
            details += i + "\t" + "-" + "\t" + "-" + "\t" + "空表目" + "\n";
        }
    }
    details += "【空闲分区】\n";
    details += "序号" + "\t" + "起始地址" + "\t" + "空间大小" + "\t" + "状态" + "\n";
    for (var i = 0; i < maxm; i++) {
        if (free_table[i].flag) {
            details += i + "\t" + free_table[i].address + "\t" + free_table[i].size + "\t" + "已分配" + "\n";
        }
        else {
            details += i + "\t" + "-" + "\t" + "-" + "\t" + "空表目" + "\n";
        }
    }
    $("#mmOpConetent").val(details);
}

// 方法区--end