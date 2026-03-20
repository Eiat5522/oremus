class MockAsset {
  constructor({ name = '', type = 'glb', hash = null, uri, width, height }) {
    this.name = name;
    this.type = type;
    this.hash = hash;
    this.uri = uri;
    this.width = width;
    this.height = height;
    this.localUri = uri;
    this.downloaded = false;
    this.downloading = false;
    this._downloadCallbacks = [];
  }

  async downloadAsync() {
    this.localUri = this.localUri ?? this.uri;
    this.downloaded = true;
    return this;
  }

  static fromModule(virtualAssetModule) {
    if (
      virtualAssetModule &&
      typeof virtualAssetModule === 'object' &&
      'uri' in virtualAssetModule &&
      typeof virtualAssetModule.uri === 'string'
    ) {
      const extensionMatch = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(virtualAssetModule.uri);
      return new MockAsset({
        name: '',
        type: extensionMatch ? extensionMatch[1] : 'glb',
        hash: null,
        uri: virtualAssetModule.uri,
        width: virtualAssetModule.width,
        height: virtualAssetModule.height,
      });
    }

    if (typeof virtualAssetModule === 'string') {
      return new MockAsset({
        name: '',
        type: 'glb',
        hash: null,
        uri: virtualAssetModule,
      });
    }

    return new MockAsset({
      name: '',
      type: 'glb',
      hash: null,
      uri: `mock://asset/${String(virtualAssetModule)}.glb`,
    });
  }

  static fromURI(uri) {
    return new MockAsset({
      name: '',
      type: /\.([a-z0-9]+)(?:\?|#|$)/i.exec(uri)?.[1] ?? 'glb',
      hash: null,
      uri,
    });
  }

  static loadAsync(moduleId) {
    const moduleIds = Array.isArray(moduleId) ? moduleId : [moduleId];
    return Promise.all(moduleIds.map((entry) => MockAsset.fromModule(entry).downloadAsync()));
  }
}

module.exports = { Asset: MockAsset };
