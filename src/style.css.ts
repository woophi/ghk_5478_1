import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';

const bottomBtn = style({
  position: 'fixed',
  zIndex: 2,
  width: '100%',
  padding: '12px',
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '.25rem',
});

const container = style({
  display: 'flex',
  padding: '1rem',
  flexDirection: 'column',
  gap: '1rem',
});

const boxCenter = style({
  display: 'flex',
  padding: '2rem 1rem 1rem',
  flexDirection: 'column',
  gap: '.5rem',
  backgroundColor: '#F3F4F5',
  justifyContent: 'center',
  textAlign: 'center',
  alignItems: 'center',
});

const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});
const rowCenter = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#2A77EF',
});

const sliderCard = recipe({
  base: {
    position: 'relative',
    backgroundColor: '#F3F4F5',
    padding: '1rem',
    borderRadius: '1rem',
    height: '96px',
    width: 'max-content',
    transition: 'background-color 0.25s ease-in-out',
  },
  variants: {
    selected: {
      true: {
        backgroundColor: 'black',
      },
    },
  },
});

const sliderCardIcon = style({
  position: 'absolute',
  top: -5,
  right: -5,
  borderRadius: '1rem',
  backgroundColor: 'white',
  width: 'max-content',
  display: 'flex',
  padding: '4px',
});

const box = style({
  backgroundColor: '#F3F4F5',
  padding: '1rem',
  borderRadius: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '.5rem',
});

export const appSt = {
  bottomBtn,
  container,
  boxCenter,
  row,
  sliderCard,
  sliderCardIcon,
  rowCenter,
  box,
};
