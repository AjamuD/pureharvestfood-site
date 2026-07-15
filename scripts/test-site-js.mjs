import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(join(root, 'assets', 'js', 'site.js'), 'utf8');
const handlers = {};
let valid = true;
let opened = null;
let prevented = false;

const form = {
  dataset: { message: 'Hello Pure Harvest, I would like to make an enquiry.' },
  elements: { namedItem: (key) => ({ dataset: { waLabel: key === 'name' ? 'Name' : 'Message' } }) },
  reportValidity: () => valid,
  addEventListener: (event, handler) => { handlers[event] = handler; },
};

const context = {
  document: {
    querySelector: () => null,
    getElementById: () => null,
    querySelectorAll: (selector) => selector === '.whatsapp-form' ? [form] : [],
  },
  FormData: class {
    constructor() { this.entries = [['name', 'Test Customer'], ['message', 'Please share current products']]; }
    forEach(callback) { this.entries.forEach(([key, value]) => callback(value, key)); }
  },
  window: { open: (...args) => { opened = args; } },
  encodeURIComponent,
};

vm.runInNewContext(source, context);
if (typeof handlers.submit !== 'function') throw new Error('WhatsApp form submit handler was not registered');

await handlers.submit({ preventDefault: () => { prevented = true; } });
if (!prevented) throw new Error('Form submission was not intercepted');
if (!opened?.[0]?.startsWith('https://wa.me/18683618990?text=')) throw new Error('WhatsApp URL is incorrect');
const message = decodeURIComponent(opened[0].split('?text=')[1]);
for (const expected of ['Hello Pure Harvest', 'Name: Test Customer', 'Message: Please share current products', 'current prices, availability and next steps']) {
  if (!message.includes(expected)) throw new Error(`WhatsApp message is missing: ${expected}`);
}

opened = null;
valid = false;
await handlers.submit({ preventDefault: () => {} });
if (opened) throw new Error('Invalid form opened WhatsApp');

console.log('WhatsApp form behavior passed without opening an external service.');
