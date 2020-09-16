## vue-simple-mobile-calendar
* 基于Vue 2.x 开发的轻量，简洁的日历组件
* 可扩展性强，多种日期格式可选择

[![Build Status](https://travis-ci.org/smileTJC/vue-simple-mobile-calendar.svg?branch=master)](https://travis-ci.org/smileTJC/vue-simple-mobile-calendar)
### Demo
手机端查看或者PC浏览器自带手机模拟器查看效果更佳
[demo](https://smiletjc.github.io/vue-simple-mobile-calendar/dist/index.html)
### Install
```
npm install vue-simple-mobile-calendar --save
```

### Usage
```
//vue文件中引入
import calendar from 'vue-simple-mobile-calendar';
 components: {
    calendar
  }

  <calendar
     :show="show"
      type="range" // 日历类型：range: 日期区间, simple: 选择单个日期, 默认值:range
      // title="日期选择" 日历标题,默认值：选择日期
      // :monthNum="12"  日历显示的月份个数,默认值12
      // :isCricle="true"  日历选中日期样式，true: 圆形, false: 圆角矩形, 默认值：true
      // :controlDay="true"  是否开启控制可选天数，默认值: false
      // :limitDay="30"  开始控制可选天数的范围，controlDay为true时生效,默认值：30
      // :customColor="colorOptions" 自定义日历主题样式, 默认值是蓝色,详细参数看API
      // :customCheckText="customCheckText"  自定义选中日期区间提示文本,详细参数看API
      :defaultDate="defaultDate"  // 当前显示的日期，传入例: `new Date()` 或 `[new Date('2020/10/01'), new Date('2020/10/03')]`详细参数看API
      @confirm="backRangeCalendar"
      @cancel="show = false"
      >
  </calendar>

    // 返回的日期
  backRangeCalendar(item) {
    console.log(item)
    /**
     * type="simple", 日历类型为单个日期时返回的数据格式
     * 返回数据:
     * {
     *  selectDate: '2020/08/24',
     *  selectTime: 1598198400000,
     *  week: '今天'
     * }
     */
    // this.seledtedDate = item.selectDate
    // this.simpleDate = [item.selectTime]

   /**
     * type="range", 日历类型为日期区间时返回的数据格式
     * 返回数据:
     * {
     *  dayNum: 1,
     *  endDate: '2020/08/25',
     *  endTime: 1598284800000,
     *  endWeek: '明天'
     *  startDate: '2020/08/24',
     *  startTime: 1598198400000
     *  startWeek: '今天'
     * }
     */
    this.defaultDate = [item.startTime, item.endTime]  // 返回的选中日期赋值给传入日历组件的默认日期，再次点击日历时更新组件日期
    this.selectedRangeDate.startDate = item.startDate
    this.selectedRangeDate.endDate = item.endDate
    this.show = false
  }
```

### API
| 属性 | 说明 | 类型 | 默认值 | 必传 |
| ----------- | ----------- | ----------- | ----------- | ----------- |
| show | 是否显示日历 | boolean | 无 | 是 |
| type | 日历类型, `simple`为单个日期，`range`为日期区间 | string | range | 是 |
| defaultDate | 默认选中的日期, `type`为`range`时为数组，仅支持传入今天或今天之后的日期 | Date \| Date[] | 今天 | 否 |
| title | 自定义日历标题文本 | string | 选择日期 | 否 |
| monthNum | 显示的月份个数 | number| 12 | 否 |
| isCricle | 选中日期是否是圆形样式, `false`为圆角矩形 | boolean | true | 否 |
| themeColor| 自定义主题颜色(默认蓝色) | string | rgb(57,108,254) | 否 |
| comeOutColor | `type`为`range`时，自定义选中的日期范围之间的颜色(默认淡蓝色) | string | rgba(57,108,254,0.15) | 否 |
| customCheckText | `type`为`range`时，自定义选中日期区间提示文本 | string[] | ['开始', '结束'] | 否 |
| controlDay | 是否开启控制可选择的天数 | boolean | false | 否 |
| limitDay | 开启控制后可选择的天数,需小于展示的总天数, `controlDay`为`true`时生效 | number | 30| 否 |
| @cancel | 关闭日历事件，点击关闭图标或者遮罩可触发 | Function | - | - |
| @confirm | 日期选择完成后，点击确定按钮可触发,回调参数看上方代码注释 | Function | - | - |

### other
* `example`文件夹下的`App.vue` 有demo可以参考
*  🎉 觉得好用给一个 star 哦~~ 🎉
