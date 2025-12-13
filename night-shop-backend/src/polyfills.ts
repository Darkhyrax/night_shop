// Polyfill para crypto en Node.js Alpine
import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
    globalThis.crypto = webcrypto as any;
}
