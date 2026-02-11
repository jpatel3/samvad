import type { TrackDefinition, TrackId, Section } from '../types';
import { prakarans } from './prakarans';
import { gitaChapters } from './gitaChapters';

const vachanamrutSections: Section[] = prakarans.map((p) => ({
  index: p.index,
  name: p.name,
  nameGu: p.nameGu,
  nameHi: p.nameHi,
  totalItems: p.totalItems,
  range: p.range,
}));

export const TRACKS: TrackDefinition[] = [
  {
    id: 'vachanamrut',
    name: 'Vachanamrut',
    nameGu: 'વચનામૃત',
    nameHi: 'वचनामृत',
    description: 'The spiritual discourses of Bhagwan Swaminarayan',
    sections: vachanamrutSections,
    totalReadings: 273,
    icon: '📜',
  },
  {
    id: 'gita',
    name: 'Bhagavad Gita',
    nameGu: 'ભગવદ્ ગીતા',
    nameHi: 'भगवद् गीता',
    description: 'The divine dialogue between Krishna and Arjuna',
    sections: gitaChapters,
    totalReadings: 71,
    icon: '🙏',
  },
];

export function getTrack(id: TrackId): TrackDefinition | undefined {
  return TRACKS.find((t) => t.id === id);
}
