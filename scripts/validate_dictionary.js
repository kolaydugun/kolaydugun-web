import { dictionary } from '../src/locales/dictionary.js';

console.log('Dictionary loaded successfully.');
console.log('Keys in dictionary:', Object.keys(dictionary));

if (dictionary.weddingWebsite) {
    console.log('weddingWebsite keys:', Object.keys(dictionary.weddingWebsite));
} else {
    console.error('weddingWebsite key missing!');
}

if (dictionary.nav) {
    console.log('nav keys:', Object.keys(dictionary.nav));
} else {
    console.error('nav key missing!');
}
