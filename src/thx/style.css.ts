import { style } from '@vanilla-extract/css';

const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 1rem',
  textAlign: 'center',
});

const rocket = style({
  marginTop: '9rem',
  objectFit: 'contain',
});

export const thxSt = {
  container,
  rocket,
};
