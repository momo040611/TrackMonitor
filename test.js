const user = {
  name: '小江',
  age: 20,
}

const key = 'name' //反射
console.log(Reflect.get(user, key))
Reflect.set(user, 'gender', 'man')
Reflect.has(user, 'age')
Reflect.deleteProperty(user, 'age')

let obj = {}
Reflect.defineProperty(obj, 'data', { ...user })
