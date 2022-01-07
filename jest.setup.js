import Enzyme, { shallow, mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

// Import the polyfill for testing.
// NOTE that the polyfill is NOT included in the bundle
require('intersection-observer')

Enzyme.configure({ adapter: new Adapter() })

global.shallow = shallow
global.mount = mount

global.sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })
