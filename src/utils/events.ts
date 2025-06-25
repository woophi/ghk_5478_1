declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (e: 'event', v: string, data?: Record<string, string>) => void;
  }
}

export type GaPayload = {
  sum_cred: string;
  srok_kredita: number;
  platezh_mes: string;
  chosen_option: 'auto' | 'property' | 'nothing';
};

export const sendDataToGA = async (payload: GaPayload) => {
  try {
    const now = new Date();
    const date = `${now.getFullYear()}-${
      now.getMonth() + 1
    }-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

    await fetch(
      'https://script.google.com/macros/s/AKfycbzFTECGFLN3N4yaIl2kyw2bVhA8n6CAhVO7Bmd5dADzkxMwFndK1czki_Nv0ehNO3h6Eg/exec',
      {
        redirect: 'follow',
        method: 'POST',
        body: JSON.stringify({ date, ...payload, variant: 'ghk_5478_2' }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      },
    );
  } catch (error) {
    console.error('Error!', error);
  }
};
