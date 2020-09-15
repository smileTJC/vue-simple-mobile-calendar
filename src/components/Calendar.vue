<template>
<transition name="slideUp">
  <section class="calendar-wrapper" v-show="open">
    <div class="calendar-cover" @click="closeCalendar"></div>
    <div class="calendar-box">
      <div class="calendar-top">
        <div class="calendar-title">
          <span>{{ title }}</span>
          <i class="close-icon" @click="closeCalendar"></i>
        </div>
        <table class="week-box">
          <tr class="week-row">
            <td class="week-cell" :style="{'color': index === 0 || index === 6 ? themeColor : ''}" v-for="(week,index) in weekList" :key="index">{{ week }}</td>
          </tr>
        </table>
      </div>
      <div class="calendar-container">
        <ul>
          <li class="calendar-list" v-for="(current,index) in dateList" :key="index">
            <div class="calendar-month">{{ current.year + '年' + current.monthStr + '月' }}</div>
            <div class="calendar-item">
              <div class="calendar-background">{{ current.month }}</div>
              <div class="calendar-num" :style="{'background': item.areaStyle ? comeOutColor : '' }" v-for="(item,dayIndex) in current.date" :key="dayIndex" @click="selectedDate(item, current, dayIndex, index)">
                <div v-if="type === 'range'" :style="{'background': comeOutColor}" :class="{'calendar-checkin-selected': item.checkIn && !isDisabled, 'calendar-checkout-selected': item.checkOut}"></div>
                <div class="calendar-date" :style="{'border-radius': isCricle ? '50%' : '5px', 'background': item.selected ? themeColor : '', 'color': item.areaStyle ? themeColor : item.selected ? '#ffffff' : ''}">
                  <span class="selected-days-style" v-if="item.checkOut">共{{ selectedDays }}天</span>
                  <div :class="{'calendar-checked': item.checkOut || item.checkIn}">
                    <span :style="{'color': (item.selected || item.checkIn || item.checkOut) ? '#ffffff' : themeColor}" :class="{'calendar-num-disabled': item.disabled}" v-if="item.isNow">今天</span>
                    <span :class="{'calendar-num-disabled': item.disabled}" v-else>{{ item.dateNum ? item.dateNum : '' }}</span>
                    <span class="check-text" v-if="item.checkIn">{{ item.checkIn }}</span>
                    <span class="check-text" v-if="item.checkOut">{{ item.checkOut }}</span>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="calendar-btn">
        <button class="confirm-btn" :style="{'background': !isDisabled ? themeColor : ''}" @click="confirmDate">确定</button>
      </div>
    </div>
  </section>
</transition>
  
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
interface CalendarType {
  year: number;
  monthStr: string | number;
  month: number;
  date: Array < DateType > ;
}
interface DateType {
  dateNum: number;
  disabled: boolean;
  selected: boolean;
  areaStyle: boolean;
  isNow: boolean;
  checkIn: string;
  checkOut: string;
}
@Component({
  name: 'calendar'
})
export default class Calendar extends Vue {
  @Prop() show!: boolean // 是否显示日历
  @Prop({default: '选择日期'}) title!: string
  @Prop({default: 12}) monthNum!: number  // 显示月份个数
  @Prop({default: 'rgb(57,108,254)'}) themeColor!: string // 主题色
  @Prop({default: 'rgba(57,108,254,0.15)'}) comeOutColor!: string // 入住与离店之前的颜色
  @Prop({
    type: Array,
    default: () => {
      return ['开始', '结束']
    }
  }) customCheckText!: string[]
  @Prop({default: false}) controlDay!: boolean // 是否开启控制可选择天数
  @Prop({default: 30}) limitDay!: number  // 开启控制后可选择的天数，需小于展示的总天数
  @Prop({default: new Date().getTime()}) disabledTime!: number | string // 可以选中的起始日期(默认禁用当前日期之前的日期)
  @Prop() defaultDate!: Date | Date[] // 默认日期
  /**
   * 日历类型
   * range: 日期区间
   * simple: 单个日期
   */
  @Prop({
    default: 'range'
  }) type!: string
  @Prop({
    default: true
  }) isCricle!: boolean // 选中日期是否是圆形样式
  // 闰年每月天数
  private leapYear: number[] = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  // 平年每月天数
  private ordinaryYear: number[] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  private weekList = ['日', '一', '二', '三', '四', '五', '六'] // 一周列表
  private dateList: Array < CalendarType > = [] // 日历列表数据
  private clickCount = 1 // 点击次数
  private startDate = ''
  private endDate = ''
  private startTime: Date | number = new Date()
  private endTime: Date | number = new Date().getTime() + 24 * 3600 * 1000
  private startMonthIndex: number = 0 // 开始时间月份索引
  private endMonthIndex: number = 0 // 结束时间月份索引
  private startDateIndex: number = 0 // 开始日期索引
  private endDateIndex: number = 0 // 结束日期索引
  private areaDateIndex: Array < any > = [] // 选中区间日期索引
  private isDisabled: boolean = false // 确定按钮是否可点击
  private selectedDays: number = 1 // 选中的天数
  private open: boolean = this.show // 是否显示日历
  
