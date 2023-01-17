/**
 * uid
 * @returns uid
 */
export const guid = () => {
  return 'colxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 获得卡片的topX，leftY，topXPlus，leftYPlus
 * @param top style top 值
 * @param left style left 值
 * @param clientHeight DOM的clientHeight
 * @param clientWidth DOM的cclientWidth
 * @param unitLength 拖拽区域单位长度，用于吸附等操作处理
 * @returns 卡片的topX，leftY，topXPlus，leftYPlus
 */
export const getTopAndLeft = (top: any, left: any, clientHeight: number, clientWidth: number, unitLength: number) => {
  const topX = top.replace('px', '') / unitLength
  const leftY = left.replace('px', '') / unitLength
  const topXPlus = Math.floor(clientHeight / unitLength)
  const leftYPlus = Math.floor(clientWidth / unitLength)
  return { topX, leftY, topXPlus, leftYPlus }
}

/**
 * 元素从logCube删除
 * @param logCube 用来记录元素被放置到的位置的合集，用来进行拖拽判定等
 * @param inerCol 卡片DOM
 * @param topX  卡片首个元素对应logCube中的行单位
 * @param leftY 卡片首个元素对应logCube中的列单位
 * @param topXPlus 卡片高度单位
 * @param leftYPlus 卡片宽度单位
 * @param unitLength 拖拽区域单位长度，用于吸附等操作处理
 * @returns logCube
 */
export const resetFun = (logCube: any, inerCol: any, topX: number, leftY: number, topXPlus: number, leftYPlus: number, unitLength: number) => {
  topX = Math.floor(topX)
  leftY = Math.floor(leftY)
  topXPlus = Math.floor(topXPlus) - 1
  leftYPlus = Math.floor(leftYPlus) - 1
  logCube[topX][leftY].value = 0
  logCube[topX][leftY].label = ''
  logCube[topX][leftY].type = ''
  logCube[topX][leftY].id = ''
  if (inerCol.clientWidth > unitLength || inerCol.clientHeight > unitLength) {
    if (inerCol.clientWidth > unitLength && inerCol.clientHeight > unitLength) {
      for (let i = 1; i <= topXPlus; i++) {
        for (let j = 1; j <= leftYPlus; j++) {
          if (logCube[topX][leftY + j]) {
            logCube[topX][leftY + j].value = 0
            logCube[topX][leftY + j].label = ''
            logCube[topX][leftY + j].type = ''
            logCube[topX][leftY + j].id = ''
          }
          if (logCube[topX + i]) {
            logCube[topX + i][leftY].value = 0
            logCube[topX + i][leftY].label = ''
            logCube[topX + i][leftY].type = ''
            logCube[topX + i][leftY].id = ''

            logCube[topX + i][leftY + j].value = 0
            logCube[topX + i][leftY + j].label = ''
            logCube[topX + i][leftY + j].type = ''
            logCube[topX + i][leftY + j].id = ''
          }
        }
      }
    } else {
      if (inerCol.clientWidth > unitLength) {
        for (let j = 1; j <= leftYPlus; j++) {
          if (logCube[topX][leftY + j]) {
            logCube[topX][leftY + j].value = 0
            logCube[topX][leftY + j].label = ''
            logCube[topX][leftY + j].type = ''
            logCube[topX][leftY + j].id = ''
          }
        }
      }
      if (inerCol.clientHeight > unitLength) {
        for (let i = 1; i <= topXPlus; i++) {
          if (logCube[topX + i]) {
            logCube[topX + i][leftY].value = 0
            logCube[topX + i][leftY].label = ''
            logCube[topX + i][leftY].type = ''
            logCube[topX + i][leftY].id = ''
          }
        }
      }
    }
  }
  return logCube
}

/**
 * 元素设置到logCube中
 * @param logCube 用来记录元素被放置到的位置的合集，用来进行拖拽判定等
 * @param inerCol 卡片DOM
 * @param topX  卡片首个元素对应logCube中的行单位
 * @param leftY 卡片首个元素对应logCube中的列单位
 * @param topXPlus 卡片高度单位
 * @param leftYPlus 卡片宽度单位
 * @param type 卡片类型
 * @param unitLength 拖拽区域单位长度，用于吸附等操作处理
 * @returns logCube
 */
export const setFun = (logCube: any, inerCol: any, topX: number, leftY: number, topXPlus: number, leftYPlus: number, type: any, unitLength: number) => {
  topX = Math.floor(topX)
  leftY = Math.floor(leftY)
  topXPlus = Math.floor(topXPlus) - 1
  leftYPlus = Math.floor(leftYPlus) - 1
  if (!logCube[topX]) {
    logCube[topX] = []
  }
  if (!logCube[topX][leftY]) {
    logCube[topX][leftY] = {}
  }
  logCube[topX][leftY].value = 1
  logCube[topX][leftY].label = inerCol
  logCube[topX][leftY].type = type
  logCube[topX][leftY].id = inerCol.id
  if (inerCol.clientWidth > unitLength || inerCol.clientHeight > unitLength) {
    if (inerCol.clientWidth > unitLength && inerCol.clientHeight > unitLength) {
      for (let i = 1; i <= topXPlus; i++) {
        if (!logCube[topX + i]) {
          logCube[topX + i] = []
        }
        for (let j = 1; j <= leftYPlus; j++) {
          if (!logCube[topX][leftY + j]) {
            logCube[topX][leftY + j] = {}
          }
          if (!logCube[topX + i][leftY]) {
            logCube[topX + i][leftY] = {}
          }
          if (!logCube[topX + i][leftY + j]) {
            logCube[topX + i][leftY + j] = {}
          }
          logCube[topX][leftY + j].value = 1
          logCube[topX][leftY + j].label = inerCol
          logCube[topX][leftY + j].type = type
          logCube[topX][leftY + j].id = inerCol.id

          logCube[topX + i][leftY].value = 1
          logCube[topX + i][leftY].label = inerCol
          logCube[topX + i][leftY].type = type
          logCube[topX + i][leftY].id = inerCol.id

          logCube[topX + i][leftY + j].value = 1
          logCube[topX + i][leftY + j].label = inerCol
          logCube[topX + i][leftY + j].type = type
          logCube[topX + i][leftY + j].id = inerCol.id
        }
      }
    } else {
      if (inerCol.clientWidth > unitLength) {
        for (let j = 1; j <= leftYPlus; j++) {
          if (!logCube[topX][leftY + j]) {
            logCube[topX][leftY + j] = {}
          }
          logCube[topX][leftY + j].value = 1
          logCube[topX][leftY + j].label = inerCol
          logCube[topX][leftY + j].type = type
          logCube[topX][leftY + j].id = inerCol.id
        }
      }
      if (inerCol.clientHeight > unitLength) {
        for (let i = 1; i <= topXPlus; i++) {
          if (!logCube[topX + i]) {
            logCube[topX + i] = []
          }
          if (!logCube[topX + i][leftY]) {
            logCube[topX + i][leftY] = {}
          }
          logCube[topX + i][leftY].value = 1
          logCube[topX + i][leftY].label = inerCol
          logCube[topX + i][leftY].type = type
          logCube[topX + i][leftY].id = inerCol.id
        }
      }
    }
  }
  return logCube
}

/**
 * level =3 判断目标区域元素；level = 1 判断目标元素的移动方向
 * @param logCube 用来记录元素被放置到的位置的合集，用来进行拖拽判定等
 * @param level 判断方式
 * @param topX 卡片首个元素对应logCube中的行单位
 * @param leftY 卡片首个元素对应logCube中的列单位
 * @param topXPlus 卡片高度单位
 * @param leftYPlus 卡片宽度单位
 * @param type level = 3 被拖拽元素DOM/ level = 1 目标元素移动方向
 * @param draggleDirection //拖拽方向（left or right） 主要用于判断目标的数量和位置 level = 3 时必传
 * @returns level = 3 [boolean] || [目标元素合集]/ level = 1 [boolean]
 */
export const judgeCube = (logCube: any, level: number, topX: number, leftY: number, topXPlus: number, leftYPlus: number, type: any, draggleDirection?: string): any[] => {
  if (level === 3) {
    let result = []
    for (let i = 0; i < topXPlus; i++) {
      if (draggleDirection === 'right') {
        for (let j = 0; j < leftYPlus; j++) {
          if (logCube[topX + i] && logCube[topX + i][leftY + j] && logCube[topX + i][leftY + j].value === 1 && logCube[topX + i][leftY + j].label !== type) {
            result.push(logCube[topX + i][leftY + j])
          }
        }
      }
      if (draggleDirection === 'left') {
        for (let j = 1; j <= leftYPlus; j++) {
          if (
            logCube[topX + i] &&
            logCube[topX + i][leftY + leftYPlus - j] &&
            logCube[topX + i][leftY + leftYPlus - j].value === 1 &&
            logCube[topX + i][leftY + leftYPlus - j].label !== type
          ) {
            result.push(logCube[topX + i][leftY + leftYPlus - j])
          }
        }
      }
    }
    const obj: any = {}
    result = result.reduce(function (item: any, next: any) {
      obj[next.id] ? '' : (obj[next.id] = true && item.push(next))
      return item
    }, [])
    return result.length ? result : [false]
  }
  if (level === 1) {
    for (let i = 0; i < topXPlus; i++) {
      for (let j = 0; j < leftYPlus; j++) {
        if (type === 'right') {
          if (logCube[topX + i] && logCube[topX + i][leftY + j] && logCube[topX + i][leftY + j].value !== 0) {
            return [false]
          }
        }
        if (type === 'left') {
          if ((logCube[topX + i] && logCube[topX + i][leftY - j - 1] && logCube[topX + i][leftY - j - 1].value !== 0) || leftY - j - 1 < 0) {
            return [false]
          }
        }
        if (type === 'bottom') {
          if (logCube[topX + i] && logCube[topX + i][leftY + j] && logCube[topX + i][leftY + j].value !== 0) {
            return [false]
          }
        }
        if (type === 'top') {
          if ((logCube[topX - i] && logCube[topX - i][leftY + j] && logCube[topX - i][leftY + j].value !== 0) || topX - i < 0) {
            return [false]
          }
        }
      }
    }
    return [true]
  }
  return [false]
}
