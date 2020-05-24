"use strict";

require("core-js/modules/web.url.to-json");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.transformOutgoingURIs = transformOutgoingURIs;
exports.transformIncomingURIs = transformIncomingURIs;
exports.transformAndReviveIncomingURIs = transformAndReviveIncomingURIs;
exports.DefaultURITransformer = exports.URITransformer = void 0;

var _uri = require("./uri");

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
function toJSON(uri) {
  return uri.toJSON();
}

class URITransformer {
  constructor(uriTransformer) {
    this._uriTransformer = uriTransformer;
  }

  transformIncoming(uri) {
    const result = this._uriTransformer.transformIncoming(uri);

    return result === uri ? uri : toJSON(_uri.URI.from(result));
  }

  transformOutgoing(uri) {
    const result = this._uriTransformer.transformOutgoing(uri);

    return result === uri ? uri : toJSON(_uri.URI.from(result));
  }

  transformOutgoingURI(uri) {
    const result = this._uriTransformer.transformOutgoing(uri);

    return result === uri ? uri : _uri.URI.from(result);
  }

  transformOutgoingScheme(scheme) {
    return this._uriTransformer.transformOutgoingScheme(scheme);
  }

}

exports.URITransformer = URITransformer;
const DefaultURITransformer = new class {
  transformIncoming(uri) {
    return uri;
  }

  transformOutgoing(uri) {
    return uri;
  }

  transformOutgoingURI(uri) {
    return uri;
  }

  transformOutgoingScheme(scheme) {
    return scheme;
  }

}();
exports.DefaultURITransformer = DefaultURITransformer;

function _transformOutgoingURIs(obj, transformer, depth) {
  if (!obj || depth > 200) {
    return null;
  }

  if (typeof obj === 'object') {
    if (obj instanceof _uri.URI) {
      return transformer.transformOutgoing(obj);
    } // walk object (or array)


    for (let key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);

        if (r !== null) {
          obj[key] = r;
        }
      }
    }
  }

  return null;
}

function transformOutgoingURIs(obj, transformer) {
  const result = _transformOutgoingURIs(obj, transformer, 0);

  if (result === null) {
    // no change
    return obj;
  }

  return result;
}

function _transformIncomingURIs(obj, transformer, revive, depth) {
  if (!obj || depth > 200) {
    return null;
  }

  if (typeof obj === 'object') {
    if (obj.$mid === 1) {
      return revive ? _uri.URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
    } // walk object (or array)


    for (let key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);

        if (r !== null) {
          obj[key] = r;
        }
      }
    }
  }

  return null;
}

function transformIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, false, 0);

  if (result === null) {
    // no change
    return obj;
  }

  return result;
}

function transformAndReviveIncomingURIs(obj, transformer) {
  const result = _transformIncomingURIs(obj, transformer, true, 0);

  if (result === null) {
    // no change
    return obj;
  }

  return result;
}