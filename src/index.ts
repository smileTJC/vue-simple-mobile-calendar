import Calendar from './components/Calendar.vue'

const components = [Calendar]

const install = (Vue: any) => {
  if ((install as any).installed) return
  (install as any).installed = true
  components.map(component => {
    Vue.component(component.name, component)
  })
}

if (typeof window !== 'undefined' && (window as any).Vue) {
  install((window as any).Vue)
}

export default Calendar