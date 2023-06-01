// 全局变量区--begin

// PCB
class pcb {
    constructor(filename, name, eqid, eq, reason, ax, bx, cx, dx, pc, next) {
        this.filename = filename;
        this.name = name;
        this.eqid = eqid;
        this.eq = eq;
        this.reason = reason;
        this.ax = ax, this.bx = bx, this.cx = cx, this.dx = dx;
        this.pc = pc;
        this.next = next;
    }
}

// queue
class queue {
    constructor(head, tail) {
        this.head = head;
        this.tail = tail;
    }
}

// eq
class equip {
    constructor(name, flag) {
        this.name = name;
        this.flag = flag;
    }
}

var interval;
var ir;//指令寄存器
var pcbs;//进程控制块数组
var ready, wait, em_pcbs;//就绪队列，阻塞队列，空闲进程队列
var run;//指向当前正在运行的进程的指针
var eq;//设备数组
var ETIME;//设备时间
var pc, psw, dr, TIME, ALLTIME;//程序计数器，程序状态字，数据缓冲寄存器，时间片
var ax, bx, cx, dx;//寄存器
var useeq = 'U';//设备使用标志
var a0, a1, a2, a3, a4, a5;//设备使用进程

// 全局变量区--end

// 方法区--begin

// 初始化
function initProcess() {
    interval=null;
    pcbs = new Array();
    for (var i = 0; i < 9; i++) {
        pcbs.push(new pcb("", "", "", "", "", "", "", "", "", "", i + 1));
    }
    pcbs.push(new pcb("", "", "", "", "", "", "", "", "", "", -1));
    run = -1;
    ETIME = new Array();
    for (var i = 0; i < 6; i++) ETIME.push(0);
    psw = 0, TIME = 4, ALLTIME = 0;
    eq = new Array();
    eq.push(new equip('A', 0)), eq.push(new equip('A', 0)), eq.push(new equip('A', 0));
    eq.push(new equip('B', 0)), eq.push(new equip('B', 0)), eq.push(new equip('C', 0))
    ready = new queue(-1, -1), wait = new queue(-1, -1), em_pcbs = new queue(0, 9);
    a0 = -1, a1 = -1, a2 = -1, a3 = -1, a4 = -1, a5 = -1;

    // 初始化过程显示
    $("#nowProcess").val("");
    $("#nowCommand").val("");
    $("#processRes").val("");
    $("#processTime").val("");
    $("#timeSlice").val("");
    //初始化设备
    $("#deviceInfo").empty();
    for (var i = 0; i < 6; i++) {
        var ele = "<tr>" +
            "<td id='devName" + i + "'></td>" +
            "<td id='devProcess" + i + "'></td>" +
            "<td id='devTime" + i + "'></td>" +
            "</tr>";
        $("#deviceInfo").append(ele);
        if (i < 3) $("#devName" + i).html('A');
        else if (i < 5) $("#devName" + i).html('B');
        else $("#devName" + i).html('C');
    }

    //初始化就绪队列
    $("#readyQ").empty();
    for (var i = 0; i < 10; i++) {
        var ele = "<tr>" +
            "<td id='readyProcessName" + i + "'><br></td>" +
            "</tr>";
        $("#readyQ").append(ele);
    }

    //初始化阻塞队列
    $("#blockQ").empty();
    for (var i = 0; i < 10; i++) {
        var ele = "<tr>" +
            "<td id='blockProcessName" + i + "'><br></td>" +
            "<td id='blockwaitTime" + i + "'><br></td>" +
            "<td id='blockReason" + i + "'><br></td>" +
            "</tr>";
        $("#blockQ").append(ele);
    }
}

// 进程调度函数
function sheduling() {
    var i, j, s, h;
    var a = new Array();
    if (ready.tail == -1 && ready.head == -1) {
        return 0;
    }
    else {
        i = ready.head;
        if (pcbs[ready.head].next == -1) {
            ready.tail = ready.head = -1;
        }
        else {
            ready.head = pcbs[ready.head].next;
        }
        j = 0;
        h = ready.head;
        if (ready.head != -1) {
            while (pcbs[h].next != -1) {
                $("#readyProcessName" + j).html(pcbs[h].name);
                h = pcbs[h].next;
                j++;
            }
            $("#readyProcessName" + j).html(pcbs[h].name);
            j++;
        }
        for (s = j; s < 10; s++) {
            $("#readyProcessName" + s).html("<br>");
        }
        TIME = 4;
        $("#timeSlice").val(TIME);
        ax = pcbs[i].ax;
        bx = pcbs[i].bx;
        cx = pcbs[i].cx;
        dx = pcbs[i].dx;
        pc = pcbs[i].pc;
        dr = pcbs[i].dr;
        // console.log("进程调度:" + ax + " " + bx + " " + cx + " " + dx + " " + pc);
        run = i;
        $("#mb" + Math.round(pc / 4 - 1)).css("background-color", "red");
        console.log("mb" + (Math.round(pc / 4 - 1)) + "test:进程调度,变红");
        return 1;
    }
}

// cpu函数
//psw=1：end中断，psw=2：I/O中断，psw=4：时钟中断
//psw=1+2=3，1+4=5，2+4=6，1+2+4=7
function cpu() {
    $("#timeSlice").val(TIME);
    var tmp = changeTime(ALLTIME * 1000);
    var current = "";
    for (var i = 0; i < tmp.length; i++) {
        if (tmp[i] == '/') {
            current += '-';
            if (tmp[i + 2] == '/' || tmp[i + 2] == ' ') {
                current += '0';
            }
        }
        else current += tmp[i];
    }
    current = current.split(":")
    $("#processTime").val((current[1] != null ? current[1] : '00') + ":" + (current[2] != null ? current[2] : '00'));
    var sign = 0;
    for (var i = 0; i < 6; i++) {
        if (ETIME[i] == 0) {
            $("#devProcess" + i).html("");
            $("#devTime" + i).html("");
            if (eq[i].flag) {
                if (!sign) {
                    psw += 2;
                    sign = 1;
                }
            }
        }
        else {
            ETIME[i]--;
            $("#devTime" + i).html(ETIME[i]);
        }
    }
    var j = 0;
    var h = wait.head;
    if (wait.head != -1 && wait.tail != -1) {
        while (pcbs[h].next != -1) {
            if (pcbs[h].reason == useeq) {
                $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
                h = pcbs[h].next;
                j++;
            }
            else {
                $("#blockwaitTime" + j).html("-");
                h = pcbs[h].next;
                j++;
            }
        }
        if (pcbs[h].reason == useeq) {
            $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
            h = pcbs[h].next;
            j++;
        }
        else {
            $("#blockwaitTime" + j).html("-");
            h = pcbs[h].next;
            j++;
        }
    }
    var a, s;
    var equipment;
    console.log("psw:" + psw);
    if (psw == 0) {
        console.log("run:" + run);
        if (run == -1) {
            s = sheduling();
            // console.log("进程："+s);
            if (s == 0) {
                a = 0;
                ax = 'g';
                bx = 'o';
                cx = 'b';
                dx = ';';
            }
        }
        else {
            $("#mb" + Math.round(pc / 4 - 1)).css("background-color", "rgb(3, 148, 192)");
            console.log("mb" + (Math.round(pc / 4 - 1)) + "test:psw=0，cpu正常运行，变深蓝");
            ax = mm[pcbs[run].pc];
            bx = mm[pcbs[run].pc + 1];
            cx = mm[pcbs[run].pc + 2];
            dx = mm[pcbs[run].pc + 3];
            $("#mb" + Math.round(pc / 4)).css("background-color", "red");
            console.log("mb" + (Math.round(pc / 4)) + "test:psw=0，cpu正常运行，变红");
            pc = pcbs[run].pc + 4;
            pcbs[run].pc = pc;
            pcbs[run].ax = ax;
            pcbs[run].bx = bx;
            pcbs[run].cx = cx;
            pcbs[run].dx = dx;
        }
        ir = new Array();
        ir.push(ax);
        ir.push(bx);
        ir.push(cx);
        ir.push(dx);
        // console.log("当前指令：" + "" + ir[0] + ir[1] + ir[2] + ir[3]);
        console.log("当前进程：" + run);
        if (run == -1) $("#nowProcess").val("idle")//调用闲逛进程
        else $("#nowProcess").val(pcbs[run].filename);
        $("#nowCommand").val("" + ir[0] + ir[1] + ir[2] + ir[3]);
        if (ir[1] == '=') dr = parseInt(ir[2]);
        else if (ir[1] == '+') dr++;
        else if (ir[1] == '-') dr--;
        else if (ir[0] == '!') {
            a = parseInt(ir[2]);
            equipment = ir[1];
            appEquip(equipment, run, a);//run=-1，由下个时间转向中断
        }
        else if (ir[0] == 'e') psw += 1;
        else if (ir[0] == 'g') dr = 0;
        else alert("运行错误！");//非法输入
        $("#processRes").val(dr);
    }
    else {
        if (psw == 1) endInterrupt();
        else if (psw == 2) ioInterrupt();
        else if (psw == 3) {
            endInterrupt();
            ioInterrupt();
        }
        else if (psw == 4) timeInterrupt();
        else if (psw == 5) {
            endInterrupt();
            timeInterrupt();
        }
        else if (psw == 6) {
            timeInterrupt();
            ioInterrupt();
        }
        else {
            endInterrupt();
            timeInterrupt();
            ioInterrupt();
        }
    }
    TIME--;
    ALLTIME++;
    console.log(TIME);
    if (TIME < 0) {
        TIME = 4;
        psw += 4;//有end中断先处理end中断，保证进程可以销毁，内存得以释放
    }
}

