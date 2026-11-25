// The page's line icons.
import type {ReactNode} from "react";

function Icon({size, weight = 2, children}: {size: number; weight?: number; children: ReactNode}) {
  return (
    <svg data-testid="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={weight}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export const NewTrackIcon = () => (
  <Icon size={26}><circle cx="5" cy="18" r="2" /><path d="M7 18h6a3.5 3.5 0 0 0 0-7h-2a3.5 3.5 0 0 1 0-7h2M19 3v6m-3-3h6" /></Icon>
);
export const MyTracksIcon = () => (
  <Icon size={26}><path d="M3 7V5a1 1 0 0 1 1-1h5l2 3h9a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></Icon>
);
export const EditorIcon = () => (
  <Icon size={26}><path d="m4 15 11-11a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L9 20l-6 1 1-6ZM13 6l5 5" /></Icon>
);

export const CopyIcon = () => (
  <Icon size={15}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></Icon>
);
export const TickIcon = () => <Icon size={15} weight={2.6}><path d="M20 6 9 17l-5-5" /></Icon>;
export const CodeIcon = () => <Icon size={12} weight={2.6}><path d="M8 6 2 12l6 6M16 6l6 6-6 6" /></Icon>;
export const TrashIcon = () => <Icon size={16}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></Icon>;
export const BugIcon = () => (
  <Icon size={22}><path d="m8 3 2 2m6-2-2 2M8 9a4 4 0 0 1 8 0M6 12l-3-2m3 5H3m4 3-3 3m14-9 3-2m-3 5h3m-4 3 3 3" />
    <rect x="6.5" y="9" width="11" height="12" rx="5.5" /><path d="M12 10v6" /></Icon>
);
export const GearIcon = () => (
  <Icon size={26}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-2.82-1.17l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0-1.17-2.82H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.17-2.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 2.82-1.17V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.17l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0 1.17 2.82H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

export const SunIcon = () => (
  <Icon size={15}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></Icon>
);
export const MoonIcon = () => <Icon size={15}><path d="M20.5 13A9 9 0 0 1 11 3.5 9 9 0 1 0 20.5 13Z" /></Icon>;
