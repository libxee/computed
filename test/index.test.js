
const _ = require('./utils')
const computedBehavior = require('../src/index')
const behaviorA = require('./tools/behaviorA')

test('watch basics', () => {
  let funcTriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}</view>',
    behaviors: [computedBehavior],
    properties: {
      a: {
        type: Number,
        value: 1,
      }
    },
    data: {
      b: 2,
      c: 3,
    },
    watch: {
      'a, b': function (a, b) {
        funcTriggeringCount++
        this.setData({
          c: a + b
        })
      }
    },
  })
  const component = _.render(componentId)

  expect(_.match(component.dom, '<wx-view>1+2=3</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(0)

  component.setData({a: 10})
  expect(_.match(component.dom, '<wx-view>10+2=12</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({b: 20})
  expect(_.match(component.dom, '<wx-view>10+20=30</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(2)

  component.setData({a: 100, b: 200})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(3)

  component.setData({c: -1})
  expect(_.match(component.dom, '<wx-view>100+200=-1</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(3)
})

test('watch property changes', () => {
  let funcTriggeringCount = 0
  const innerComponentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}</view>',
    behaviors: [computedBehavior],
    properties: {
      a: {
        type: Number,
        value: -1,
      },
      b: String,
    },
    watch: {
      'a, b': function (a, b) {
        funcTriggeringCount++
        this.setData({
          c: a + Number(b || 0)
        })
      }
    },
  })
  const outerComponentId = _.load({
    usingComponents: {
      inner: innerComponentId,
    },
    data: {
      a: 1,
      b: 2,
    },
    template: '<inner a="{{a}}" b="{{b}}"></inner>',
  })
  const component = _.render(outerComponentId)

  expect(_.match(component.dom, '<inner><wx-view>1+2=3</wx-view></inner>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({a: 100, b: 200})
  expect(_.match(component.dom, '<inner><wx-view>100+200=300</wx-view></inner>')).toBe(true)
  expect(funcTriggeringCount).toBe(2)
})

test('watch data paths', () => {
  let func1TriggeringCount = 0
  let func2TriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a.d}}+{{b[0]}}={{c}}</view>',
    behaviors: [computedBehavior],
    data: {
      a: {d: 1},
      b: [2],
      c: 3,
    },
    watch: {
      a() {
        func1TriggeringCount++
      },
      ' a.d  ,b[0] ': function (ad, b0) {
        func2TriggeringCount++
        this.setData({
          c: ad + b0
        })
      }
    },
  })
  const component = _.render(componentId)

  expect(_.match(component.dom, '<wx-view>1+2=3</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(0)
  expect(func2TriggeringCount).toBe(0)

  component.setData({a: {d: 10}})
  expect(_.match(component.dom, '<wx-view>10+2=12</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(1)

  component.setData({b: [20]})
  expect(_.match(component.dom, '<wx-view>10+20=30</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(2)

  component.setData({'a.d': 100})
  expect(_.match(component.dom, '<wx-view>100+20=120</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(3)

  component.setData({'b[0]': 200})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(4)

  component.setData({'a.e': -1})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(4)

  component.setData({'b[2]': -1})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(4)
})

test('watch data deep comparison', () => {
  let func1TriggeringCount = 0
  let func2TriggeringCount = 0
  let func3TriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{obj.a}}+{{obj.b}}={{c}}</view>',
    behaviors: [computedBehavior],
    data: {
      obj: {
        a: 1,
        b: 2,
      },
      c: 3,
    },
    watch: {
      obj() {
        func1TriggeringCount++
      },
      'obj.b': function () {
        func2TriggeringCount++
      },
      'obj.**': function (obj) {
        func3TriggeringCount++
        this.setData({
          c: obj.a + obj.b
        })
      }
    },
  })
  const component = _.render(componentId)

  expect(_.match(component.dom, '<wx-view>1+2=3</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(0)
  expect(func2TriggeringCount).toBe(0)
  expect(func3TriggeringCount).toBe(0)

  component.setData({obj: {a: 10, b: 2}})
  expect(_.match(component.dom, '<wx-view>10+2=12</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(0)
  expect(func3TriggeringCount).toBe(1)

  component.setData({'obj.b': 2})
  expect(_.match(component.dom, '<wx-view>10+2=12</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(0)
  expect(func3TriggeringCount).toBe(1)

  component.setData({'obj.a': 100})
  expect(_.match(component.dom, '<wx-view>100+2=102</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(0)
  expect(func3TriggeringCount).toBe(2)
})

test('computed basics', () => {
  let func1TriggeringCount = 0
  let func2TriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}, {{a}}*2={{d}}</view>',
    behaviors: [computedBehavior],
    properties: {
      a: {
        type: Number,
        value: 1,
      },
      nullProp: null,
    },
    data: {
      b: 2,
    },
    computed: {
      c(data) {
        expect(data.nullProp).toBe(null)
        func1TriggeringCount++
        return data.a + data.b
      },
      d(data) {
        func2TriggeringCount++
        return data.a * 2
      }
    }
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view>1+2=3, 1*2=2</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(1)

  component.setData({a: 10})
  expect(_.match(component.dom, '<wx-view>10+2=12, 10*2=20</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(2)
  expect(func2TriggeringCount).toBe(2)

  component.setData({b: 20})
  expect(_.match(component.dom, '<wx-view>10+20=30, 10*2=20</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(3)
  expect(func2TriggeringCount).toBe(2)

  component.setData({a: 100, b: 200})
  expect(_.match(component.dom, '<wx-view>100+200=300, 100*2=200</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(4)
  expect(func2TriggeringCount).toBe(3)
})

test('computed property changes', () => {
  let funcTriggeringCount = 0
  const innerComponentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}</view>',
    behaviors: [computedBehavior],
    properties: {
      a: {
        type: Number,
        value: -1,
      },
      b: String,
    },
    computed: {
      c(data) {
        funcTriggeringCount++
        return data.a + Number(data.b)
      }
    },
  })
  const outerComponentId = _.load({
    usingComponents: {
      inner: innerComponentId,
    },
    data: {
      a: 1,
      b: 2,
    },
    template: '<inner a="{{a}}" b="{{b}}"></inner>',
  })
  const component = _.render(outerComponentId)
  _.exparser.Element.pretendAttached(component._exparserNode)

  expect(_.match(component.dom, '<inner><wx-view>1+2=3</wx-view></inner>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({a: 100, b: 200})
  expect(_.match(component.dom, '<inner><wx-view>100+200=300</wx-view></inner>')).toBe(true)
  expect(funcTriggeringCount).toBe(2)
})

test('computed chains', () => {
  let func1TriggeringCount = 0
  let func2TriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}, {{a}}+{{c}}={{d}}</view>',
    behaviors: [computedBehavior],
    data: {
      a: 1,
      b: 2,
    },
    computed: {
      c(data) {
        func1TriggeringCount++
        return data.a + data.b
      },
      d(data) {
        func2TriggeringCount++
        return data.a + data.c
      }
    }
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view>1+2=3, 1+3=4</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(1)
  expect(func2TriggeringCount).toBe(2)

  component.setData({a: 10})
  expect(_.match(component.dom, '<wx-view>10+2=12, 10+12=22</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(2)
  expect(func2TriggeringCount).toBe(3)

  component.setData({b: 20})
  expect(_.match(component.dom, '<wx-view>10+20=30, 10+30=40</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(3)
  expect(func2TriggeringCount).toBe(4)

  component.setData({a: 100, b: 200})
  expect(_.match(component.dom, '<wx-view>100+200=300, 100+300=400</wx-view>')).toBe(true)
  expect(func1TriggeringCount).toBe(4)
  expect(func2TriggeringCount).toBe(5)
})

test('computed conditions', () => {
  let funcTriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a}}, {{b}}, {{c}}, {{d}}</view>',
    behaviors: [computedBehavior],
    data: {
      a: 0,
      b: 1,
      c: 2,
    },
    computed: {
      d(data) {
        funcTriggeringCount++
        return data.a ? data.b : data.c
      }
    }
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')

  expect(_.match(component.dom, '<wx-view>0, 1, 2, 2</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({b: 10})
  expect(_.match(component.dom, '<wx-view>0, 10, 2, 2</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({c: 20})
  expect(_.match(component.dom, '<wx-view>0, 10, 20, 20</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(2)

  component.setData({a: -1})
  expect(_.match(component.dom, '<wx-view>-1, 10, 20, 10</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(3)

  component.setData({b: 100})
  expect(_.match(component.dom, '<wx-view>-1, 100, 20, 100</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(4)

  component.setData({c: 200})
  expect(_.match(component.dom, '<wx-view>-1, 100, 200, 100</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(4)
})

test('computed data paths', () => {
  let funcTriggeringCount = 0
  const componentId = _.load({
    template: '<view>{{a.d}}+{{b[0]}}={{c[1].f}}</view>',
    behaviors: [computedBehavior],
    data: {
      a: {d: 1},
      b: [2],
    },
    computed: {
      'c[1]': function (data) {
        funcTriggeringCount++
        return {
          f: data.a.d + data.b[0]
        }
      }
    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')

  expect(_.match(component.dom, '<wx-view>1+2=3</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(1)

  component.setData({a: {d: 10}})
  expect(_.match(component.dom, '<wx-view>10+2=12</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(2)

  component.setData({b: [20]})
  expect(_.match(component.dom, '<wx-view>10+20=30</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(3)

  component.setData({'a.d': 100})
  expect(_.match(component.dom, '<wx-view>100+20=120</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(4)

  component.setData({'b[0]': 200})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(5)

  component.setData({'a.e': -1})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(5)

  component.setData({'b[2]': -1})
  expect(_.match(component.dom, '<wx-view>100+200=300</wx-view>')).toBe(true)
  expect(funcTriggeringCount).toBe(5)
})

test('computed array read operations', () => {
  const componentId = _.load({
    template: '<view>{{r}}</view>',
    behaviors: [computedBehavior],
    data: {
      a: ['a', 'b', 'c'],
    },
    computed: {
      r(data) {
        const oriArr = ['a', 'b', 'c']
        expect(data.a.filter((item, index) => {
          expect(item).toBe(oriArr[index])
          return true
        }).join()).toBe('a,b,c')
        data.a.forEach((item, index) => {
          expect(item).toBe(oriArr[index])
        })
        expect(data.a.includes('b')).toBe(true)
        expect(data.a.indexOf('b')).toBe(1)
        expect(data.a.indexOf('b')).toBe(1)
        expect(data.a.map((item, index) => {
          expect(item).toBe(oriArr[index])
          return item + '1'
        }).join()).toBe('a1,b1,c1')
        expect(data.a.reduce((res, item, index) => {
          expect(item).toBe(oriArr[index])
          return res + item
        }, '')).toBe('abc')
        return ''
      }
    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view></wx-view>')).toBe(true)
})

test('computed object tracer', () => {
  const componentId = _.load({
    template: '<view>{{newArr[0] + newArr[1]}}</view><view>{{newObj.f0 + newObj.f1}}</view>',
    behaviors: [computedBehavior],
    data: {
      arr: [1, 2],
      obj: {
        f0: 10,
        f1: 20,
      }
    },
    computed: {
      newArr(data) {
        return data.arr
      },
      newObj(data) {
        return data.obj
      },
    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')

  expect(_.match(component.dom, '<wx-view>3</wx-view><wx-view>30</wx-view>')).toBe(true)
})

test('computed behaviors data', () => {
  const componentId = _.load({
    template: '<view>{{a}}+{{b}}={{c}}</view>',
    behaviors: [behaviorA, computedBehavior],
    data: {
      a: 1
    },
    computed: {
      c(data) {
        return data.a + data.b
      },

    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view>1+2=3</wx-view>')).toBe(true)
})


test('computed behaviors data deep comparison', () => {
  const componentId = _.load({
    template: '<view>{{a}}+{{c.d}}+{{c.e[0]}}={{f}}</view>',
    behaviors: [behaviorA, computedBehavior],
    data: {
      a: 1
    },
    computed: {
      f(data) {
        return data.a + data.c.d + data.c.e[0]
      },

    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view>1+3+1=5</wx-view>')).toBe(true)
})

test('computed behavior lifetimes', () => {
  const componentId = _.load({
    template: '<view>{{a}}+{{attachedData}}={{g}}</view>',
    behaviors: [behaviorA, computedBehavior],
    data: {
      a: 1
    },
    computed: {
      g(data) {
        return data.a + data.attachedData
      },

    },
  })
  const component = _.render(componentId)
  component.triggerLifeTime('attached')
  expect(_.match(component.dom, '<wx-view>1+10=11</wx-view>')).toBe(true)
})

