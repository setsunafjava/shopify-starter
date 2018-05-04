import React from 'react'

const _update = new WeakMap()

const withState = (stores = {}) => (Comp) => {
  class HOC extends React.Component {
      static defaultProps = {...Comp.defaultProps};
      static propTypes = {...Comp.propTypes};
      static contextTypes = {...Comp.contextTypes};

      static displayName = `${Comp.displayName || Comp.name || 'Component'}${Object.keys(stores).map(store => `[${store}]`)}`;

      constructor (props) {
        super(props)
        this.state = stores
        _update.set(this, () => { this.setState(stores) })
      }

      componentWillMount () {
        for (let store in stores) {
          if (stores.hasOwnProperty(store)) {
            stores[store].listen(_update.get(this))
          }
        }
      }

      componentWillUnmount () {
        for (let store in stores) {
          if (stores.hasOwnProperty(store)) {
            stores[store].ignore(_update.get(this))
          }
        }
      }

      render () {
        return (
          <Comp {...this.state} {...this.props} >
            {this.props.children}
          </Comp>
        )
      }
  }

  return HOC
}

export default withState
