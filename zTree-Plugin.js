/* 
//按照jquery的方式来获取这个实例，从而执行方法
// 原形重定向
        let $zTree = (function () {
            function $zTree(element, data) {
                return new $zTree.fn.init(element, data);
            }
            $zTree.fn = $zTree.prototype = {
                constructor: $zTree,
                //...
            };

            let init = $zTree.fn.init = function init(element, data) {

            };
            init.prototype = $zTree.fn;

            return $zTree;
        })();
 */


let $zTree = (function () {
    //闭包封装起来【高级单例】
    class zTree {
        //this.xxx设置实例的私有属性
        constructor(element, data) {
            //在原型上的方法都要通过实例来调用，所以将参数挂载到实例上，就可以在其他方法中调用该方法时，通过实例来获取到这些信息了（一般我们把需要在其它方法中使用的信息都挂在到实例上：这样可以实现信息的公用，也是面向对象插件开发的优势=>【前提】需要保证各个方法中的this是实例）
            this.element = element;
            this.data = data;
            this.level = 0;
            this.init();
        };
        //用的方法放在原型上
        //zTree.prototype
        bindHTML(result) {
            //先绑定数据
            let str = ``;
            this.level++;//每次进入都相当于创建新的内层层级
            result.forEach((item, index) => {
                let {
                    name,
                    open,
                    children
                } = item;
                str += `<li>
							<a href="#" class="title">${name}</a>
							${children && children.length > 0 ? `
								<em class="icon ${open ? 'open' : ''}"></em>
								<ul class="level level${this.level}" 
									style="display:${open ? 'block' : 'none'}">
									${this.bindHTML(children)}
								</ul>
							`: ''}
						</li>`;
            });
            this.level--;//递归完了再回到上一个层级，所以--
            return str;
        }
        handle() {
            //再处理事件委托
            this.element.addEventListener('click', (ev) => {//整体委托给level，click事件存在事件传播机制的
                //参数改为箭头函数，this也是实例了【因为箭头函数中没有自己的this，用的是上下文中的this】
                // 获取【事件源：点击的是谁，事件源就是谁】
                //只要电池level中任何一个后代元素，都会触发level的click，都会把这个方法执行
                //然后通过判断事件源的不同，执行不同的操作
                let target = ev.target,
                    targetTag = target.tagName;//原生js对象转换为jquery对象
                // 点击的是EM，事件源为em
                //无论点的是哪一个em，总会是要获取em下的ul，从而控制ul的显示和隐藏
                //
                //合并事件源
                if (targetTag === 'A') {
                    target = target.nextElementSibling;
                    targetTag = target ? 'EM' : '';
                }

                if (targetTag === 'EM') {
                    let ulBox = target.nextElementSibling;//获得em的下一个（弟弟元素）
                    if (!ulBox) return;
                    let sty = ulBox.style.display;
                    if (sty === "block") {
                        // 当前是展示的:我们让其隐藏
                        ulBox.style.display = "none";
                        target.className = "icon";
                        return;
                    }
                    // 当前是隐藏的:我们让其展示
                    ulBox.style.display = "block";
                    target.className = "icon open";
                    return;
                }
            });
        }
        init() {
            //做的事情少完全可以直接挂载到实例上，不用再套个init，再把init挂载到实例上，但是如果要做的事情很多，或者实例上挂载的信息太多，就会很乱，所以【就在init中单独管控逻辑操作】，而在实例上进行信息挂载，分开来就清楚很多



            //控制先做什么，在做什么【相当于一个初始的入口】
            //因为一个插件中可能会有很多方法，若想实现某个功能，就要第一步做那个，第二部做那个，如何控制方法的执行顺序，一般就在init里，控制先后执行的逻辑顺序
            //1.先做事件绑定
            this.element.innerHTML = this.bindHTML(this.data);//执行bindHTML方法，创造结构绑定数据后，全部放到element容器当中
            //2.再做事件委托，实现效果
            this.handle();
        }
    }

    //两种方式暴露给全局
    // window.$zTree

    //直接返回这样一个方法
    return function $zTree(element, data) {
        //init params【参数验证】
        //在普通方法执行时都处理好了，在new执行时，参数一定都是合法的


        //【判断element容器】
        if (element == null || typeof element !== 'object' || element.nodeType !== 1) {
            //1. 如果element等于null，报错
            //2. 如果不等于null，但又不是一个对象，报错【不加此步也可以，直接判断是否为元素对象】
            //3.如果是一个对象，但不是一个元素对象，报错
            throw new TypeError('element must to be a html element!');
        }
        //【判断传入的数据】
        if (data == null || !Array.isArray(data) || data.length <= 0) {
            //1.如果data等于null，报错
            //2.如果data不为null，但不是一个数组，报错
            //3.如果是一个数组，但数组长度为0（空数组），报错
            throw new TypeError('data must to be a array and not empty!');
        }

        //【如果参数都合法了，就构造执行zTree，并返回该实例】
        return new zTree(element, data);//在外面执行$zTree时，实际上返回的不是$zTree的实例，而是在这内部的zTree的实例
    };
})()