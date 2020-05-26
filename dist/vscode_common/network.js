"use strict";

require("core-js/modules/es.array.index-of");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteAuthorities = exports.Schemas = void 0;

var _uri = require("./uri");

var platform = _interopRequireWildcard(require("./platform"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let Schemas;
exports.Schemas = Schemas;

(function (_Schemas) {
  const inMemory = _Schemas.inMemory = 'inmemory';
  const vscode = _Schemas.vscode = 'vscode';
  const internal = _Schemas.internal = 'private';
  const walkThrough = _Schemas.walkThrough = 'walkThrough';
  const walkThroughSnippet = _Schemas.walkThroughSnippet = 'walkThroughSnippet';
  const http = _Schemas.http = 'http';
  const https = _Schemas.https = 'https';
  const file = _Schemas.file = 'file';
  const mailto = _Schemas.mailto = 'mailto';
  const untitled = _Schemas.untitled = 'untitled';
  const data = _Schemas.data = 'data';
  const command = _Schemas.command = 'command';
  const vscodeRemote = _Schemas.vscodeRemote = 'vscode-remote';
  const vscodeRemoteResource = _Schemas.vscodeRemoteResource = 'vscode-remote-resource';
  const userData = _Schemas.userData = 'vscode-userdata';
  const vscodeCustomEditor = _Schemas.vscodeCustomEditor = 'vscode-custom-editor';
  const vscodeSettings = _Schemas.vscodeSettings = 'vscode-settings';
  const webviewPanel = _Schemas.webviewPanel = 'webview-panel';
  const vscodeWebviewResource = _Schemas.vscodeWebviewResource = 'vscode-webview-resource';
})(Schemas || (exports.Schemas = Schemas = {}));

class RemoteAuthoritiesImpl {
  constructor() {
    _defineProperty(this, "_hosts", Object.create(null));

    _defineProperty(this, "_ports", Object.create(null));

    _defineProperty(this, "_connectionTokens", Object.create(null));

    _defineProperty(this, "_preferredWebSchema", 'http');

    _defineProperty(this, "_delegate", null);
  }

  setPreferredWebSchema(schema) {
    this._preferredWebSchema = schema;
  }

  setDelegate(delegate) {
    this._delegate = delegate;
  }

  set(authority, host, port) {
    this._hosts[authority] = host;
    this._ports[authority] = port;
  }

  setConnectionToken(authority, connectionToken) {
    this._connectionTokens[authority] = connectionToken;
  }

  rewrite(uri) {
    if (this._delegate) {
      return this._delegate(uri);
    }

    const authority = uri.authority;
    let host = this._hosts[authority];

    if (host && host.indexOf(':') !== -1) {
      host = `[${host}]`;
    }

    const port = this._ports[authority];
    const connectionToken = this._connectionTokens[authority];
    let query = `path=${encodeURIComponent(uri.path)}`;

    if (typeof connectionToken === 'string') {
      query += `&tkn=${encodeURIComponent(connectionToken)}`;
    }

    return _uri.URI.from({
      scheme: platform.isWeb ? this._preferredWebSchema : Schemas.vscodeRemoteResource,
      authority: `${host}:${port}`,
      path: `/vscode-remote-resource`,
      query
    });
  }

}

const RemoteAuthorities = new RemoteAuthoritiesImpl();
exports.RemoteAuthorities = RemoteAuthorities;