  @Watch('show')
  public handleShowChanged(value: boolean) {
    this.dateList = []
    this.clickCount = 1
    this.isDisabled = false
    this.open = value
    // 若传入默认选中日期，则更新选中的日期
    if (this.defaultDate instanceof Date && this.defaultDate.getTime() > new Date().getTime()) {
      this.startTime = this.defaultDate
    }
    if (this.defaultDate instanceof Array && this.defaultDate.length > 0 && new Date(this.defaultDate[0]).getTime() > new Date().getTime()) {
      this.startTime = this.defaultDate[0]
      this.endTime = this.defaultDate[1]
    }
    this.startDate = this.formatTime(this.startTime)
    if (this.type === 'range') {
      this.endDate = this.formatTime(this.endTime)
      this.selectedDays = this.getOffsetDays(this.startDate, this.endDate)
    }
    this.initCalendar()
  }
  // 选中的日期
  public selectedDate(item: DateType, currentDate: CalendarType, dateIndex: number, monthIndex: number) {
    if (item.disabled || !item.dateNum) {
      return
    }
    let selectedTime = currentDate.year + '/' + currentDate.monthStr + '/' + this.addZero(item.dateNum)
    // 第一次点击
    if (this.clickCount === 1) {
      this.clearCheckedColor() // 点击时清除之前选中样式
      this.startDate = selectedTime
      this.startMonthIndex = monthIndex
      this.startDateIndex = dateIndex
      if (this.type === 'range') {
        this.clickCount = 2
        this.isDisabled = true
        item.checkIn = this.customCheckText[0]
      }
    } else if (this.clickCount === 2) {
      // 第二次点击
      this.endDate = selectedTime
      this.endDateIndex = dateIndex
      this.endMonthIndex = monthIndex
      // 日期转换为时间戳
      let startTime = new Date(this.startDate).getTime()
      let endTime = new Date(this.endDate).getTime()
      // 开始时间大于结束时间，重置时间选择
      if (endTime <= startTime) {
        this.startDate = selectedTime
        this.endDate = ''
        this.dateList[this.startMonthIndex].date[this.startDateIndex].selected = false
        this.dateList[this.startMonthIndex].date[this.startDateIndex].checkIn = ''
        item.checkIn = this.customCheckText[0]
        this.clickCount = 2
        this.startMonthIndex = monthIndex
        this.startDateIndex = dateIndex
      } else {
        this.checkedAreaColor(this.startDate, this.endDate)
        this.clickCount = 1
        item.checkOut = this.customCheckText[1]
        this.isDisabled = false
        this.selectedDays = this.getOffsetDays(this.startDate, this.endDate)
      }
    }
    item.selected = true // 高亮选中的日期
  }
  // 关闭日历弹窗
  public closeCalendar() {
    this.open = false
    this.$emit('cancel', false)
  }
  // 点击确定按钮
  public confirmDate() {
    let selectedDate
    if (this.type === 'range') {
      selectedDate = {
        startDate: this.startDate,
        endDate: this.endDate,
        startTime: new Date(this.formatTime(this.startDate)).getTime(),
        endTime: new Date(this.formatTime(this.endDate)).getTime(),
        startWeek: this.getWeek(this.startDate),
        endWeek: this.getWeek(this.endDate),
        dayNum: this.selectedDays
      }
      this.startTime = selectedDate.startTime // 重新赋值，保证下次进入日历时显示之前选中的日期
      this.endTime = selectedDate.endTime
    } else {
      selectedDate = {
        selectDate: this.startDate,
        selectTime: new Date(this.formatTime(this.startDate)).getTime(),
        week: this.getWeek(this.startDate)
      }
      this.startTime = selectedDate.selectTime
    }
    if (!this.isDisabled) {
      this.$emit('confirm', selectedDate)
    }
  }
  // 初始化日历组件
  public initCalendar() {
    for (let index = 0; index < this.monthNum; index++) {
      // 获取当前时间
      let currentDate = new Date()
      // 将月份设置到每月1号，防止当前为31号而下月无31号bug
      currentDate.setMonth(currentDate.getMonth() + index, 1)
      // 获取当前时间的年份
      let currentYear = currentDate.getFullYear()
      // 获取当前时间的月份
      let currentMonth = currentDate.getMonth()
      // 重组当前时间（年-月-日）至当月1号
      let setCurrentDate = new Date(currentYear, currentMonth, 1)
      // 获取每月1号为星期几
      let firstDay = setCurrentDate.getDay()
      // 获取每月天数
      let DaysInMonth = this.isLeapYear(currentYear) ? this.leapYear : this.ordinaryYear
      // 当前月份补0
      let nowMonth = this.addZero(currentMonth + 1)

      // 填充当前月份空白占位符
      let daysList = new Array(firstDay).fill({
        dateNum: 0,
        disabled: false,
        selected: false, // 是否选中日期
        areaStyle: false, // 是否激活开始与结束日期之前的样式
        isNow: false, // 是否是今天的日期
        checkIn: '',
        checkOut: ''
      })
      for (let i = 0; i < DaysInMonth[currentMonth]; i++) {
        let isDisabled = this.disabledDate(currentYear, currentMonth, i + 1, this.controlDay) // 禁用今天之前的日期
        let currentTime = currentYear + '/' + nowMonth + '/' + this.addZero(i + 1)
        let currentDay = {
          dateNum: i + 1,
          disabled: isDisabled,
          selected: false,
          areaStyle: false,
          isNow: false,
          checkOut: '',
          checkIn: ''
        }
        // 判断是否是今天的日期
        if (currentTime === this.formatTime(new Date())) {
          currentDay.isNow = true
        }
        if (currentTime === this.startDate) {
          // 高亮传入的日期
          currentDay.selected = true
          
          if (this.type === 'range') {
            currentDay.checkIn = this.customCheckText[0]
          }
          this.startMonthIndex = index
          this.startDateIndex = i + firstDay
        } else if (currentTime === this.endDate) {
          currentDay.selected = true
          currentDay.checkOut = this.customCheckText[1]
          this.endMonthIndex = index
          this.endDateIndex = i + firstDay
        } else if (new Date(currentTime).getTime() > new Date(this.startDate).getTime() &&
          new Date(currentTime).getTime() < new Date(this.endDate).getTime()) {
          // 判断日期是否在开始日期和结束日期之间
          currentDay.areaStyle = true
          // 记录选中日期索引
          this.areaDateIndex.push({
            monthIndex: index,
            dateIndex: i + firstDay
          })
        }
        daysList.push(currentDay)
      }
      this.dateList.push({
        year: currentYear,
        monthStr: nowMonth,
        month: currentMonth + 1,
        date: daysList
      })
    }
  }
  /**
   * 重置日历选中状态为初始样式
   */
  public clearCheckedColor() {
    this.dateList[this.startMonthIndex].date[this.startDateIndex].selected = false
    this.dateList[this.startMonthIndex].date[this.startDateIndex].checkIn = ''
    if (this.type === 'range') {
      this.dateList[this.endMonthIndex].date[this.endDateIndex].selected = false
      this.dateList[this.endMonthIndex].date[this.endDateIndex].checkOut = ''
      this.areaDateIndex.forEach((item) => {
        this.dateList[item.monthIndex].date[item.dateIndex].selected = false
        this.dateList[item.monthIndex].date[item.dateIndex].areaStyle = false
      })
      this.areaDateIndex = []
    }
  }
  /**
   * 设置日历开始时间与结束时间之间样式
   * @param startDate
   * @param endDate
   */
  public checkedAreaColor(startDate: string, endDate: string) {
    let startTime = new Date(this.formatTime(startDate)).getTime()
    let endTime = new Date(this.formatTime(endDate)).getTime()
    this.dateList.every((data, mIndex) => {
      let result = data.date.every((item, index) => {
        if (item.dateNum) {
          let time = new Date(data.year + '/' + data.monthStr + '/' + item.dateNum).getTime()
          // 判断日期是否在所选开始日期和结束日期之间
          if (time > startTime && time < endTime) {
            item.areaStyle = true
            // 记录选中日期索引
            this.areaDateIndex.push({
              monthIndex: mIndex,
              dateIndex: index
            })
            return true
          } else if (time > endTime) {
            // 若当前日期大于所选结束日期终止循环
            return false
          } else {
            return true
          }
        } else {
          return true
        }
      })
      if (!result) {
        return false
      } else {
        return true
      }
    })
  }
  /**
   * 禁用日期(默认禁用今天之前的日期)
   * @param year
   * @param month
   * @param date
   * @return {boolean}
   */
  public disabledDate(year: number, month: number, date: number, controlDay ? : boolean): boolean {
    // 重组传入的日期
    let selectDate = new Date(year, month, date).getTime()
    let nowDate = new Date(this.formatTime(this.disabledTime)).getTime() // 获取禁用开始时间的毫秒数
    if (controlDay) {
      // 若开启控制可选择天数
      let controlTime = nowDate + this.limitDay * 3600 * 24 * 1e3
      if (selectDate > controlTime || selectDate < nowDate) {
        return true
      } else {
        return false
      }
    } else {
      if (selectDate < nowDate) {
        return true
      } else {
        return false
      }
    }
  }
  /**
   * 判断是否是闰年
   * @param year
   * @return {boolean}
   */
  public isLeapYear(year: number): boolean {
    return (year % 4 === 0) && (year % 100 !== 0 || year % 400 === 0)
  }
  /**
   * 补0
   * @param num
   * @return {string | number}
   */
  public addZero(num: number) {
    return Number(num) < 10 ? '0' + num : num
  }
  /**
   * 根据开始时间与结束时间获取天数
   * @param startTime
   * @param endTime
   * @return {number}
   */
  public getOffsetDays(startTime: string, endTime: string) {
    let start = new Date(this.formatTime(startTime)).getTime()
    let end = new Date(this.formatTime(endTime)).getTime()
    let offsetTime = Math.abs(end - start)
    return Math.floor(offsetTime / (3600 * 24 * 1e3)) === 0 ? 1 : Math.floor(offsetTime / (3600 * 24 * 1e3))
  }
  /**
   * 根据时间返回对应的周或天
   * @param time
   */
  public getWeek(time: string) {
    let week: string = ''
    let currentDate = this.formatTime(new Date())
    let offsetDay = this.getOffsetDays(currentDate, time)
    if (time === currentDate) {
      week = '今天'
    } else {
      if (offsetDay === 1) {
        week = '明天'
      } else if (offsetDay === 2) {
        week = '后天'
      } else {
        let date = new Date(time)
        let myWeek = date.getDay()
        switch (myWeek) {
          case 0:
            week = '周日'
            break
          case 1:
            week = '周一'
            break
          case 2:
            week = '周二'
            break
          case 3:
            week = '周四'
            break
          case 4:
            week = '周四'
            break
          case 5:
            week = '周五'
            break
          case 6:
            week = '周六'
            break
        }
      }
    }
    return week
  }
  /**
   * 格式化时间
   * @param time
   * @param format 格式
   * @return {*}
   */
  public formatTime(time: any, format ? : string) {
    if (/^[0-9]*$/.test(time) && (time + '').length === 10) {
      time = +time * 1000
    }
    let timeFormat = format || '{y}/{m}/{d}'
    let date
    if (typeof time === 'object') {
      date = time
    } else if (typeof time === 'string') {
      time = time.replace(/-/g, '/')
        .replace(/年/g, '/')
        .replace(/月/g, '/')
        .replace(/日/g, '')
      date = new Date(time)
    } else {
      date = new Date(time)
    }
    let formatObj: any = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    let timeStr = timeFormat.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
      let value = formatObj[key]
      if (key === 'a') {
        return ['一', '二', '三', '四', '五', '六', '日'][value - 1]
      }
      if (result.length > 0 && value < 10) {
        value = '0' + value
      }
      return value || 0
    })
    return timeStr
  }
}
</script>

