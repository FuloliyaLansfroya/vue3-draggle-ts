<template>
  <div class="root" @mousemove="allowDrop">
    <div ref="containerRef" class="content bg-cube">
      <div v-for="(item, index) in cardList" :key="item.id" :id="item.id" class="drag" @mousedown="drag($event, item.id, item.type)">
        <slot name="content" :type="item.type">
          <div class="contine">
            {{ item.value || `item${index}` }}
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getTopAndLeft, guid, resetFun, setFun, judgeCube } from './utils'
import _ from 'lodash'
type Props = {
  unitLength?: number
  logCube: Array<{ id: string; type: string; [propName: string]: any }>
}
const props = withDefaults(defineProps<Props>(), {
  logCube: () => [],
})
const containerRef = ref() // 拖拽区域DOM
const pointerStartX = ref(0) // 开始拖拽时的X坐标，用于计算left
const pointerStartY = ref(0) // 开始拖拽时的Y坐标，用于计算top
const dragDom = ref(null) // 被拖拽卡片的DOM
const cardList: any = ref([]) // 卡片列表
const unitLength = ref(0) // 拖拽区域单位长度，用于吸附等操作处理
const cardType = ref('') // 被拖拽卡片的类型
const width = ref('') // 卡片宽度
const height = ref('') // 卡片高度
const beforePointer = ref(0) // 拖拽进入时的鼠标X坐标，用于计算被拖拽元素进入目标的方向（left or right）
const draggleDirection = ref('') // 拖拽方向（left or right） 主要用于判断目标的数量和位置
let logCube: any = [] // 用来记录元素被放置到的位置的合集，用来进行拖拽判定等
watch(
  () => props.logCube,
  (value) => {
    logCube = value
    init()
  }
)
watch(
  () => props.unitLength,
  () => {
    resize()
  }
)
onMounted(() => {
  resize()
  window.addEventListener('mouseup', drop)
  window.addEventListener('resize', resize)
})
const resize = () => {
  unitLength.value = props.unitLength || Math.floor(containerRef.value.clientWidth / 8)
  const size = `${unitLength.value}px`
  width.value = `${unitLength.value - 10}px`
  height.value = `${unitLength.value - 10}px`
  containerRef.value.style.backgroundSize = `${size} ${size}, ${size} ${size}, ${size} ${size}, ${size} ${size}`
  init()
}
/** 格式化 */
const uninit = () => {
  dragDom.value = null
  beforePointer.value = 0
  draggleDirection.value = ''
}
/** 初始化 */
const init = () => {
  cardList.value = []
  logCube.forEach((val: any, y: number) => {
    val &&
      val.forEach((item: any, x: number) => {
        if (item && item.value === 1) {
          const data = cardList.value.find((val: any) => {
            return val.id === item.id
          })
          if (!data) {
            cardList.value.push({
              id: item.id,
              type: item.type,
            })
          }
          setTimeout(() => {
            const col: any = document.querySelector(`#${item.id}`)
            if (!logCube[y]) {
              logCube[y] = []
            }
            logCube[y][x] = {
              label: col,
              type: item.type,
              value: 1,
              id: item.id,
            }
            if (!data) {
              col.style.top = `${y * unitLength.value}px`
              col.style.left = `${x * unitLength.value}px`
            }
          })
        }
      })
  })
}

/** 开始拖拽 */
const drag = (e: any, id: any, type: string) => {
  e.preventDefault()
  const col: any = document.querySelector(`#${id}`)
  const { topX, leftY, topXPlus, leftYPlus } = getTopAndLeft(col.style.top, col.style.left, col.clientHeight, col.clientWidth, unitLength.value)
  if (logCube[topX] && logCube[topX][leftY]) {
    logCube = resetFun(logCube, col, topX, leftY, topXPlus, leftYPlus, unitLength.value)
  }
  dragDom.value = col
  cardType.value = type
  pointerStartX.value = e.x - Number(col.style.left.replace('px', ''))
  pointerStartY.value = e.y - Number(col.style.top.replace('px', ''))
}
/** 鼠标放下，拖拽结束 */
const drop = () => {
  if (dragDom.value) {
    const col: any = dragDom.value
    const top = Number(col.style.top.replace('px', ''))
    const left = Number(col.style.left.replace('px', ''))

    if (top % unitLength.value > Math.floor(unitLength.value / 2)) {
      col.style.top = `${(Math.floor(top / unitLength.value) + 1) * unitLength.value}px`
    } else {
      col.style.top = `${Math.floor(top / unitLength.value) * unitLength.value}px`
    }
    if (left % unitLength.value > Math.floor(unitLength.value / 2)) {
      col.style.left = `${(Math.floor(left / unitLength.value) + 1) * unitLength.value}px`
    } else {
      col.style.left = `${Math.floor(left / unitLength.value) * unitLength.value}px`
    }

    const { topX, leftY, topXPlus, leftYPlus } = getTopAndLeft(col.style.top, col.style.left, col.clientHeight, col.clientWidth, unitLength.value)
    logCube = setFun(logCube, col, topX, leftY, topXPlus, leftYPlus, cardType.value, unitLength.value)
  }
  //   console.log(logCube)
  uninit()
}
/** 拖拽过程中移动判断 */
const allowDrop = (e: any) => {
  if (dragDom.value) {
    if (beforePointer.value !== 0) {
      draggleDirection.value = e.x >= beforePointer.value ? 'right' : 'left'
    } else {
      beforePointer.value = e.x
    }
    const col: any = dragDom.value
    const top = e.y - pointerStartY.value < 0 ? 0 : e.y - pointerStartY.value
    const left = e.x - pointerStartX.value < 0 ? 0 : Math.min(e.x - pointerStartX.value, containerRef.value.clientWidth - col.clientWidth)

    col.style.top = `${top}px`
    col.style.left = `${left}px`

    const colTopX = top % unitLength.value > Math.floor(unitLength.value / 2) ? Math.floor(top / unitLength.value) + 1 : Math.floor(top / unitLength.value)
    const colLeftY = left % unitLength.value > Math.floor(unitLength.value / 2) ? Math.floor(left / unitLength.value) + 1 : Math.floor(left / unitLength.value)

    const colYPlus = Math.floor(col.clientWidth / unitLength.value)
    const colXPlus = Math.floor(col.clientHeight / unitLength.value)

    if (draggleDirection.value) {
      const flag = judgeCube(logCube, 3, colTopX, colLeftY, colXPlus, colYPlus, col, draggleDirection.value)
      if (flag[0]) {
        const elements: any = _.cloneDeep(flag)
        elements.forEach((element: any) => {
          const inerCol = element.label
          const type = element.type
          if (inerCol) {
            let index = null
            let { topX, leftY, topXPlus, leftYPlus } = getTopAndLeft(inerCol.style.top, inerCol.style.left, inerCol.clientHeight, inerCol.clientWidth, unitLength.value)

            const enterDirectionLR = colLeftY >= leftY ? 'right' : 'left'
            const enterDirectionTB = colTopX > topX ? 'buttom' : 'top'
            const subTop = Math.max(colTopX, topX) - Math.min(colTopX, topX)
            const subLeft = Math.max(colLeftY, leftY) - Math.min(colLeftY, leftY)

            logCube = resetFun(logCube, inerCol, topX, leftY, topXPlus, leftYPlus, unitLength.value)
            logCube = setFun(logCube, col, colTopX, colLeftY, colXPlus, colYPlus, cardType.value, unitLength.value)
            // 拖拽区域有元素，并且元素右侧有空间
            if (
              leftY + leftYPlus < 8 &&
              judgeCube(logCube, 1, topX, enterDirectionLR === 'right' ? leftY + colYPlus + leftYPlus - 1 : leftY + leftYPlus, topXPlus, leftYPlus, 'right')[0] &&
              colLeftY + colYPlus + leftYPlus <= 8
            ) {
              if (colLeftY > leftY) {
                index = subLeft + colYPlus
              } else {
                index = Math.max(subLeft, colYPlus) - Math.min(subLeft, colYPlus)
              }
              leftY = leftY + index
              console.log('right', 'index: ', index, subLeft)
            }
            // 拖拽区域有元素，并且元素右侧无空间，左侧有空间
            else if (
              leftY > 0 &&
              judgeCube(logCube, 1, topX, enterDirectionLR === 'left' ? leftY - subLeft : leftY, topXPlus, enterDirectionLR === 'left' ? leftYPlus : leftYPlus - subLeft, 'left')[0] &&
              colLeftY - leftYPlus >= 0
            ) {
              if (colLeftY > leftY) {
                index = Math.max(subLeft, leftYPlus) - Math.min(subLeft, leftYPlus)
              } else {
                index = enterDirectionLR === 'left' ? leftYPlus + subLeft : leftYPlus
              }
              leftY = leftY - index
              console.log('left', 'index: ', index, subLeft)
            }
            // 拖拽区域有元素，并且元素左侧, 右侧无空间，上侧无有空间
            else if (judgeCube(logCube, 1, enterDirectionTB === 'top' ? topX - colXPlus : topX, leftY, topXPlus, leftYPlus, 'top')[0] && topX > 0) {
              if (colTopX > topX) {
                index = topXPlus - subTop
              } else {
                index = enterDirectionTB === 'top' ? colXPlus : topXPlus
              }
              topX = topX - index
              console.log('top', 'index: ', index, subTop)
            }
            // 拖拽区域有元素，并且元素左侧, 右侧，上侧无空间
            else {
              if (colTopX < topX) {
                index = topXPlus - subTop === 0 ? 1 : topXPlus - subTop
              } else {
                index = subTop >= topXPlus ? topXPlus : subTop + colXPlus
              }
              while (!judgeCube(logCube, 1, topX + index, leftY, topXPlus, leftYPlus, 'bottom')[0]) {
                index++
              }
              topX = topX + index
              console.log('buttom', 'index: ', index, subTop)
            }
            // 对元素赋值，设置内容
            inerCol.style.top = `${topX * unitLength.value}px`
            inerCol.style.left = `${leftY * unitLength.value}px`
            logCube = resetFun(logCube, col, colTopX, colLeftY, colXPlus, colYPlus, unitLength.value)
            logCube = setFun(logCube, inerCol, topX, leftY, topXPlus, leftYPlus, type, unitLength.value)
          }
        })
      }
    }
  }
}
/** 添加卡片 */
const addCard = (type?: string) => {
  const id = guid()
  cardList.value.push({ id, type: type || 'default' })
  setTimeout(() => {
    const col: any = document.querySelector(`#${id}`)
    let topX = 0
    let leftY = 0
    const { topXPlus, leftYPlus } = getTopAndLeft(col.style.top, col.style.left, col.clientHeight, col.clientWidth, unitLength.value)
    // console.log(leftYPlus);
    // console.log(
    //     judgeCube(logCube, 1, topX, leftY, topXPlus, leftYPlus, 'right')
    // );
    while (!judgeCube(logCube, 1, topX, leftY, topXPlus, leftYPlus, 'right')[0] || leftY + leftYPlus > 8) {
      topX = leftY + 1 < 8 ? topX : topX + 1
      leftY = leftY + 1 < 8 ? leftY + 1 : 0
    }
    col.style.display = 'block'
    col.style.top = `${topX * unitLength.value}px`
    col.style.left = `${leftY * unitLength.value}px`
    logCube = setFun(logCube, col, topX, leftY, topXPlus, leftYPlus, type, unitLength.value)
  })
}
/** 保存 */
const save = () => {
  return logCube
}
defineExpose({
  addCard,
  save,
  containerRef,
})
</script>
<style scoped>
.bg-cube {
  background-image: linear-gradient(0deg, #f3f1f0 10%, transparent 10%, transparent 91%, #f3f1f0 91%, #f3f1f0),
    linear-gradient(90deg, #f3f1f0 10%, transparent 10%, transparent 91%, #f3f1f0 91%, #f3f1f0),
    linear-gradient(0deg, transparent 10%, #b4b4b4 10%, #b4b4b4 11%, transparent 11%, transparent 90%, #b4b4b4 90%, #b4b4b4 91%, transparent 91%, transparent),
    linear-gradient(90deg, transparent 10%, #b4b4b4 10%, #b4b4b4 11%, transparent 11%, transparent 90%, #b4b4b4 90%, #b4b4b4 91%, transparent 91%, transparent);
}
.root {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.root .content {
  height: 100%;
  width: 90%;
  position: relative;
  margin: 0 auto;
  min-width: 1360px;
}
.drag {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 5px;
  /* display: none; */
}
.contine {
  display: flex;
  width: v-bind('width');
  height: v-bind('height');
  justify-content: center;
  align-items: center;
  font-size: 18px;
  font-weight: bolder;
  border: solid 1px #dcdfe6;
  background-color: white;
}
</style>
