import { FC, ReactNode } from 'react';

export const ShortcutTooltip: FC<{ children: ReactNode; keys?: string[]; label?: string; position?: string }> = ({ children }) => <>{children}</>;
export default ShortcutTooltip;
