<template>
    <div class="root" @mousemove="allowDrop">
        <div class="nav">
            <button @click="addCard('gauge')">增加仪表盘</button>
            <button @click="addCard('line')">增加折线图</button>
            <button @click="save">保存</button>
        </div>
        <div ref="containerRef" class="content bg-cube">
            <div
                v-for="item in cardList"
                :key="item.value"
                :id="`col${item.value}`"
                @mousedown="drag($event, `col${item.value}`, item.type)"
                :class="item.type"
            >
                <div class="contine"></div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getTopAndLeft, guid, resetFun, setFun, judgeCube } from './utils';
import _ from 'lodash';
const containerRef = ref(); // 拖拽区域DOM
const pointerStartX = ref(0); // 开始拖拽时的X坐标，用于计算left
const pointerStartY = ref(0); // 开始拖拽时的Y坐标，用于计算top
const dragDom = ref(null); // 被拖拽卡片的DOM
const cardList: any = ref([]); // 卡片列表
const unitLength = ref(0); // 拖拽区域单位长度，用于吸附等操作处理
const cardType = ref(''); // 被拖拽卡片的类型
const lineHeight = ref(''); // 折线图图表高度
const lineWidth = ref(''); // 折线图图表宽度
const gaugeWidth = ref(''); // 仪表图图表宽度
const gaugeHeight = ref(''); // 仪表图图表高度
const beforePointer = ref(0); // 拖拽进入时的鼠标X坐标，用于计算被拖拽元素进入目标的方向（left or right）
const draggleDirection = ref(''); // 拖拽方向（left or right） 主要用于判断目标的数量和位置
let logCube: any = []; // 用来记录元素被放置到的位置的合集，用来进行拖拽判定等
onMounted(() => {
    resize();
    init();
    window.addEventListener('mouseup', drop);
    window.addEventListener('resize', resize);
});
const resize = () => {
    unitLength.value = Math.floor(containerRef.value.clientWidth / 8);
    const size = `${unitLength.value}px`;
    gaugeWidth.value = `${unitLength.value}px`;
    gaugeHeight.value = `${unitLength.value}px`;
    lineWidth.value = `${unitLength.value * 4}px`;
    lineHeight.value = `${unitLength.value * 2}px`;
    containerRef.value.style.backgroundSize = `${size} ${size}, ${size} ${size}, ${size} ${size}, ${size} ${size}`;
};
/** 初始化 */
const init = () => {
    const arr = JSON.parse(localStorage.getItem('logCube') || '[]');
    arr.forEach((val: any, y: number) => {
        val &&
            val.forEach((item: any, x: number) => {
                if (item && item.value === 1) {
                    const data = cardList.value.find((val: any) => {
                        return val.value === item.id;
                    });
                    if (!data) {
                        cardList.value.push({
                            value: item.id,
                            type: item.type,
                        });
                    }
                    setTimeout(() => {
                        const col: any = document.querySelector(
                            `#col${item.id}`
                        );
                        if (!logCube[y]) {
                            logCube[y] = [];
                        }
                        logCube[y][x] = {
                            label: col,
                            type: item.type,
                            value: 1,
                            id: item.id,
                        };
                        if (!data) {
                            col.style.display = 'block';
                            col.style.top = `${y * unitLength.value}px`;
                            col.style.left = `${x * unitLength.value}px`;
                        }
                    });
                }
            });
    });
};
/** 格式化 */
const uninit = () => {
    dragDom.value = null;
    beforePointer.value = 0;
    draggleDirection.value = '';
};
/** 开始拖拽 */
const drag = (e: any, id: any, type: string) => {
    e.preventDefault();
    const col: any = document.querySelector(`#${id}`);
    const { topX, leftY, topXPlus, leftYPlus } = getTopAndLeft(
        col.style.top,
        col.style.left,
        col.clientHeight,
        col.clientWidth,
        unitLength.value
    );
    if (logCube[topX] && logCube[topX][leftY]) {
        logCube = resetFun(
            logCube,
            col,
            topX,
            leftY,
            topXPlus,
            leftYPlus,
            unitLength.value
        );
    }
    dragDom.value = col;
    cardType.value = type;
    pointerStartX.value = e.x - Number(col.style.left.replace('px', ''));
    pointerStartY.value = e.y - Number(col.style.top.replace('px', ''));
};
/** 鼠标放下，拖拽结束 */
const drop = () => {
    if (dragDom.value) {
        const col: any = dragDom.value;
        const top = Number(col.style.top.replace('px', ''));
        const left = Number(col.style.left.replace('px', ''));
        if (top % unitLength.value > Math.floor(unitLength.value / 2)) {
            col.style.top = `${
                (Math.floor(top / unitLength.value) + 1) * unitLength.value
            }px`;
        } else {
            col.style.top = `${
                Math.floor(top / unitLength.value) * unitLength.value
            }px`;
        }
        if (left % unitLength.value > Math.floor(unitLength.value / 2)) {
            col.style.left = `${
                (Math.floor(left / unitLength.value) + 1) * unitLength.value
            }px`;
        } else {
            col.style.left = `${
                Math.floor(left / unitLength.value) * unitLength.value
            }px`;
        }
        const { topX, leftY, topXPlus, leftYPlus } = getTopAndLeft(
            col.style.top,
            col.style.left,
            col.clientHeight,
            col.clientWidth,
            unitLength.value
        );
        logCube = setFun(
            logCube,
            col,
            topX,
            leftY,
            topXPlus,
            leftYPlus,
            cardType.value,
            unitLength.value
        );
    }
    console.log(logCube);
    uninit();
};
/** 拖拽过程中移动判断 */
const allowDrop = (e: any) => {
    if (dragDom.value) {
        if (beforePointer.value !== 0) {
            draggleDirection.value =
                e.x >= beforePointer.value ? 'right' : 'left';
        } else {
            beforePointer.value = e.x;
        }
        const col: any = dragDom.value;
        const top =
            e.y - pointerStartY.value < 0 ? 0 : e.y - pointerStartY.value;
        const left =
            e.x - pointerStartX.value < 0
                ? 0
                : Math.min(
                      e.x - pointerStartX.value,
                      containerRef.value.clientWidth - col.clientWidth
                  );
        const colTopX =
            top % unitLength.value > Math.floor(unitLength.value / 2)
                ? Math.floor(top / unitLength.value) + 1
                : Math.floor(top / unitLength.value);
        const colLeftY =
            left % unitLength.value > Math.floor(unitLength.value / 2)
                ? Math.floor(left / unitLength.value) + 1
                : Math.floor(left / unitLength.value);
        const colYPlus = Math.floor(col.clientWidth / unitLength.value);
        const colXPlus = Math.floor(col.clientHeight / unitLength.value);
        col.style.top = `${top}px`;
        col.style.left = `${left}px`;
        if (draggleDirection.value) {
            const flag = judgeCube(
                logCube,
                3,
                colTopX,
                colLeftY,
                colXPlus,
                colYPlus,
                col,
                draggleDirection.value
            );
            if (flag[0]) {
                const elements: any = _.cloneDeep(flag);
                elements.forEach((element: any) => {
                    const inerCol = element.label;
                    const type = element.type;
                    if (inerCol) {
                        let index = null;
                        const { topX, leftY, topXPlus, leftYPlus } =
                            getTopAndLeft(
                                inerCol.style.top,
                                inerCol.style.left,
                                inerCol.clientHeight,
                                inerCol.clientWidth,
                                unitLength.value
                            );
                        const enterDirectionLR =
                            colLeftY >= leftY ? 'right' : 'left';
                        const enterDirectionTB =
                            colTopX > topX ? 'buttom' : 'top';
                        //   console.log(enterDirectionLR, enterDirectionTB);
                        const subTop =
                            Math.max(colTopX, topX) - Math.min(colTopX, topX);
                        const subLeft =
                            Math.max(colLeftY, leftY) -
                            Math.min(colLeftY, leftY);
                        logCube = resetFun(
                            logCube,
                            inerCol,
                            topX,
                            leftY,
                            topXPlus,
                            leftYPlus,
                            unitLength.value
                        );
                        logCube = setFun(
                            logCube,
                            col,
                            colTopX,
                            colLeftY,
                            colXPlus,
                            colYPlus,
                            cardType.value,
                            unitLength.value
                        );
                        if (
                            leftY + leftYPlus < 8 &&
                            judgeCube(
                                logCube,
                                1,
                                topX,
                                enterDirectionLR === 'right'
                                    ? leftY + colYPlus + leftYPlus - 1
                                    : leftY + leftYPlus,
                                topXPlus,
                                leftYPlus,
                                'right'
                            )[0] &&
                            colLeftY + colYPlus + leftYPlus <= 8
                        ) {
                            // 拖拽区域有元素，并且元素右侧有空间
                            if (colLeftY > leftY) {
                                index = subLeft + colYPlus;
                            } else {
                                index =
                                    Math.max(subLeft, colYPlus) -
                                    Math.min(subLeft, colYPlus);
                            }
                            console.log('right', 'index: ', index, subLeft);
                            inerCol.style.top = `${topX * unitLength.value}px`;
                            inerCol.style.left = `${
                                (leftY + index) * unitLength.value
                            }px`;
                            logCube = resetFun(
                                logCube,
                                col,
                                colTopX,
                                colLeftY,
                                colXPlus,
                                colYPlus,
                                unitLength.value
                            );
                            logCube = setFun(
                                logCube,
                                inerCol,
                                topX,
                                leftY + index,
                                topXPlus,
                                leftYPlus,
                                type,
                                unitLength.value
                            );
                        } else if (
                            leftY > 0 &&
                            judgeCube(
                                logCube,
                                1,
                                topX,
                                enterDirectionLR === 'left'
                                    ? leftY - subLeft
                                    : leftY,
                                topXPlus,
                                enterDirectionLR === 'left'
                                    ? leftYPlus
                                    : leftYPlus - subLeft,
                                'left'
                            )[0] &&
                            colLeftY - leftYPlus >= 0
                        ) {
                            // 拖拽区域有元素，并且元素右侧无空间，左侧有空间
                            if (colLeftY > leftY) {
                                index =
                                    Math.max(subLeft, leftYPlus) -
                                    Math.min(subLeft, leftYPlus);
                            } else {
                                index =
                                    enterDirectionLR === 'left'
                                        ? leftYPlus + subLeft
                                        : leftYPlus;
                            }
                            console.log('left', 'index: ', index, subLeft);
                            inerCol.style.top = `${topX * unitLength.value}px`;
                            inerCol.style.left = `${
                                (leftY - index) * unitLength.value
                            }px`;
                            logCube = resetFun(
                                logCube,
                                col,
                                colTopX,
                                colLeftY,
                                colXPlus,
                                colYPlus,
                                unitLength.value
                            );
                            logCube = setFun(
                                logCube,
                                inerCol,
                                topX,
                                leftY - index,
                                topXPlus,
                                leftYPlus,
                                type,
                                unitLength.value
                            );
                        } else if (
                            judgeCube(
                                logCube,
                                1,
                                enterDirectionTB === 'top'
                                    ? topX - colXPlus
                                    : topX,
                                leftY,
                                topXPlus,
                                leftYPlus,
                                'top'
                            )[0] &&
                            topX > 0
                        ) {
                            // 拖拽区域有元素，并且元素左侧, 右侧无空间，上侧无有空间
                            if (colTopX > topX) {
                                index = topXPlus - subTop;
                            } else {
                                index =
                                    enterDirectionTB === 'top'
                                        ? colXPlus
                                        : topXPlus;
                            }
                            console.log('top', 'index: ', index, subTop);
                            inerCol.style.top = `${
                                (topX - index) * unitLength.value
                            }px`;
                            inerCol.style.left = `${
                                leftY * unitLength.value
                            }px`;
                            logCube = resetFun(
                                logCube,
                                col,
                                colTopX,
                                colLeftY,
                                colXPlus,
                                colYPlus,
                                unitLength.value
                            );
                            logCube = setFun(
                                logCube,
                                inerCol,
                                topX - index,
                                leftY,
                                topXPlus,
                                leftYPlus,
                                type,
                                unitLength.value
                            );
                        } else {
                            // 拖拽区域有元素，并且元素左侧, 右侧，上侧无空间
                            if (colTopX < topX) {
                                index =
                                    topXPlus - subTop === 0
                                        ? 1
                                        : topXPlus - subTop;
                            } else {
                                index =
                                    subTop >= topXPlus
                                        ? topXPlus
                                        : subTop + colXPlus;
                            }
                            while (
                                !judgeCube(
                                    logCube,
                                    1,
                                    topX + index,
                                    leftY,
                                    topXPlus,
                                    leftYPlus,
                                    'bottom'
                                )[0]
                            ) {
                                index++;
                            }
                            console.log('buttom', 'index: ', index, subTop);
                            inerCol.style.top = `${
                                (topX + index) * unitLength.value
                            }px`;
                            inerCol.style.left = `${
                                leftY * unitLength.value
                            }px`;
                            logCube = resetFun(
                                logCube,
                                col,
                                colTopX,
                                colLeftY,
                                colXPlus,
                                colYPlus,
                                unitLength.value
                            );
                            logCube = setFun(
                                logCube,
                                inerCol,
                                topX + index,
                                leftY,
                                topXPlus,
                                leftYPlus,
                                type,
                                unitLength.value
                            );
                        }
                    }
                });
            }
        }
    }
};
/** 添加卡片 */
const addCard = (type: string) => {
    const value = guid();
    cardList.value.push({ value, type });
    setTimeout(() => {
        const col: any = document.querySelector(`#col${value}`);
        let topX = 0;
        let leftY = 0;
        const topXPlus = type === 'gauge' ? 1 : 2;
        const leftYPlus = type === 'gauge' ? 1 : 4;
        console.log(leftYPlus);
        console.log(
            judgeCube(logCube, 1, topX, leftY, topXPlus, leftYPlus, 'right')
        );
        while (
            !judgeCube(
                logCube,
                1,
                topX,
                leftY,
                topXPlus,
                leftYPlus,
                'right'
            )[0] ||
            leftY + leftYPlus > 8
        ) {
            topX = leftY + 1 < 8 ? topX : topX + 1;
            leftY = leftY + 1 < 8 ? leftY + 1 : 0;
        }
        col.style.top = `${topX * unitLength.value}px`;
        col.style.left = `${leftY * unitLength.value}px`;
        logCube = setFun(
            logCube,
            col,
            topX,
            leftY,
            topXPlus,
            leftYPlus,
            type,
            unitLength.value
        );
        console.log(logCube);
        // col.style.display = "block";
    });
};
/** 保存 */
const save = () => {
    console.log(logCube);
    localStorage.setItem('logCube', JSON.stringify(logCube));
};
</script>
<style>
.bg-cube {
    background-image: linear-gradient(
            0deg,
            #f3f1f0 10%,
            transparent 10%,
            transparent 91%,
            #f3f1f0 91%,
            #f3f1f0
        ),
        linear-gradient(
            90deg,
            #f3f1f0 10%,
            transparent 10%,
            transparent 91%,
            #f3f1f0 91%,
            #f3f1f0
        ),
        linear-gradient(
            0deg,
            transparent 10%,
            #b4b4b4 10%,
            #b4b4b4 11%,
            transparent 11%,
            transparent 90%,
            #b4b4b4 90%,
            #b4b4b4 91%,
            transparent 91%,
            transparent
        ),
        linear-gradient(
            90deg,
            transparent 10%,
            #b4b4b4 10%,
            #b4b4b4 11%,
            transparent 11%,
            transparent 90%,
            #b4b4b4 90%,
            #b4b4b4 91%,
            transparent 91%,
            transparent
        );
}
.root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.root .nav {
    width: 100%;
    height: 50px;
}
.root .content {
    height: 100%;
    width: 90%;
    position: relative;
    margin: 0 auto;
}
.content .gauge {
    width: v-bind('gaugeWidth');
    height: v-bind('gaugeHeight');
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
    /* display: none; */
}
.contine {
    width: 99%;
    height: 99%;
    background-color: forestgreen;
}
.content .line {
    width: v-bind('lineWidth');
    height: v-bind('lineHeight');
    position: absolute;
    top: 0;
    left: 0;
    /* display: none; */
}
.col {
    display: inline-block;
    cursor: move;
}
</style>
