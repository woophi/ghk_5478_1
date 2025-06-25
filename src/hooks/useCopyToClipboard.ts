import { useCallback, useState } from 'react';

import { useTimeout } from './useTimeout';

type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>; // Return success

export const useCopyToClipboard = () => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const clearValue = useCallback(() => setCopiedText(null), []);

  useTimeout(clearValue, copiedText ? 2500 : null);

  const copy: CopyFn = async text => {
    if (!navigator?.clipboard) {
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await new Promise<void>((res, rej) => setClipboard(text, res, rej));
      setCopiedText(text);
      return true;
    } catch (error) {
      console.error('Copy failed', error);
      setCopiedText(null);
      return false;
    }
  };

  return { copy, copiedText, clearValue };
};

export const setClipboard = (text: string, resolve: () => void, reject: () => void) => {
  const setClipboardOnOldBrowsers = (value: string, res: () => void, rej: () => void) => {
    const tempInput = document.createElement('input');

    tempInput.style.position = 'absolute';
    tempInput.style.left = '-1000px';
    tempInput.style.top = '1000px';
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();

    if (document.execCommand('copy')) {
      res();
    } else {
      rej();
    }

    document.body.removeChild(tempInput);
  };

  const { clipboard } = navigator;

  try {
    if (clipboard !== undefined) {
      clipboard.writeText(text).then(resolve).catch(reject);
    } else {
      setClipboardOnOldBrowsers(text, resolve, reject);
    }
  } catch (e) {
    reject();
  }
};
