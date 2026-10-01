// Potion palettes, one per level (cycled). Order matters: a level with n colors uses the first n. Check with: node tools/check_palettes.js
const PALETTES = [
  { zh: '棉花糖', en: 'Cotton Candy', c: ['#FF8CC6', '#7FB2E5', '#8CE3EA', '#8A63D2', '#B69CE6', '#FF5FA2', '#4E7FE0', '#FFC1DC', '#46C9C2'] },
  { zh: '美人魚', en: 'Mermaid', c: ['#3FD8C4', '#7A8CFF', '#C77DFF', '#52B7FF', '#FF9ECF', '#9BF6D9', '#5F66F0', '#FFD6A5', '#1FA79B'] },
  { zh: '雪酪', en: 'Sherbet', c: ['#FF8F80', '#FFE17D', '#FF77A9', '#8FD3FF', '#B9E58A', '#C59BFF', '#FFBE76', '#FFB8D6', '#6FA8FF'] },
  { zh: '星雲', en: 'Nebula', c: ['#FF4FD8', '#6C5CFF', '#3BC9FF', '#FF8A5C', '#A0FFD8', '#B84DFF', '#FFD166', '#FF9EE8', '#4D8BFF'] },
  { zh: '蜜桃汽水', en: 'Peach Soda', c: ['#FFA69E', '#7DDBD0', '#FAD06C', '#FF7EB3', '#9CB9FF', '#C3E88D', '#E28BFF', '#6F8DF0', '#3FB8A8'] },
  { zh: '薰衣草', en: 'Lavender', c: ['#B28DFF', '#85E3FF', '#FFB5E8', '#6F5BD6', '#AFF8DB', '#FF7FD1', '#6EA8FF', '#FFD0A8', '#9DE89A'] },
  { zh: '熱帶', en: 'Tropical', c: ['#FF6B9E', '#FFB84D', '#3DDC97', '#22C3E6', '#9B6BFF', '#FFE45E', '#FF8A65', '#4D7CFF', '#C2F970'] },
  { zh: '莓果', en: 'Berry', c: ['#E0457B', '#8E44D9', '#6FC3FF', '#FF9FC0', '#C39BFF', '#4A6CF7', '#FF7A6B', '#7FE3D8', '#F4B8FF'] },
];
if (typeof module !== 'undefined') module.exports = PALETTES;
