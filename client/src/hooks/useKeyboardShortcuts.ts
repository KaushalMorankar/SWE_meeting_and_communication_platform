import { useEffect } from 'react';

interface Shortcut {
  key: string;
  mod?: boolean;
  shift?: boolean;
  ctrl?: boolean;
  alt?: boolean;
  handler: () => void;
  allowInInput?: boolean;
}

const useKeyboardShortcuts = (shortcuts: Shortcut[]): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const modMatch = shortcut.mod ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (
          keyMatch &&
          modMatch &&
          shiftMatch &&
          ctrlMatch &&
          altMatch &&
          (!isInput || shortcut.allowInInput)
        ) {
          event.preventDefault();
          shortcut.handler();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
