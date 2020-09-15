<template>
  <div id="app">
    <div class="demo-box">
       <h3 class="demo-title">基础用法</h3>
       <ul>
         <li class="demo-item" @click="show = true">
           <div>选择单个日期</div>
           <div>{{seledtedDate}}</div>
         </li>
         <li class="demo-item" @click="showRange = true">
           <div>选择日期区间</div>
           <div>{{selectedRangeDate.startDate + '--' + selectedRangeDate.endDate}}</div>
         </li>
          <li class="demo-item" @click="showDefaultDate = true">
           <div>传入默认日期(小于今天日期不生效)</div>
           <div v-show="backDefaultDate.length > 0">{{backDefaultDate[0] + '--' + backDefaultDate[1]}}</div>
         </li>
       </ul>
       <h3 class="demo-title">自定义日历</h3>
       <ul>
         <li class="demo-item" @click="customTitle = true">
           <div>自定义标题(圆角矩形)</div>
           <div>{{titleDate}}</div>
         </li>
        <li class="demo-item" @click="showMonthNum = true">
           <div>自定义显示月份个数</div>
           <div>{{monthDate}}</div>
         </li>
         <li class="demo-item" @click="showCustomColor = true">
           <div>自定义颜色</div>
           <div v-show="themeColorDate.length > 0">{{themeColorDate[0] + '--' + themeColorDate[1]}}</div>
         </li>
         <li class="demo-item" @click="showCustomCheckText = true">
           <div>自定义选中文本</div>
           <div v-show="checkTextDate.length > 0">{{checkTextDate[0] + '--' + checkTextDate[1]}}</div>
         </li>
          <li class="demo-item" @click="showControlDay = true">
           <div>控制可选天数</div>
           <div v-show="controlDayDate.length > 0">{{controlDayDate[0] + '--' + controlDayDate[1]}}</div>
         </li>
       </ul>
     </div>
     <!-- 单个日期 -->
    <calendar :show="show" type="simple" @confirm="backCalendar" @cancel="show = false"></calendar>
    <!-- 日期区间 -->
    <calendar :show="showRange" type="range" @confirm="backRangeCalendar" @cancel="showRange = false"></calendar>
    <!-- 传入默认日期 -->
    <calendar :show="showDefaultDate" :defaultDate="defaultDate" type="range" @confirm="backDefaultCalendar" @cancel="showDefaultDate = false"></calendar>
    <!-- 显示的月份个数 -->
    <calendar :show="showMonthNum" type="simple" :monthNum="2" @confirm="backMonthCalendar" @cancel="showMonthNum = false"></calendar>
    <!-- 自定义标题 -->
    <calendar :show="customTitle" type="simple" title="打卡日期" :isCricle="isCricle" @confirm="backTitleCalendar" @cancel="customTitle = false"></calendar>
    <!-- 自定义颜色 -->
    <calendar :show="showCustomColor" type="range" :themeColor="themeColor" :comeOutColor="comeOutColor"  @confirm="backCustomColorCalendar" @cancel="showCustomColor = false"></calendar>
    <!-- 自定义选中文本 -->
     <calendar :show="showCustomCheckText" type="range" :isCricle="isCricle" :customCheckText="customCheckText"   @confirm="backCheckTextCalendar" @cancel="showCustomCheckText = false"></calendar>
     <!-- 控制可选天数 -->
    <calendar :show="showControlDay" type="range" :controlDay="true" :limitDay="30"   @confirm="backControlCalendar" @cancel="showControlDay = false"></calendar>
    <!-- <router-view/> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import calendar from '../src/index'
@Component({
  components: {
    calendar
  }
})
export default class App extends Vue {
  private show: boolean = false
  private showRange: boolean = false
  private showDefaultDate: boolean = false
  private showMonthNum: boolean = false
  private customTitle: boolean = false
  private showCustomColor: boolean = false
  private showCustomCheckText: boolean = false
  private showControlDay: boolean = false
  private isCricle: boolean = false // 默认是true:圆形; false: 圆角矩形
  private defaultDate = [new Date('2020/10/01'), new Date('2020/10/03')]
  private seledtedDate = ''
  private titleDate = ''
  private monthDate = ''
  private selectedRangeDate = {
    startDate: '',
    endDate: ''
  }
  private backDefaultDate: string[] = ['2020/10/01', '2020/10/03']
  private themeColorDate: string[] = []
  private themeColor: string = 'rgba(7,193,96, 1)'
  private comeOutColor: string = 'rgba(7,193,96, 0.15)'
  private customCheckText = ['入住', '离店']
  private checkTextDate: string[] = []
  private controlDayDate: string[] = []
  // 单个日期
  backCalendar(item: any) {
    // console.log(item)
    this.seledtedDate = item.selectDate
    this.show = false
  }
  // 日期区间
  backRangeCalendar(item: any) {
    // console.log(item)
    this.selectedRangeDate.startDate = item.startDate
    this.selectedRangeDate.endDate = item.endDate
    this.showRange = false
  }
  // 传入默认日期
  backDefaultCalendar(item: any) {
    // console.log(item)
    this.defaultDate = [item.startTime, item.endTime] // 重新赋值传入选中的日期，保证再次进入日历显示选中的日期
    this.backDefaultDate = [item.startDate, item.endDate]
    this.showDefaultDate = false
  }
  // 自定义标题
  backTitleCalendar(item: any) {
    // console.log(item)
    this.titleDate = item.selectDate
    this.customTitle = false
  }
  // 自定义显示月份数量
  backMonthCalendar(item: any) {
    //  console.log(item)
    this.monthDate = item.selectDate
    this.showMonthNum = false
  }
  // 自定义颜色
  backCustomColorCalendar(item: any) {
    // console.log(item)
    this.themeColorDate = [item.startDate, item.endDate]
    this.showCustomColor = false
  }
  // 自定义选中日期区间文本
  backCheckTextCalendar(item: any) {
    // console.log(item)
    this.checkTextDate = [item.startDate, item.endDate]
    this.showCustomCheckText = false
  }
  // 控制可选择天数
  backControlCalendar(item: any) {
    // console.log(item)
    this.controlDayDate = [item.startDate, item.endDate]
    this.showControlDay = false
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: #F7F8FA;
  height: 100vh;
}

.demo-box {
  padding: 0 10px 20px;
  ul {
    padding: 0%;
    margin: 0;
    border-radius: 20px;
  }
}

.demo-title {
  color: #6C6C6C;
  text-align: left;
  font-size: 16px;
  font-weight: normal;
  padding: 20px 0;
  margin: 0;
}

.demo-item {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 10px 20px;
  border-bottom: 1px solid #F7F8FA;
}
</style>
