import calendar from './Calendar.vue'

(calendar as any).install = (Vue: any) => {
  Vue.component(calendar.name, calendar)
}

export default calendar