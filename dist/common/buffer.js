"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.typed-array.uint8-array");

require("core-js/modules/es.typed-array.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readUInt16LE = readUInt16LE;
exports.writeUInt16LE = writeUInt16LE;
exports.readUInt32BE = readUInt32BE;
exports.writeUInt32BE = writeUInt32BE;
exports.readUInt32LE = readUInt32LE;
exports.writeUInt32LE = writeUInt32LE;
exports.readUInt8 = readUInt8;
exports.writeUInt8 = writeUInt8;
exports.readableToBuffer = readableToBuffer;
exports.bufferToReadable = bufferToReadable;
exports.streamToBuffer = streamToBuffer;
exports.bufferToStream = bufferToStream;
exports.streamToBufferReadableStream = streamToBufferReadableStream;
exports.newWriteableBufferStream = newWriteableBufferStream;
exports.VSBuffer = void 0;

var strings = _interopRequireWildcard(require("./strings"));

var streams = _interopRequireWildcard(require("./stream"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const hasBuffer = typeof Buffer !== 'undefined';
const hasTextEncoder = typeof TextEncoder !== 'undefined';
const hasTextDecoder = typeof TextDecoder !== 'undefined';
let textEncoder;
let textDecoder;

class VSBuffer {
  static alloc(byteLength) {
    if (hasBuffer) {
      return new VSBuffer(Buffer.allocUnsafe(byteLength));
    } else {
      return new VSBuffer(new Uint8Array(byteLength));
    }
  }

  static wrap(actual) {
    if (hasBuffer && !Buffer.isBuffer(actual)) {
      // https://nodejs.org/dist/latest-v10.x/docs/api/buffer.html#buffer_class_method_buffer_from_arraybuffer_byteoffset_length
      // Create a zero-copy Buffer wrapper around the ArrayBuffer pointed to by the Uint8Array
      actual = Buffer.from(actual.buffer, actual.byteOffset, actual.byteLength);
    }

    return new VSBuffer(actual);
  }

  static fromString(source) {
    if (hasBuffer) {
      return new VSBuffer(Buffer.from(source));
    } else if (hasTextEncoder) {
      if (!textEncoder) {
        textEncoder = new TextEncoder();
      }

      return new VSBuffer(textEncoder.encode(source));
    } else {
      return new VSBuffer(strings.encodeUTF8(source));
    }
  }

  static concat(buffers, totalLength) {
    if (typeof totalLength === 'undefined') {
      totalLength = 0;

      for (let i = 0, len = buffers.length; i < len; i++) {
        totalLength += buffers[i].byteLength;
      }
    }

    const ret = VSBuffer.alloc(totalLength);
    let offset = 0;

    for (let i = 0, len = buffers.length; i < len; i++) {
      const element = buffers[i];
      ret.set(element, offset);
      offset += element.byteLength;
    }

    return ret;
  }

  constructor(buffer) {
    this.buffer = buffer;
    this.byteLength = this.buffer.byteLength;
  }

  toString() {
    if (hasBuffer) {
      return this.buffer.toString();
    } else if (hasTextDecoder) {
      if (!textDecoder) {
        textDecoder = new TextDecoder();
      }

      return textDecoder.decode(this.buffer);
    } else {
      return strings.decodeUTF8(this.buffer);
    }
  }

  slice(start, end) {
    // IMPORTANT: use subarray instead of slice because TypedArray#slice
    // creates shallow copy and NodeBuffer#slice doesn't. The use of subarray
    // ensures the same, performant, behaviour.
    return new VSBuffer(this.buffer.subarray(start
    /*bad lib.d.ts*/
    , end));
  }

  set(array, offset) {
    if (array instanceof VSBuffer) {
      this.buffer.set(array.buffer, offset);
    } else {
      this.buffer.set(array, offset);
    }
  }

  readUInt32BE(offset) {
    return readUInt32BE(this.buffer, offset);
  }

  writeUInt32BE(value, offset) {
    writeUInt32BE(this.buffer, value, offset);
  }

  readUInt32LE(offset) {
    return readUInt32LE(this.buffer, offset);
  }

  writeUInt32LE(value, offset) {
    writeUInt32LE(this.buffer, value, offset);
  }

  readUInt8(offset) {
    return readUInt8(this.buffer, offset);
  }

  writeUInt8(value, offset) {
    writeUInt8(this.buffer, value, offset);
  }

}

exports.VSBuffer = VSBuffer;

function readUInt16LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0;
}

function writeUInt16LE(destination, value, offset) {
  destination[offset + 0] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 1] = value & 0b11111111;
}

function readUInt32BE(source, offset) {
  return source[offset] * Math.pow(2, 24) + source[offset + 1] * Math.pow(2, 16) + source[offset + 2] * Math.pow(2, 8) + source[offset + 3];
}

function writeUInt32BE(destination, value, offset) {
  destination[offset + 3] = value;
  value = value >>> 8;
  destination[offset + 2] = value;
  value = value >>> 8;
  destination[offset + 1] = value;
  value = value >>> 8;
  destination[offset] = value;
}

function readUInt32LE(source, offset) {
  return source[offset + 0] << 0 >>> 0 | source[offset + 1] << 8 >>> 0 | source[offset + 2] << 16 >>> 0 | source[offset + 3] << 24 >>> 0;
}

function writeUInt32LE(destination, value, offset) {
  destination[offset + 0] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 1] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 2] = value & 0b11111111;
  value = value >>> 8;
  destination[offset + 3] = value & 0b11111111;
}

function readUInt8(source, offset) {
  return source[offset];
}

function writeUInt8(destination, value, offset) {
  destination[offset] = value;
}

function readableToBuffer(readable) {
  return streams.consumeReadable(readable, chunks => VSBuffer.concat(chunks));
}

function bufferToReadable(buffer) {
  return streams.toReadable(buffer);
}

function streamToBuffer(stream) {
  return streams.consumeStream(stream, chunks => VSBuffer.concat(chunks));
}

function bufferToStream(buffer) {
  return streams.toStream(buffer, chunks => VSBuffer.concat(chunks));
}

function streamToBufferReadableStream(stream) {
  return streams.transform(stream, {
    data: _data => typeof _data === 'string' ? VSBuffer.fromString(_data) : VSBuffer.wrap(_data)
  }, chunks => VSBuffer.concat(chunks));
}

function newWriteableBufferStream() {
  return streams.newWriteableStream(chunks => VSBuffer.concat(chunks));
}