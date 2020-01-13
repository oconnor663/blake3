import { hash, createHash } from './';
import { expect } from 'chai';
import { inputs } from '../base/test-helpers';
import { ReadableStreamBuffer } from 'stream-buffers';

const toHex = (arr: Uint8Array) => Buffer.from(arr).toString('hex');

describe('node.js', () => {
  describe('encoding', () => {
    it('hashes a buffer', () => {
      expect(hash(Buffer.from(inputs.large.input), 'hex')).to.equal(inputs.large.hash);
    });

    it('hashes a string', () => {
      expect(hash(inputs.large.input, 'hex')).to.equal(inputs.large.hash);
    });

    it('hashes an arraybuffer', () => {
      expect(hash(Buffer.from(inputs.large.input).buffer, 'hex')).to.equal(inputs.large.hash);
    });
  });

  describe('memory-safety (#5)', () => {
    it('hash', () => {
      const hashA = hash('hello');
      const hashB = hash('goodbye');
      expect(toHex(hashA)).to.equal(
        'ea8f163db38682925e4491c5e58d4bb3506ef8c14eb78a86e908c5624a67200f',
      );
      expect(toHex(hashB)).to.equal(
        'f94a694227c5f31a07551908ad5fb252f5f0964030df5f2f200adedfae4d9b69',
      );
    });

    it('hasher', () => {
      const hasherA = createHash();
      const hasherB = createHash();
      hasherA.update('hel');
      hasherB.update('good');
      hasherA.update('lo');
      hasherB.update('bye');

      const hashA = hasherA.digest();
      const hashB = hasherB.digest();
      expect(toHex(hashA)).to.equal(
        'ea8f163db38682925e4491c5e58d4bb3506ef8c14eb78a86e908c5624a67200f',
      );
      expect(toHex(hashB)).to.equal(
        'f94a694227c5f31a07551908ad5fb252f5f0964030df5f2f200adedfae4d9b69',
      );
    });
  });

  describe('hash class', () => {
    it('digests', callback => {
      const buffer = new ReadableStreamBuffer();
      buffer.put(Buffer.from(inputs.large.input));
      buffer.stop();

      const hash = createHash();

      buffer.on('data', b => hash.update(b));
      buffer.on('end', () => {
        const actual = hash.digest();
        expect(toHex(actual)).to.equal(inputs.large.hash);
        callback();
      });
    });
  });
});