<style lang="scss" scoped>
.slideUp-enter-active, .slideUp-leave-active {
  transform: translateY(0%);
  transition: all .5s ease;
}

.slideUp-enter, .slideUp-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.calendar-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.calendar-cover {
  height: 100vh;
  z-index: 100;
  background: rgba($color: #0D0D0D, $alpha: 0.7);
}

.calendar-box {
  position: absolute;
  top: 20%;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 200;
  border-radius: 20px;
  .calendar-top {
    box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.1);
  }
}

.calendar-title {
  padding: 10px;
  position: relative;
  font-size: 18px;
  text-align: center;
  color: #010101;

  .close-icon {
    position: absolute;
    top: 12px;
    right: 15px;
    width: 17px;
    height: 17px;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAGSklEQVR4Xu2b2Y8URRzHv79aCeJfYPRZYzyC7HR3Ve8T6xmPeKCBBRQvFlCDCMh9LHjhfRCRgBeKeKBGjGiUeLzodvd0z/qkiRoT34zG+KKJ+ED/TC+zy+xOT3d1bc/uGOSNmV9V/T6f/lVV13YP4ST/Ryc5P/4X0FgBvj90LlO8nAjnDH8e4/CMGdP2z5w587f/UqV4XriNBJ3NwCnE+Kmri/fZtv19GsNoBXheOJsEfTk+iIBvmcVcpbq/63QJyQWEiHeBMbsxVyL8ThB9jtP9eQofMBiGs0RMXwE4rYWljpeQwBPFBxk4rwXDD8eOner29Jz/xxg5yX+CIFrAwIGsK9zJlZAHP8LFRDe5TmUM5/AUqM+ZgbwS70QJuvAJG8e83XXtbUYVMNKokyQUgc8UkLcGdOLCWBR+mIGnn67UBb82VUB9GqTuAq2mxVRWggk8AXOltN5J3QVGPvT9qBeEL/LWgqmcDibwTDTPdSoHM+8DRr4MgtpFDG7aLzuhEozg47jPdZ23M/Jv/qpaHbo45vizTqoEE3hB1Oc4lZbwCV/Ls4Dvh5eC6EgnSDCBhxDzld39Vl7+mYch348uA+HTvE7auSaYwBN4gZT2mzp5554Gg6B2OYM/0emsXlKl3TabwWOhlNYbBfLND/W88AoS9HF+5PGIMrZIE/i0W928nHMr4MQWGV4Joo/yOixjOpjAg+OblXJe182vIU/9JkEQXcXAYd0WJpVgBs+LlLL36+bVGKddAQ33CVcz+EPdwYpIMIIXYpGyu43gM7fBLEDPC68hQR+UKcEEnsC3SGm/pptHWlzhCmhYE64F0SHdwbMqwQwet0ppvao7fqs4YwFJh0EQXcfA+7pJpEkwgWei21ynsk933Ky4CQlIOva86hwS4j3dZBolmMCD6XalKq/ojpcXN2EByQC+H94AonfzBmvcIoloAzPvaPU3vNS+mO9Qyn5ZdxyduFIE1CXcCKKm83arJBj4h4DpOkkmMTF4cY+0X9KN140rTUB9OswlITJPX7qJNcZxjH7XtV40aZvXplQBdQnzSIjcU1heYg3TpV/K9sAnY5QuoD4d+kCkdRrLEsFES1yn8oKuLJO4tghIEgmCofmMWPtU1pQ801KlKntNoIq0aZuA49OhtpAEGxxQeJmU9p4iIKaxbRUw/KwO8REQziyQ4C9gcclkPYtsmwCjm5y6pSIHqAJiU0PbImAi8A2rf2l/WcqSVLqAMuAnU0KpAsqEnywJpQloB/xkSChFgCF8cqM0X3cRa9fCOGEBJvBMWOE61k6vWusnZu2bnXZImJAAE3gw7lXKenbkyvvV2hIwa9/0lC3BWIAJfMy8skfZz4wvey+IlhGweyqmg5EAE3gIWqnsShP8CLRXje4kxvOTLaGwABN4Aq2SsvJ0Hpxfje4CY1deXJm7QyEBZvBYLaX1lC6UH9buRszP6cZPdE3QFmACD8J9yrGe1IUZnQ5BtJyAnbrtJiJBS4ARPGONUtYTuhBNC2M1uocYo7tFXj+mEnIFmMATeK2U9uN5Sed971ejFWC0XDjHtzeRkPOCRPbrp2kADF7nSvuxPDjd770gXEkg7TWkqISMV2SKwxNonZSV0uAb1oRVBGivJUUkpAowK3usl9J6VPfKFo3zq9FqMLTXFF0JTQJM4EHYoBzrkaJQReMHg3CNAGlXmI6EMQKM4BkblbJ2FIUxjfeCcC2BtCstT8KoABN4Am2SsvKwKYxpOy+I1hGgXXFZEkYFBEE0xMAs3aQYvNmV9kO68WXH+dVoPRhFKu+Qktb1KVvn8HP+xQxoP4HhGFtc13qwbKii/XlBuJFA2heBQHOkrIx5n2G4AnR/MJHEChJbHKd7yuFPbJHhJgJp5ZO2TRcTQNiqHOuBoleq3fFeNdpMjNy8CGh60Dos4Otq9cIuFt9kJsoYUMq6v90wpv0P+tWtgsT2bAaylKrUGmNGF0EviHYTsCytAwJtk7KS3blp5iW284JwIMk1tUvivcqxl6YugqPzKfnBYZfoB/MZ9c9+5jje7rpOKS8klcjasqsgqA0weG3DTwD/BGGPcqw16Rd33KeDg4MzhBBnJR/HcfxjT0/P35OReJljJAxE02TS59Gjf/m9vb1HW/WfexwuM7FO7OukF/AvKEBSbnSOERQAAAAASUVORK5CYII=') no-repeat;
    background-size: 100% 100%;
  }
}

