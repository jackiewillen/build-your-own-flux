/**
 * author: 殷荣桧
 * time: 2018-8-26 15:35
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
                case 'remove':// 删除一个离职员工的档案
                    _itemList = _itemList.filter(item => item.id != payload.item.id);
                    break;
                default: // 其他操作
                    break;
            }
            window.reRender(); // 每次员工操作完了就要更新办事大厅大屏幕上的数据，让大家知道实时结果
        });

        return {
            // 获取员工所有的档案信息
            getList: function() {
                return _itemList;
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
    // 代码加载完毕后，点亮办事大厅的所有员工档案信息展示大屏幕
    reRender();
}, 0);