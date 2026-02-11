import type { Prakaran } from '../types';

export const prakarans: Prakaran[] = [
  {
    index: 1,
    name: 'Gadhada I',
    nameGu: 'ગઢડા પ્રથમ',
    nameHi: 'गढ़डा प्रथम',
    totalVachanamruts: 78,
    vachnoRange: [1, 78],
  },
  {
    index: 2,
    name: 'Sarangpur',
    nameGu: 'સારંગપુર',
    nameHi: 'सारंगपुर',
    totalVachanamruts: 18,
    vachnoRange: [79, 96],
  },
  {
    index: 3,
    name: 'Kariyani',
    nameGu: 'કારિયાણી',
    nameHi: 'कारियाणी',
    totalVachanamruts: 12,
    vachnoRange: [97, 108],
  },
  {
    index: 4,
    name: 'Loya',
    nameGu: 'લોયા',
    nameHi: 'लोया',
    totalVachanamruts: 18,
    vachnoRange: [109, 126],
  },
  {
    index: 5,
    name: 'Panchala',
    nameGu: 'પંચાળા',
    nameHi: 'पंचाला',
    totalVachanamruts: 7,
    vachnoRange: [127, 133],
  },
  {
    index: 6,
    name: 'Gadhada II',
    nameGu: 'ગઢડા મધ્ય',
    nameHi: 'गढ़डा मध्य',
    totalVachanamruts: 67,
    vachnoRange: [134, 200],
  },
  {
    index: 7,
    name: 'Vartal',
    nameGu: 'વરતાલ',
    nameHi: 'वरताल',
    totalVachanamruts: 20,
    vachnoRange: [201, 220],
  },
  {
    index: 8,
    name: 'Amdavad',
    nameGu: 'અમદાવાદ',
    nameHi: 'अहमदाबाद',
    totalVachanamruts: 3,
    vachnoRange: [221, 223],
  },
  {
    index: 9,
    name: 'Gadhada III',
    nameGu: 'ગઢડા અંત્ય',
    nameHi: 'गढ़डा अंत्य',
    totalVachanamruts: 39,
    vachnoRange: [224, 262],
  },
  {
    index: 10,
    name: 'Supplementary',
    nameGu: 'અનુવૃત્તિ',
    nameHi: 'अनुवृत्ति',
    totalVachanamruts: 11,
    vachnoRange: [263, 273],
  },
];

export function getPrakaranForVachno(vachno: number): Prakaran | undefined {
  return prakarans.find(
    (p) => vachno >= p.vachnoRange[0] && vachno <= p.vachnoRange[1]
  );
}
