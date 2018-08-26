/**
 * author: 殷荣桧
 * time: 2018-8-26 15:35
 * title: Flux设计模式的简单实现
 */

// Flux对象中存放Flux架构
let Flux = {
    Action: function Action() {
        return {
            add: function(item) {
                window.dispatcher.dispatch({ type: 'add', item: item });
            },
            remove: function(item) {
                window.dispatcher.dispatch({ type: 'remove', item: item });
            }
        }
    },

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

    Store: function Store() {
        let _itemList = window.initList;
        window.dispatcher.register(function(payload) {
            switch (payload.type) {
                case 'add':
                    _itemList.push(payload.item);
                    break;
                case 'remove':
                    _itemList = _itemList.filter(item => item.id != payload.item.id);
                    break;
                default:
                    break;
            }
            window.reRender();
        });
        return {
            // 获取store中存放的itemList
            getList: function() {
                return _itemList;
            }
        }
    }
}

// ==========以下为页面代码==============

// 初始化加载的备忘录列表
window.initList = [
    { id: 0, name: '洗衣' },
    { id: 1, name: '遛狗' },
    { id: 2, name: '做饭' },
];
window.reRender = function reRender() {
    appEle = document.querySelector('#app');
    ulEle = document.querySelector('#list');
    let allEleArr = [];
    this.store.getList().forEach((item) => {
        allEleArr.push(`<li>${item.name}  <span id="${item.id}" class="remove" onclick="remove(${item.id})">删除</span></li>`);
    });
    let allStr = allEleArr.join('');
    ulEle.innerHTML = allStr;
}
window.remove = function remove(id) {
    let delItem = '';
    this.store.getList().forEach(item => {
        if (item.id === id) {
            delItem = item;
        }
    });
    this.action.remove(delItem);
}
window.add = function add(event) {
    let itemValue = document.querySelector('#thingInput').value;
    let currentList = this.store.getList();
    let lastId = currentList.length ? currentList[currentList.length - 1].id : 0;
    let item = {
            id: lastId + 1,
            name: itemValue
        }
        // 以上拼凑完毕item后触发action中的add方法
    this.action.add(item);
}
window.dispatcher = new Flux.Dispatcher();
window.store = new Flux.Store();
window.action = new Flux.Action();

setTimeout(() => {
    // 待页面加载完毕后渲染页面
    reRender();
}, 0);