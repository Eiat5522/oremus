const { Group } = require('three');

class GLTFLoader {
  async loadAsync() {
    return {
      scene: new Group(),
    };
  }
}

module.exports = { GLTFLoader };
