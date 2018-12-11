<h2>Vuex和Redux都使用的Flux设计模式精简版实现</h2>
<h4>作者：殷荣桧@腾讯</h4>

<h3>目录：</h3>
<h3>1. 为什么需要Flux设计模式</h3>
<h3>2. Flux设计模式是怎么实现的</h3>
<h5>本文对应<a href="https://github.com/jackiewillen/blog/issues/16">Github地址</a>，如果觉得文章还可以，希望您送上宝贵的Star</h5>

　　先来看一下最终结果，免得你觉得太复杂，跑了。怎么样就一个添加，一个删除，是不是很简单，那就继续往下看吧。
<center><img src="https://user-gold-cdn.xitu.io/2018/12/11/1679afd7623a6bd4?w=357&h=206&f=gif&s=36891"/></center>

　　老外搞个新东西就喜欢给其取个Cool的名字，什么Flux,Redux,Meteor。本来英语就不是太好的中国人一看就跑路了，What?老子Javascirpt还没学好，你又来这这些。名字都看不懂，还学啥。纷纷感慨：老子学不动了，不要再更新了。其实吧，老外就是把公司的个人档案管理流程应用到了前端数据管理流程中了，然后取了吓跑了很多人的名字Flux而已，不信我给你实现一个[简单版的Flux架构](https://github.com/jackiewillen/fluxExample)（代码中对照个人档案管理流程讲解Flux流程），结合下面这张图你再看看是不是。


![](https://user-gold-cdn.xitu.io/2018/12/8/1678e27501c35054?w=2894&h=1494&f=png&s=277426)

1.为什么需要Flux设计模式

(1)刀耕火种的年代

　　最初因为前端就是几个页面和几个js文件，前端对于网站中的全局变量（全局变量就是在哪个页面都可以被访问和修改的变量,如网站的标题）基本上用

	 window.title = 'XXX'
	 
　　就可以了。刚上手项目，你全局搜一下window这个关键字也差不多对项目中的全局变量都有个印象了。然后有一天，线上网站中标题出错了（比如：‘爱牛网’ 变成了 ‘屠牛网’），老板一看吓的不轻，让你赶紧看看。你就全局搜一下window.title看一下，原来在D页面title被一个新来的员工改错了(新员工在测试环境下改代码改着玩的，忘删了)。然后你把它修改过来就可以了。

（2）MVC时代

　　前端发展到中期，应用的场景开始增多，需要一个框架来降低代码的耦合了，Backbone类似的MVC框架出现。通过各个Model来存放数据，包括全局的数据。这个时候全局变量可以通过View（页面）来修改Model中的数据，再反馈到其他的View中去，做到数据同步。这个时期基本上是做一个博客网站，管理系统的体量。

（3) 前端大爆炸时代

　　前端发展到现在，所应用的场景就越来越多了。有个同学小扎（马克·扎克伯格）在大学里想做个叫Facebook的社交应用，就让前端的朋友帮忙做一做页面。前端同学很快用MVC模式搞定了Facebook前端架构。但是令小扎同学没想到的是，这个叫Facebook的应用火了，功能不停的迭代，增加。前端到同学表示每天加班加点累到只能看着自己手中小扎刚发的1000万美刀的股票骂骂娘。这个时候的前端体量急剧膨胀，上百个View（页面）出现，对应上百个Model（存放前端数据的专用层），经常会出现多个页面对同一个Model数据进行操作，比如有个全局数据刚添加到Model，又来一个页面通知这个全局变量要删除，这个时候其他页面还不知道这个全局变量已经删除了，表示要修改这个数据，再来个页面又要获取这个数据，这个时候就导致前端的数据管理异常的混乱，任何一个页面都有权操作全局变量。你能想象一个公司的员工档案信息中心（类似全局变量）如何任何员工（页面）都可以过来随意的增删改查，你信不信没过几天，你再去档案库查看你的档案，你的学历会变成幼儿园。这个档案信息中心的数据将会一塌糊涂。这就是Facebook有一断时间总是会出现你有未读消息提示，但是你点进去查看却没有任何消息的问题。小扎同学因为这个问题被无数的美国网友骂 What the hell.小扎那叫个火大啊，把前端的主管叫过来一顿痛骂（把美国网友送给他的What the hell都送给了这位主管），让其一个星期内解决此问题（以上骂娘故事纯属虚构，）。这个时候Flux就出现了。这就是为什么需要Flux设计模式。


2.Flux设计模式是怎么实现的

　　我们直接上代码，在代码中做了非常详细的比喻，再对照文章开始的图，相信你一定能看懂。

(1) Action实现部分

    /**
     *（1）Action人事办事大厅（分设：增加档案办事窗口，删除档案办事窗口...）生成器
     *公司员工的档案信息属于重要信息，非HR工作人员不
     *能够直接找档案信息中心的人私自修改自己或他人档案，
     *需要到人事大厅窗口办理,由人事大厅交给人事主管（dispatcher）
     *再由HR人事办事大厅
     */
    Action: function Action() {
        return {
            create: function(initData) { // 新建员工办事窗口
                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
                dispatcher.dispatch({ type: 'create', item: initData });
            },
            add: function(item) { // 添加员工办事窗口
                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
                dispatcher.dispatch({ type: 'add', item });
            },
            remove: function(item) { // 删除员工办事窗口
                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
                dispatcher.dispatch({ type: 'remove', item });
            }
        }
    },

（2）Dispatcher 实现部分

	/**
     * （2）主管生成器
     * 生成各个部门的主管（各种主管，包括hr主管，人事档案主管等)
     */
    Dispatcher: function Dispatcher() {
        let _cid = 0; // callbackId
        let _callbacks = [];
        return {
            register: function(callback) {
                _callbacks[_cid] = callback;
                return _cid++;
            },
            unregister: function(_cid) {
                // 从回调数组中删除当前的一项
                _callbacks.splice(_cid, _cid);
            },
            dispatch: function(payload) {
                // 通知所有注册的用户执行回调方法
                _callbacks.forEach(callback => callback(payload));
            }
        }
    },		

(3)Store实现部分


    /**
     * （3）档案信息中心生成器
     * 所有员工的信息都存放在档案信息中心
     */
    Store: function Store() {
        let _itemList = []; // 员工档案信息存放柜
        let _emit = new Flux.Dispatcher(); // 生成档案信息中心主管（姓名_emit)
        // 一个小员工名为staff_1到人事主管dispatcher这注册，这样dispatcher主管就有一个员工啦
        dispatcher.register(function staff_1(payload) {
            // 以下是这个小员工的简历，表明他可以干增加，删除，更新等hr员工该干的活
            switch (payload.type) {
                case 'create': // 创建初始员工（创始人那一批，类似于阿里巴巴的18罗汉之类的）
                    _itemList = [...payload.item];
                    break;
                case 'add': // 添加一个新的员工档案
                    _itemList.push(payload.item);
                    break;
                case 'remove': // 删除一个离职员工的档案
                    _itemList = _itemList.filter(item => item.id != payload.item.id);
                    break;
                default: // 其他操作
                    break;
            }
            _emit.dispatch(); // 档案信息中心主管发出通知，让手下注册的员工们开始干活了
        });
        return {
            // 获取员工所有的档案信息
            getList: function() {
                return _itemList;
            },
            // 有新的员工到档案信息中心主管（_emit)这注册报到，这样就有人给主管干活啦
            addEmiter: function(callback) {
                return _emit.register(callback);
            },
            // 干的不爽，从档案信息中心主管这离职了
            removeEmiter: function(callbackId) {
                _emit.unregister(callbackId);
            }
        }
    }

（4）最后为页面中的实现部分


    // 初始化加载的备忘录列表
    var initStaffs = [
        { id: 0, name: '马云' },
        { id: 1, name: '王健林' },
        { id: 2, name: '褚时健' },
    ];
    // 重新把档案信息中心的人事档案渲染到办事大厅大屏幕上
    var reRender = function reRender() {
        appEle = document.querySelector('#app');
        ulEle = document.querySelector('#list');
        let allEleArr = [];
        this.store.getList().forEach((item) => {
            allEleArr.push(`<li>${item.name}  <span id="${item.id}" class="remove" onclick="remove(${item.id})">删除</span></li>`);
        });
        let allStr = allEleArr.join('');
        ulEle.innerHTML = allStr;
    }
    var remove = function remove(id) {
        // 整理全离职员工的信息
        let delItem = '';
        this.store.getList().forEach(item => {
            if (item.id === id) {
                delItem = item;
            }
        });
        // 到人事大厅“删除”办事窗口办理
        this.action.remove(delItem);
    }
    var add = function add(event) {
        // 自己整理新员工的档案信息
        let itemValue = document.querySelector('#thingInput').value;
        let currentList = this.store.getList();
        let lastId = currentList.length ? currentList[currentList.length - 1].id : 0;
        let item = {
                id: lastId + 1,
                name: itemValue
            }
            // 整理好了到人事大厅“添加”办事窗口办理新增员工业务
                this.action.add(item);
            }
            var dispatcher = new Flux.Dispatcher(); // // 生成一个HR人事主管(主管姓名：dipatcher)（主管员工的增删改查）
            var store = new Flux.Store(); // 生成一个名为store的档案信息中心
            var action = new Flux.Action(); // 生成一个名为action的人事办事大厅
            setTimeout(() => {
                // 将初始员工的信息到人事大厅新建办事窗口办理，以便存放到档案信息中心的档案柜中
                action.create(initStaffs);
                //  档案信息中心主管这来了一个新员工注册了，他的本领都在 reRender 函数中说明了
                store.addEmiter(reRender);
                // 代码加载完毕后，点亮办事大厅的所有员工档案信息展示大屏幕
                reRender();
            }, 0);

把所有的代码结合起来也就是下面这样：
	
	=====================js.js文件=====================
	/**
	 * author: JackieYin
	 * time: 2018-12-8 16:35
	 * title: Flux设计模式的简单实现
	 * goal: flux设计的初衷是让你取数据好取，但要改变
	 * 数据需要经过flux的一系列操作才行，这样可
	 * 以保障数据不会被随意篡改
	 */
	
	// Flux对象中存放Flux架构
	let Flux = {
	    /**
	     *（1）Action人事办事（分设：增加档案办事窗口，删除档案办事窗口...）大厅生成器
	     *公司员工的档案信息属于重要信息，非HR工作人员不
	     *能够直接找档案信息中心的人私自修改自己或他人档案，
	     *需要到人事大厅窗口办理,由人事大厅交给人事主管（dispatcher）
	     *再由HR人事办事大厅
	     */
	    Action: function Action() {
	        return {
	            create: function(initData) { // 新建员工办事窗口
	                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
	                dispatcher.dispatch({ type: 'create', item: initData });
	            },
	            add: function(item) { // 添加员工办事窗口
	                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
	                dispatcher.dispatch({ type: 'add', item });
	            },
	            remove: function(item) { // 删除员工办事窗口
	                // 办事大厅登记此项事物后由人事主管(dispatcher)通知手下注册过的员工去干（staff_1好像就会干）
	                dispatcher.dispatch({ type: 'remove', item });
	            }
	        }
	    },
	    /**
	     * （2）主管生成器
	     * 生成各个部门的主管（各种主管，包括hr主管，人事档案主管等)
	     */
	    Dispatcher: function Dispatcher() {
	        let _cid = 0; // callbackId
	        let _callbacks = [];
	        return {
	            register: function(callback) {
	                _callbacks[_cid] = callback;
	                return _cid++;
	            },
	            unregister: function(_cid) {
	                // 从回调数组中删除当前的一项
	                _callbacks.splice(_cid, _cid);
	            },
	            dispatch: function(payload) {
	                // 通知所有注册的用户执行回调方法
	                _callbacks.forEach(callback => callback(payload));
	            }
	        }
	    },
	    /**
	     * （3）档案信息中心生成器
	     * 所有员工的信息都存放在档案信息中心
	     */
	    Store: function Store() {
	        let _itemList = []; // 员工档案信息存放柜
	        let _emit = new Flux.Dispatcher(); // 生成档案信息中心主管（姓名_emit)
	        // 一个小员工名为staff_1到人事主管dispatcher这注册，这样dispatcher主管就有一个员工啦
	        dispatcher.register(function staff_1(payload) {
	            // 以下是这个小员工的简历，表明他可以干增加，删除，更新等hr员工该干的活
	            switch (payload.type) {
	                case 'create': // 创建初始员工（创始人那一批，类似于阿里巴巴的18罗汉之类的）
	                    _itemList = [...payload.item];
	                    break;
	                case 'add': // 添加一个新的员工档案
	                    _itemList.push(payload.item);
	                    break;
	                case 'remove': // 删除一个离职员工的档案
	                    _itemList = _itemList.filter(item => item.id != payload.item.id);
	                    break;
	                default: // 其他操作
	                    break;
	            }
	            _emit.dispatch(); // 档案信息中心主管发出通知，让手下注册的员工们开始干活了
	        });
	
	        return {
	            // 获取员工所有的档案信息
	            getList: function() {
	                return _itemList;
	            },
	            // 有新的员工到档案信息中心主管（_emit)这注册报到，这样就有人给主管干活啦
	            addEmiter: function(callback) {
	                return _emit.register(callback);
	            },
	            // 干的不爽，从档案信息中心主管这离职了
	            removeEmiter: function(callbackId) {
	                _emit.unregister(callbackId);
	            }
	        }
	    }
	}
	
	// ==========以下为办事大厅显示屏显示情况控制==============
	
	// 初始化加载的备忘录列表
	var initStaffs = [
	    { id: 0, name: '马云' },
	    { id: 1, name: '王健林' },
	    { id: 2, name: '褚时健' },
	];
	
	// 重新把档案信息中心的人事档案渲染到办事大厅大屏幕上
	var reRender = function reRender() {
	    appEle = document.querySelector('#app');
	    ulEle = document.querySelector('#list');
	    let allEleArr = [];
	    this.store.getList().forEach((item) => {
	        allEleArr.push(`<li>${item.name}  <span id="${item.id}" class="remove" onclick="remove(${item.id})">删除</span></li>`);
	    });
	    let allStr = allEleArr.join('');
	    ulEle.innerHTML = allStr;
	}
	
	var remove = function remove(id) {
	    // 整理全离职员工的信息
	    let delItem = '';
	    this.store.getList().forEach(item => {
	        if (item.id === id) {
	            delItem = item;
	        }
	    });
	    // 到人事大厅“删除”办事窗口办理
	    this.action.remove(delItem);
	}
	var add = function add(event) {
	    // 自己整理新员工的档案信息
	    let itemValue = document.querySelector('#thingInput').value;
	    let currentList = this.store.getList();
	    let lastId = currentList.length ? currentList[currentList.length - 1].id : 0;
	    let item = {
	            id: lastId + 1,
	            name: itemValue
	        }
	        // 整理好了到人事大厅“添加”办事窗口办理新增员工业务
	    this.action.add(item);
	}
	var dispatcher = new Flux.Dispatcher(); // // 生成一个HR人事主管(主管姓名：dipatcher)（主管员工的增删改查）
	var store = new Flux.Store(); // 生成一个名为store的档案信息中心
	var action = new Flux.Action(); // 生成一个名为action的人事办事大厅
	
	setTimeout(() => {
	    // 将初始员工的信息到人事大厅新建办事窗口办理，以便存放到档案信息中心的档案柜中
	    action.create(initStaffs);
	    //  档案信息中心主管这来了一个新员工注册了，他的本领都在 reRender 函数中说明了
	    store.addEmiter(reRender);
	    // 代码加载完毕后，点亮办事大厅的所有员工档案信息展示大屏幕
	    reRender();
	}, 0);
	
	==================index.html 文件==================
	<!DOCTYPE html>
	<html lang="en">
	<head>
	    <meta charset="UTF-8">
	    <meta name="viewport" content="width=device-width, initial-scale=1.0">
	    <meta http-equiv="X-UA-Compatible" content="ie=edge">
	    <link rel="stylesheet" href="./css.css">
	    <title>Document</title>
	</head>
	<body>
	    <header id="title">
	        <h1>Flux样例演示系统</h1>
	    </header>
	    <div id="app">
	        <input type="text" id="thingInput" placeholder="请输入新的员工名称"><span onclick="add()" class="add">添加</span>
	        <ul id="list"></ul>
	    </div>
	</body>
	<script src="./js.js"></script>
	
	</html>

　　最后我还是墙裂建议你把我的<a href="https://github.com/jackiewillen/fluxExample">代码</a>clone下来,直接打开其中的index.html就能运行。然后再仔细看看，如果发现有写的不对的地方反手就是一个Issue提给我。最后还是那就不要脸的话，如果你觉的讲的还可以，Please送上你宝贵的Star。
　　
　　 部门正在招新，为腾讯企业产品部，隶属CSGI事业群。福利不少，薪水很高，就等你来。有兴趣请猛戳下方两个链接。
　　 
　　 
    https://www.lagou.com/jobs/5210396.html
    https://www.zhipin.com/job_detail/2876d4cc2cdebe2c1XNz2NW0ElU~.html
    

>参考文章：
>
><a href="https://github.com/flypie2/flux_learn">Flux架构小白入门笔记</a>
>
><a href="https://ryanfunduk.com/articles/flux-from-scratch/">Flux from Scratch</a>
>
><a href="http://krasimirtsonev.com/blog/article/dissection-of-flux-architecture-or-how-to-write-your-own-react">
>Dissection of Flux architecture or how to write your own</a>
>
><a href="https://code-cartoons.com/a-cartoon-guide-to-flux-6157355ab207"> A cartoon guide to Flux
</a>