// end中断
function endInterrupt() {
    console.log("处理end中断");
    var x;
    x = run;
    psw = 0;
    run = -1;
    $("#nowCommand").val("处理end中断！");
    console.log("销毁进程" + x);
    destroy(x);
}

// I/O中断
function ioInterrupt() {
    console.log("处理I/O中断");
    $("#nowCommand").val("处理I/O中断！");
    if (ETIME[0] == 0 && eq[0].flag) {
        awake('A', a0);
        eq[0].flag = 0;
    }
    if (ETIME[1] == 0 && eq[1].flag) {
        awake('A', a1);
        eq[1].flag = 0;
    }
    if (ETIME[2] == 0 && eq[2].flag) {
        awake('A', a2);
        eq[2].flag = 0;
    }
    if (ETIME[3] == 0 && eq[3].flag) {
        awake('B', a3);
        eq[3].flag = 0;
    }
    if (ETIME[4] == 0 && eq[4].flag) {
        awake('B', a4);
        eq[4].flag = 0;
    }
    if (ETIME[5] == 0 && eq[5].flag) {
        awake('C', a5);
        eq[5].flag = 0;
    }
    psw = 0;
}

// 时间中断
function timeInterrupt() {
    $("#nowCommand").val("处理时钟中断！");
    console.log("处理时钟中断");
    if (run != -1) {
        $("#mb" + Math.round(pc / 4 - 1)).css("background-color", "rgb(3, 148, 192)");
        console.log("mb" + (Math.round(pc / 4 - 1)) + "test:psw=3，处理时钟中断，变深蓝");
        ax = mm[pcbs[run].pc];
        bx = mm[pcbs[run].pc + 1];
        cx = mm[pcbs[run].pc + 2];
        dx = mm[pcbs[run].pc + 3];
        pc = pcbs[run].pc + 4;
        pcbs[run].ax = ax;
        pcbs[run].bx = bx;
        pcbs[run].cx = cx;
        pcbs[run].dx = dx;
        pcbs[run].pc = pc;
        pcbs[run].dr = dr;
        if (ready.tail == -1 && ready.head == -1) {
            ready.tail = ready.head = run;
            pcbs[run].next = -1;
        }
        else {
            pcbs[ready.tail].next = run;
            pcbs[run].next = -1;
            ready.tail = run;
        }
        run = -1;
        psw = 0;
    }
    else {
        psw = 0;
    }
}