.week-box {
  width: 100%;
  display: table;

  .week-row {
    display: table-row;
  }

  .week-cell {
    display: table-cell;
    padding: 10px;
    color: #6C6C6C;
    font-size: 28rpx;
    text-align: center;
  }
}

.calendar-container {
  height: calc(100% - 165px);
  overflow-y: scroll;
  box-sizing: border-box;
  /* 避免设置padding出现双滚动条的问题 */
  -webkit-overflow-scrolling: touch;
  /*使iOS列表滑动流畅*/
  ul {
    padding: 0%;
    margin: 0%;
  }
}

.calendar-list {
  list-style: none;
  color: #010101;
  padding: 15px 0;

  &:last-child {
    padding-bottom: 0;
  }

  .calendar-month {
    text-align: center;
    margin-bottom: 20px;
    font-size: 16px;
  }
}

.calendar-item {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  position: relative;

  .calendar-background {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 180px;
    text-shadow: 0 0 2px #DCDCDC;
    color: #ffffff;
  }

  .calendar-checked {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    line-height: 100%;
    flex-direction: column;
    font-size: 14px;
    z-index: 100;

    .check-text {
      font-size: 12px;
      margin-top: 2px;
    }
  }

  .calendar-num-disabled {
    color: #DCDCDC;
  }

  .calendar-checkin-selected {
    position: absolute;
    width: 50%;
    top: 0;
    bottom: 0;
    right: 0;
    background: rgba(57, 108, 254, 0.15);
  }

  .calendar-checkout-selected {
    position: absolute;
    width: 50%;
    top: 0;
    bottom: 0;
    left: 0;
    background: rgba(57, 108, 254, 0.15);
  }
}

