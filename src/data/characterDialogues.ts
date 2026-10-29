import type { EnemyKind, DialogueLine } from '../types/game';

type DialogueSet = {
  entrance: DialogueLine[];
  dodge: DialogueLine[];
  miss: DialogueLine[];
  hit: DialogueLine[];
  eliminated: DialogueLine[];
};

export const characterDialogues: Record<EnemyKind, DialogueSet> = {
  puneet: {
    entrance: [
      { text: 'System phaad denge!' },
      { text: 'Abhi toh trailer hai!' },
      { text: 'Guru, yeh kya ho gaya?' },
    ],
    dodge: [
      { text: 'Puneet ko pakadna impossible!' },
      { text: 'Nahi nahi nahi!' },
      { text: 'Miss kar diya, guru!' },
    ],
    miss: [
      { text: 'Guru, yeh kya ho gaya?' },
      { text: 'Wah, kya aim hai!' },
      { text: 'Ha ha ha, fail!' },
    ],
    hit: [
      { text: 'Aah! Yeh kya!' },
      { text: 'System hang ho gaya!' },
    ],
    eliminated: [
      { text: 'Abhi toh aaya tha...' },
      { text: 'Trailer khatam!' },
    ],
  },
  rakhi: {
    entrance: [
      { text: 'Drama abhi baaki hai!' },
      { text: 'Main comeback karungi!' },
      { text: 'Hello doston!' },
    ],
    dodge: [
      { text: 'Pakadungi nahi main!' },
      { text: 'Natak karungi!' },
      { text: 'Haay Ram!' },
    ],
    miss: [
      { text: 'Mujhe kyun target kiya?' },
      { text: 'Tumhe sharam nahi aati?' },
      { text: 'Drama fail!' },
    ],
    hit: [
      { text: 'Aah! Meri style!' },
      { text: 'Yeh galat hai!' },
    ],
    eliminated: [
      { text: 'Main comeback karungi!' },
      { text: 'Drama... khatam?' },
    ],
  },
  mcstan: {
    entrance: [
      { text: 'TERI MAA KI!' },
      { text: 'Aaja, aaja!' },
      { text: 'Shemb, shemb!' },
    ],
    dodge: [
      { text: 'Bhai, nahi!' },
      { text: 'Slow hai tu!' },
      { text: 'Phee phcee!' },
    ],
    miss: [
      { text: 'TERI MAA KI!' },
      { text: 'Miss ho gaya, bhai!' },
      { text: 'Gully se aaya hoon!' },
    ],
    hit: [
      { text: 'Bhai, yeh kya?' },
      { text: 'Aah, bass!' },
    ],
    eliminated: [
      { text: 'TERI MAA KI...' },
      { text: 'Bhai... game over!' },
    ],
  },
};

export const killPhrases = ['TERI MAA KA BHOSDA!', 'TERI MAA KA BHOSDA!', 'TERI MAA KA BHOSDA!'];

export const gameOverMessages = [
  'Bed pe badshah ban gaya tu!',
  'Aaj toh system phaad diya!',
  'Drama abhi baaki hai, bhai!',
  'Gully ka sikandar!',
  'Shemb! Kya game khela!',
  'Tu legend hai, guru!',
];