// 创建进程函数，str是那个进程文件的全部指令组成的字符串数组
function create(filename, str) {
    var i, j, ad, h, xk;
    xk = str.length * 4;
    a = new Array();
    if (em_pcbs.tail == -1 && em_pcbs.head == -1) {
        alert("PCB不足10块，创建进程失败！");
        return 0;
    }
    else {
        if (em_pcbs.head == em_pcbs.tail) {
            i = em_pcbs.head;
            em_pcbs.head = em_pcbs.tail = -1;
        }
        else {
            i = em_pcbs.head;
            em_pcbs.head = pcbs[em_pcbs.head].next;
        }
    }
    console.log("进程空间大小：" + xk);
    ad = allocate(i, xk, str);//
    console.log(ad);
    if (ad == -1 || ad == -2) {
        if (em_pcbs.tail == -1 && em_pcbs.head == -1) {
            em_pcbs.tail = em_pcbs.head = i;
            pcbs[em_pcbs.tail].next = -1;
        }
        else {
            pcbs[em_pcbs.tail].next = i;
            pcbs[i].next = -1;
            em_pcbs.tail = i;
        }
        alert("内存空间不足！");
    }
    else {
        pcbs[i].filename = filename;
        pcbs[i].name = i;
        pcbs[i].pc = ad;
        pcbs[i].dr = 0;
        for (j = 0; j < 4; j++) {
            a.push(mm[pcbs[i].pc]);
            pcbs[i].pc++;
        }
        pcbs[i].ax = a[0];
        pcbs[i].bx = a[1];
        pcbs[i].cx = a[2];
        pcbs[i].dx = a[3];
        if (ready.tail == -1 && ready.head == -1) {
            ready.tail = ready.head = i;
            pcbs[ready.tail].next = -1;
        }
        else {
            pcbs[ready.tail].next = i;
            pcbs[i].next = -1;
            ready.tail = i;
        }
    }
    j = 0;
    h = ready.head;
    while (pcbs[h].next != -1) {
        $("#readyProcessName" + j).html(pcbs[h].name);
        h = pcbs[h].next;
        j++;
    }
    $("#readyProcessName" + j).html(pcbs[h].name);
    return 1;
}

// 销毁进程函数
function destroy(r) {
    var a, i, t;
    t = reclaim(r);
    if (t == 0) {
        alert("内存资源回收不成功！");
    }
    else {
        a = dr;
        alert(pcbs[r].filename + "作业的运行结果为：x=" + a);
        $.ajax({
            url:  "index.php/index/index/writeRes",
            data: {
                res: a,
                filename: pcbs[r].filename
            },
            type: 'POST',
            success: function (result) {
                
            },
            error: function (ex) {
                console.log(ex)
            }
        })
        if (em_pcbs.tail == -1 && em_pcbs.head == -1) {
            em_pcbs.tail = em_pcbs.head = r;
            pcbs[em_pcbs.head].next = -1;
        }
        else {
            pcbs[em_pcbs.tail].next = r;
            pcbs[r].next = -1;
            em_pcbs.tail = r;
        }
        if (ready.head == -1) {
            for (i = 0; i < 10; i++) {
                $("#readyProcessName" + j).html("<br>");
            }
        }
    }
}

