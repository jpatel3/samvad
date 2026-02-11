import type { Section } from '../types';

export const prakarans: Section[] = [
  {
    index: 1,
    name: 'Gadhada I',
    nameGu: 'ગઢડા પ્રથમ',
    nameHi: 'गढ़डा प्रथम',
    totalItems: 78,
    range: [1, 78],
  },
  {
    index: 2,
    name: 'Sarangpur',
    nameGu: 'સારંગપુર',
    nameHi: 'सारंगपुर',
    totalItems: 18,
    range: [79, 96],
  },
  {
    index: 3,
    name: 'Kariyani',
    nameGu: 'કારિયાણી',
    nameHi: 'कारियाणी',
    totalItems: 12,
    range: [97, 108],
  },
  {
    index: 4,
    name: 'Loya',
    nameGu: 'લોયા',
    nameHi: 'लोया',
    totalItems: 18,
    range: [109, 126],
  },
  {
    index: 5,
    name: 'Panchala',
    nameGu: 'પંચાળા',
    nameHi: 'पंचाला',
    totalItems: 7,
    range: [127, 133],
  },
  {
    index: 6,
    name: 'Gadhada II',
    nameGu: 'ગઢડા મધ્ય',
    nameHi: 'गढ़डा मध्य',
    totalItems: 67,
    range: [134, 200],
  },
  {
    index: 7,
    name: 'Vartal',
    nameGu: 'વરતાલ',
    nameHi: 'वरताल',
    totalItems: 20,
    range: [201, 220],
  },
  {
    index: 8,
    name: 'Amdavad',
    nameGu: 'અમદાવાદ',
    nameHi: 'अहमदाबाद',
    totalItems: 3,
    range: [221, 223],
  },
  {
    index: 9,
    name: 'Gadhada III',
    nameGu: 'ગઢડા અંત્ય',
    nameHi: 'गढ़डा अंत्य',
    totalItems: 39,
    range: [224, 262],
  },
  {
    index: 10,
    name: 'Supplementary',
    nameGu: 'અનુવૃત્તિ',
    nameHi: 'अनुवृत्ति',
    totalItems: 11,
    range: [263, 273],
  },
];

export function getPrakaranForVachno(vachno: number): Section | undefined {
  return prakarans.find(
    (p) => vachno >= p.range[0] && vachno <= p.range[1]
  );
}
