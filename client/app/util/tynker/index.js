const _callbacks = new WeakMap()

class TynkerState {
  constructor (state = {}) {
    _callbacks.set(this, [])
    this.state = { ...state }
  }

  setState (changes = {}) {
    let keys = Object.keys(this.state).concat(Object.keys(changes))
    keys = keys.filter((val, index, arr) => arr.indexOf(val) === index)

    const nextState = {}
    for (let key of keys) {
      if (changes[key] !== undefined) {
        nextState[key] = changes[key]
      }
      if (this.state.hasOwnProperty(key)) {
        if (nextState[key] === undefined) {
          nextState[key] = this.state[key]
        }
      }
    }

    if (!this.shouldStateUpdate || this.shouldStateUpdate(nextState)) {
      if (this.stateWillUpdate) this.stateWillUpdate(nextState)

      for (let key of Object.keys(nextState)) {
        if (this.state[key] !== nextState[key]) this.state[key] = nextState[key]
      }

      if (this.stateDidUpdate) this.stateDidUpdate(this.state)
      for (let callback of _callbacks.get(this)) {
        callback(this)
      }
    }
  }

  forceUpdate () {
    if (this.stateWillUpdate) this.stateWillUpdate(this.state)
    if (this.stateDidUpdate) this.stateDidUpdate(this.state)
    for (let callback of _callbacks.get(this)) {
      callback(this)
    }
  }

  listen (callback, context) {
    _callbacks.get(this).push(callback)
  }

  ignore (callback) {
    const callbacks = _callbacks.get(this)
    const index = callbacks.indexOf(callback)
    if (index > -1) {
      callbacks.splice(index, 1)
      _callbacks.set(this, callbacks)
    }
  }
}

export default TynkerState
