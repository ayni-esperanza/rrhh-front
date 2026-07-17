export interface FlowbiteIcon {
  viewBox: string;
  paths: string[];
}

export const FLOWBITE_ICONS = {
  dashboard: {
    viewBox: '0 0 24 24',
    paths: ['M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z']
  },
  users: {
    viewBox: '0 0 24 24',
    paths: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0H4Zm15.5-9.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm1.5 1.5a6.5 6.5 0 0 1 3 5.5V21h-2a9.9 9.9 0 0 0-3.5-7.6c.8-.1 1.6-.2 2.5-.4Z']
  },
  user: {
    viewBox: '0 0 24 24',
    paths: ['M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z']
  },
  clock: {
    viewBox: '0 0 24 24',
    paths: ['M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10.4V7h-2v6h5v-2h-3Z']
  },
  wallet: {
    viewBox: '0 0 24 24',
    paths: ['M3 7a3 3 0 0 1 3-3h13v3H6a1 1 0 0 0 0 2h15v11H5a2 2 0 0 1-2-2V7Zm14 7a2 2 0 1 0 0 4h2v-4h-2Z']
  },
  chart: {
    viewBox: '0 0 24 24',
    paths: ['M4 19h16v2H2V3h2v16Zm3-2V9h3v8H7Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z']
  },
  bell: {
    viewBox: '0 0 24 24',
    paths: ['M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-5-2-2v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1Z']
  },
  moon: {
    viewBox: '0 0 24 24',
    paths: ['M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z']
  },
  sun: {
    viewBox: '0 0 24 24',
    paths: ['M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 4a1 1 0 0 1-1-1v-1h2v1a1 1 0 0 1-1 1Zm0-18a1 1 0 0 1-1-1V2h2v1a1 1 0 0 1-1 1ZM4.22 5.64a1 1 0 0 1 1.42-1.42l.7.7-1.42 1.42-.7-.7Zm13.44 13.44 1.42-1.42.7.7a1 1 0 0 1-1.42 1.42l-.7-.7ZM2 13a1 1 0 1 1 0-2h1v2H2Zm19 0v-2h1a1 1 0 1 1 0 2h-1ZM4.22 18.36l.7-.7 1.42 1.42-.7.7a1 1 0 0 1-1.42-1.42ZM17.66 4.92l.7-.7a1 1 0 1 1 1.42 1.42l-.7.7-1.42-1.42Z']
  },
  logout: {
    viewBox: '0 0 24 24',
    paths: ['M10 17v2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5v2H5v10h5Zm7.6-4H9v-2h8.6l-3.3-3.3 1.4-1.4L21.4 12l-5.7 5.7-1.4-1.4 3.3-3.3Z']
  }
} as const satisfies Record<string, FlowbiteIcon>;

export type FlowbiteIconName = keyof typeof FLOWBITE_ICONS;