// 阻塞进程函数
function block(r, equipment, sign) {
    if (sign == 0) {
        var j, h, s;
        $("#mb" + Math.round(pc / 4 - 1)).css("background-color", "rgb(3, 148, 192)");
        console.log("mb" + (Math.round(pc / 4 - 1)) + "test:设备（缺少）调度，进程阻塞，变深蓝");
        pcbs[r].dr = dr;
        pcbs[r].ax = ax;
        pcbs[r].bx = bx;
        pcbs[r].cx = cx;
        pcbs[r].dx = dx;
        pcbs[r].pc = pc;
        pcbs[r].reason = equipment;
        if (wait.tail == -1 && wait.head == -1) {
            wait.tail = wait.head = run;
            pcbs[wait.tail].next = -1;
        }
        else {
            pcbs[wait.tail].next = run;
            pcbs[run].next = -1;
            wait.tail = run;
        }
        run = -1;
        j = 0;
        h = wait.head;
        if (wait.head != -1 && wait.tail != -1) {
            while (pcbs[h].next != -1) {
                if (pcbs[h].reason == useeq) {
                    $("#blockProcessName" + j).html(pcbs[h].name);
                    $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
                    $("#blockReason" + j).html("使用设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    j++;
                }
                else {
                    $("#blockProcessName" + j).html(pcbs[h].name);
                    $("#blockwaitTime" + j).html("-");
                    $("#blockReason" + j).html("缺少设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    j++;
                }
            }
            if (pcbs[h].reason == useeq) {
                $("#blockProcessName" + j).html(pcbs[h].name);
                $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
                $("#blockReason" + j).html("使用设备" + pcbs[h].eq);
                h = pcbs[h].next;
                j++;
            }
            else {
                $("#blockProcessName" + j).html(pcbs[h].name);
                $("#blockwaitTime" + j).html("-");
                $("#blockReason" + j).html("缺少设备" + pcbs[h].eq);
                h = pcbs[h].next;
                j++;
            }
        }
        for (s = j; s < 10; s++) {
            $("#blockProcessName" + s).html("<br>");
            $("#blockwaitTime" + s).html("<br>");
            $("#blockReason" + s).html("<br>");
        }
    }
    else {
        var j, h, s;
        pcbs[r].dr = dr;
        $("#mb" + Math.round(pc / 4 - 1)).css("background-color", "rgb(3, 148, 192)");
        console.log("mb" + (Math.round(pc / 4 - 1)) + "test:设备（足够）调度，进程阻塞，变深蓝");
        pcbs[r].ax = mm[pcbs[r].pc];
        pcbs[r].bx = mm[pcbs[r].pc + 1];
        pcbs[r].cx = mm[pcbs[r].pc + 2];
        pcbs[r].dx = mm[pcbs[r].pc + 3];
        pcbs[r].pc = pcbs[r].pc + 4;
        pcbs[r].reason = useeq;
        console.log("加入阻塞队列：" + run);
        if (wait.tail == -1 && wait.head == -1) {
            wait.tail = wait.head = run;
            pcbs[wait.tail].next = -1;
        }
        else {
            pcbs[wait.tail].next = run;
            pcbs[run].next = -1;
            wait.tail = run;
        }
        run = -1;
        j = 0;
        h = wait.head;
        if (wait.head != -1 && wait.tail != -1) {
            while (pcbs[h].next != -1) {
                if (pcbs[h].reason == useeq) {
                    $("#blockProcessName" + j).html(pcbs[h].name);
                    $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
                    $("#blockReason" + j).html("使用设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    j++;
                }
                else {
                    $("#blockProcessName" + j).html(pcbs[h].name);
                    $("#blockwaitTime" + j).html("-");
                    $("#blockReason" + j).html("缺少设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    j++;
                }
            }
            if (pcbs[h].reason == useeq) {
                $("#blockProcessName" + j).html(pcbs[h].name);
                $("#blockwaitTime" + j).html(ETIME[pcbs[h].eqid]);
                $("#blockReason" + j).html("使用设备" + pcbs[h].eq);
                h = pcbs[h].next;
                j++;
            }
            else {
                $("#blockProcessName" + j).html(pcbs[h].name);
                $("#blockwaitTime" + j).html("-");
                $("#blockReason" + j).html("缺少设备" + pcbs[h].eq);
                h = pcbs[h].next;
                j++;
            }
        }
        for (s = j; s < 10; s++) {
            $("#blockProcessName" + s).html("<br>");
            $("#blockwaitTime" + j).html("<br>");
            $("#blockReason" + s).html("<br>");
        }
    }
}

// 唤醒进程函数
function awake(equipment, ai) {
    console.log("唤醒进程" + ai);
    var i0, j0, h0, k0, s0;
    var J = parseInt(ai);
    j0 = -1;
    i0 = wait.head;
    if (i0 == -1) {
        return;
    }
    //test
    var kk = wait.head;
    console.log("阻塞队列：" + kk);
    while (kk != -1) {
        kk = pcbs[kk].next;
        console.log("阻塞队列：" + kk);
    }
    while (i0 != -1 && i0 != J) {
        j0 = i0;
        i0 = pcbs[i0].next;
    }
    if (i0 != -1) {
        console.log("成功唤醒进程" + ai);
        ai = -1;
        if (j0 == -1) {
            wait.head = pcbs[wait.head].next;
            if (wait.head == -1) {
                wait.tail = -1;
            }
        }
        else {
            pcbs[j0].next = pcbs[i0].next;
        }
        if (ready.tail == -1 && ready.head == -1) {
            ready.tail = ready.head = i0;
            pcbs[ready.tail].next = -1;
        }
        else {
            pcbs[ready.tail].next = i0;
            pcbs[i0].next = -1;
            ready.tail = i0;
        }
        console.log("加入就绪队列：" + ready.tail);
        var j1, h1;
        j1 = 0;
        h1 = ready.head;
        while (pcbs[h1].next != -1) {
            console.log("就绪队列：" + h1);
            $("#readyProcessName" + j1).html(pcbs[h1].name);
            h1 = pcbs[h1].next;
            j1++;
        }
        $("#readyProcessName" + j1).html(pcbs[h1].name);
        console.log("就绪队列：" + h1);
        k0 = 0;
        h0 = wait.head;
        if (wait.head != -1) {
            while (pcbs[h0].next != -1) {
                if (pcbs[h0].reason == useeq) {
                    $("#blockProcessName" + k0).html(pcbs[h0].name);
                    $("#blockwaitTime" + k0).html(ETIME[pcbs[h0].eqid]);
                    $("#blockReason" + k0).html("使用设备" + pcbs[h0].eq);
                    h0 = pcbs[h0].next;
                    k0++;
                }
                else {
                    $("#blockProcessName" + k0).html(pcbs[h0].name);
                    $("#blockwaitTime" + k0).html(ETIME[pcbs[h0].eqid]);
                    $("#blockReason" + k0).html("缺少设备" + pcbs[h0].eq);
                    h0 = pcbs[h0].next;
                    k0++;
                }
            }
            if (pcbs[h0].reason == useeq) {
                $("#blockProcessName" + k0).html(pcbs[h0].name);
                $("#blockwaitTime" + k0).html(ETIME[pcbs[h0].eqid]);
                $("#blockReason" + k0).html("使用设备" + pcbs[h0].eq);
                h0 = pcbs[h0].next;
                k0++;
            }
            else {
                $("#blockProcessName" + k0).html(pcbs[h0].name);
                $("#blockwaitTime" + k0).html(ETIME[pcbs[h0].eqid]);
                $("#blockReason" + k0).html("缺少设备" + pcbs[h0].eq);
                h0 = pcbs[h0].next;
                k0++;
            }
        }
        for (s0 = k0; s0 < 9; s0++) {
            $("#blockProcessName" + k0).html("<br>");
            $("#blockwaitTime" + k0).html("<br>");
            $("#blockReason" + k0).html("<br>");
        }
    }
    // 用来唤醒调用设备,但是设备不够的进程
    var i, j, h, k, s;
    j = -1;
    i = wait.head;
    if (i == -1) {
        return;
    }
    while (i != -1 && pcbs[i].reason != equipment) {
        j = i;
        i = pcbs[i].next;
    }
    if (i != -1) {
        if (j == -1) {
            wait.head = pcbs[wait.head].next;
            if (wait.head == -1) {
                wait.tail = -1;
            }
        }
        else {
            pcbs[j].next = pcbs[i].next;
        }
        if (ready.tail == -1 && ready.head == -1) {
            ready.tail = ready.head = i;
            pcbs[ready.tail].next = -1;
        }
        else {
            pcbs[ready.tail].next = i;
            pcbs[i].next = -1;
            ready.tail = i;
        }
        var j2, h2;
        j2 = 0;
        h2 = ready.head;
        while (pcbs[h2].next != -1) {
            $("#readyProcessName" + j2).html(pcbs[h2].name);
            h2 = pcbs[h2].next;
            j2++;
        }
        $("#readyProcessName" + j2).html(pcbs[h2].name);
        k = 0;
        h = wait.head
        if (wait.head != -1) {
            while (pcbs[h].next != -1) {
                if (pcbs[h].reason == useeq) {
                    $("#blockProcessName" + k).html(pcbs[h].name);
                    $("#blockwaitTime" + k).html(ETIME[pcbs[h].eqid]);
                    $("#blockReason" + k).html("使用设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    k++;
                }
                else {
                    $("#blockProcessName" + k).html(pcbs[h].name);
                    $("#blockwaitTime" + k).html("-");
                    $("#blockReason" + k).html("缺少设备" + pcbs[h].eq);
                    h = pcbs[h].next;
                    k++;
                }
            }
            if (pcbs[h].reason == useeq) {
                $("#blockProcessName" + k).html(pcbs[h].name);
                $("#blockwaitTime" + k).html(ETIME[pcbs[h].eqid]);
                $("#blockReason" + k).html("使用设备" + pcbs[h].eq);
                h = pcbs[h].next;
                k++;
            }
            else {
                $("#blockProcessName" + k).html(pcbs[h].name);
                $("#blockwaitTime" + k).html("-");
                $("#blockReason" + k).html("缺少设备" + pcbs[h].eq);
                h = pcbs[h].next;
                k++;
            }
        }
        for (s = k; s < 9; s++) {
            $("#blockProcessName" + k).html("<br>");
            $("#blockwaitTime" + j).html("<br>");
            $("#blockReason" + k).html("<br>");
        }
    }
}

// 设备调度函数
function appEquip(equipment, r, t) {
    var sign = 0;
    var i;
    for (i = 0; i < 6; i++) {
        if (eq[i].name == equipment && eq[i].flag == 0) {
            eq[i].flag = 1;
            pcbs[r].eq = equipment;
            pcbs[r].eqid = i;
            //设置时间片开始执行
            ETIME[i] = t;
            $("#devProcess" + i).html(pcbs[r].name);
            $("#devTime" + i).html(ETIME[i]);
            if (i == 0) a0 = pcbs[r].name;
            else if (i == 1) a1 = pcbs[r].name;
            else if (i == 2) a2 = pcbs[r].name;
            else if (i == 3) a3 = pcbs[r].name;
            else if (i == 4) a4 = pcbs[r].name;
            else a5 = pcbs[r].name;
            sign = 1;
            block(r, equipment, sign);
            return;
        }
    }
    block(r, equipment, sign);
}

function turn() {
    if ($("#onoffBtn").html() == "启动") {
        interval=setInterval("cpu()", 1000);
        $("#onoffBtn").attr("class", "btn btn-danger");
        $("#onoffBtn").html("关闭");
    }
    else {
        clearInterval(interval);
        initProcess();
        initMm();
        $("#onoffBtn").attr("class", "btn btn-success");
        $("#onoffBtn").html("启动");
    }
}

function loadProcess(filename) {
    $.ajax({
        url: 'static/data/' + filename + "_in.txt",
        async: false,
        success: function (result) {
            $("#processOpContent").val(result);
            var commands = result.split("\r\n");
            // console.log(commands);
            if ($("#onoffBtn").html() == "关闭") {
                create(filename + "_in", commands);
            }
        },
        error: function (ex) {
            console.log(ex)
        }
    });
    $.ajax({
        url: 'static/data/' + filename + "_out.txt",
        async: false,
        success: function (result) {
            $("#processResContent").val(result);
        },
        error: function (ex) {
            console.log(ex)
        }
    });
}

// 方法区--end