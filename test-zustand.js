import { create } from 'zustand/vanilla'

const store = create((set) => ({
  courses: [{id: 1, title: 'test'}],
  updateCourse: (id, data) => set(state => ({
    courses: state.courses.map(c => c.id === id ? {...c, ...data} : c)
  }))
}))

console.log('Before:', store.getState().courses)
store.getState().updateCourse(1, { title: 'updated test' })
console.log('After:', store.getState().courses)