.calendar-num {
  width: calc(100% / 7);
  font-size: 16px;
  text-align: center;
  z-index: 300;
  position: relative;
  padding: 0 5px;
  box-sizing: border-box;
  margin: 5px 0;

  .calendar-date {
    height: 43.6px;
    line-height: 43.6px;
    position: relative;
  }

  .selected-days-style {
    position: absolute;
    width: 90%;
    font-size: 12px;
    height: 20px;
    line-height: 20px;
    background: rgba($color: #000000, $alpha: 0.5);
    border-radius: 2px;
    top: -26px;
    left: 50%;
    transform: translateX(-50%);
    color: #ffffff;

    &::after {
      content: '';
      border-width: 4px;
      border-style: solid;
      border-color: rgba($color: #000000, $alpha: 0.5) transparent transparent;
      position: absolute;
      bottom: -8px;
      left: 43%;
      transform: translateX(-50%);
    }
  }
}

.calendar-btn {
  position: fixed;
  width: 100%;
  height: 75px;
  bottom: 0;
  z-index: 400;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;

  .confirm-btn {
    width: 85%;
    padding: 15px 0;
    border-radius: 32px;
    background: #DCDCDC;
    color: #ffffff;
    border: none;
    font-size: 16px;
    line-height: 100%;
  }
}
</style>
