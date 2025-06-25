import { AmountInput } from '@alfalab/core-components/amount-input';
import { ButtonMobile } from '@alfalab/core-components/button/mobile';
import { Divider } from '@alfalab/core-components/divider';
import { Gap } from '@alfalab/core-components/gap';
import { PopupSheet } from '@alfalab/core-components/popup-sheet';
import { SliderInput } from '@alfalab/core-components/slider-input';
import { OnInputChangeType } from '@alfalab/core-components/slider-input/types/propTypes';
import { Typography } from '@alfalab/core-components/typography';
import { CarMIcon } from '@alfalab/icons-glyph/CarMIcon';
import { CheckmarkCircleSIcon } from '@alfalab/icons-glyph/CheckmarkCircleSIcon';
import { CrossMediumMIcon } from '@alfalab/icons-glyph/CrossMediumMIcon';
import { HousesMIcon } from '@alfalab/icons-glyph/HousesMIcon';
import { InformationCircleLineMIcon } from '@alfalab/icons-glyph/InformationCircleLineMIcon';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';

function calculateMonthlyPayment(annualRate: number, periodsPerYear: number, totalPeriods: number, loanAmount: number) {
  const monthlyRate = annualRate / periodsPerYear;

  return (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -totalPeriods));
}

function calculateLoanAmount(
  annualRate: number,
  periodsPerYear: number,
  totalPeriods: number,
  monthlyPayment: number,
): number {
  const i = annualRate / periodsPerYear;
  return (monthlyPayment * (1 - Math.pow(1 + i, -totalPeriods))) / i;
}

const formatPipsValue = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
const formatPipsYearsValue = (value: number) => `${value.toLocaleString('ru-RU')} ${value <= 1 ? 'год' : 'лет'}`;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const MIN_MONTHLY_PAYMENT = 10_000;
const MAX_MONTHLY_PAYMENT = 250_000;
const MIN_AMOUNT = 50_000;
const MAX_AMOUNT = 1_900_000;
const MIN_YEARS = 1;
const MAX_YEARS = 20;

const rateBasedOnSelection: Record<string, number> = {
  'Без залога': 0.339,
  Авто: 0.27,
  Имущества: 0.2807,
};

const swiperPaymentToText: Record<string, { title: string; subtitle: string }> = {
  'Без залога': { title: 'Без залога', subtitle: 'Без выгоды' },
  Авто: { title: 'Авто', subtitle: 'Под залог' },
  Имущества: { title: 'Имущества', subtitle: 'Под залог' },
};

export const App = () => {
  const [openPop, setPop] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thxShow, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [monthlyAmount, setMonthlyAmount] = useState(15_000);
  const [swiperPayment, setSwiperPayment] = useState('Без залога');
  const [amount, setAmount] = useState(MAX_AMOUNT);
  const [years, setYears] = useState(10);
  const [stringYears, setStringYears] = useState('до 1 года');
  const [view, setView] = useState<'init' | 'confirm'>('init');

  const RATE = rateBasedOnSelection[swiperPayment];

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }
    if (years <= 1) {
      setStringYears('до 1 года');
    } else {
      setStringYears(`до ${years} лет`);
    }
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, years * 12, amount));
  }, []);
  useEffect(() => {
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, years * 12, amount));
  }, [swiperPayment]);

  const submit = () => {
    setLoading(true);

    // LS.setItem(LSKeys.ShowThx, true);
    setThx(true);
    setLoading(false);
  };

  const handleSumInputChange: OnInputChangeType = (_, { value }) => {
    const v = Number(value) / 100;
    setMonthlyAmount(v);
    const loan = calculateLoanAmount(RATE, 12, years, v);
    setAmount(loan);
  };

  const handleSumSliderChange = ({ value }: { value: number }) => {
    const v = value;
    setMonthlyAmount(v);
    const loan = calculateLoanAmount(RATE, 12, years, v);
    setAmount(loan);
  };

  const handleAmountSliderChange = ({ value }: { value: number }) => {
    setAmount(value);
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, years * 12, value));
  };

  const handleYearsSliderChange = ({ value }: { value: number }) => {
    setYears(value);
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, value * 12, amount));

    if (value <= 1) {
      setStringYears('до 1 года');
    } else {
      setStringYears(`до ${value} лет`);
    }
  };

  const handleAmountInputChange: OnInputChangeType = (_, { value }) => {
    setAmount(Number(value) / 100);
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, years * 12, Number(value) / 100));
  };

  const handleYearsInputChange: OnInputChangeType = (_, { value }) => {
    setYears(Number(value) / 100);
    setMonthlyAmount(calculateMonthlyPayment(RATE, 12, (Number(value) / 100) * 12, amount));
  };

  if (thxShow) {
    return <ThxLayout />;
  }

  if (view === 'confirm') {
    return (
      <>
        <div className={appSt.boxCenter}>
          <Typography.Text view="primary-medium" color="secondary">
            Кредит наличными
          </Typography.Text>
          <Typography.TitleResponsive tag="h1" view="medium" font="system" weight="semibold">
            На своих условиях
          </Typography.TitleResponsive>
        </div>
        <div className={appSt.container}>
          <div className={appSt.box}>
            <div>
              <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
                {amount.toLocaleString('ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{' '}
                ₽
              </Typography.TitleResponsive>
              <Typography.Text view="primary-small" color="secondary">
                Сумма кредита
              </Typography.Text>
            </div>
            <Divider />
            <div>
              <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
                {formatPipsYearsValue(years)}
              </Typography.TitleResponsive>
              <Typography.Text view="primary-small" color="secondary">
                Срок кредита
              </Typography.Text>
            </div>
            <Divider />
            <div>
              <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
                {monthlyAmount.toLocaleString('ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}{' '}
                ₽
              </Typography.TitleResponsive>
              <Typography.Text view="primary-small" color="secondary">
                Платёж в месяц
              </Typography.Text>
            </div>
            <Divider />
            <div>
              <Typography.TitleResponsive tag="h3" view="small" font="system" weight="medium">
                {swiperPaymentToText[swiperPayment].title}
              </Typography.TitleResponsive>
              <Typography.Text view="primary-small" color="secondary">
                {swiperPaymentToText[swiperPayment].subtitle}
              </Typography.Text>
            </div>
          </div>
        </div>
        <Gap size={128} />
        <div className={appSt.bottomBtn}>
          <ButtonMobile loading={loading} block view="primary" onClick={submit}>
            Отправить заявку
          </ButtonMobile>
          <ButtonMobile disabled={loading} block view="transparent" onClick={() => setView('init')}>
            Внести изменения
          </ButtonMobile>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={appSt.boxCenter}>
        <Typography.Text view="primary-medium" color="secondary">
          Кредит наличными
        </Typography.Text>
        <Typography.TitleResponsive tag="h1" view="medium" font="system" weight="semibold">
          На своих условиях
        </Typography.TitleResponsive>
      </div>
      <div className={appSt.container}>
        <SliderInput
          block={true}
          value={monthlyAmount * 100}
          sliderValue={monthlyAmount}
          onInputChange={handleSumInputChange}
          onSliderChange={handleSumSliderChange}
          onBlur={() => setMonthlyAmount(prev => clamp(prev, MIN_MONTHLY_PAYMENT, MAX_MONTHLY_PAYMENT))}
          min={MIN_MONTHLY_PAYMENT}
          max={MAX_MONTHLY_PAYMENT}
          range={{ min: MIN_MONTHLY_PAYMENT, max: MAX_MONTHLY_PAYMENT }}
          pips={{
            mode: 'values',
            values: [MIN_MONTHLY_PAYMENT, MAX_MONTHLY_PAYMENT],
            format: { to: formatPipsValue },
          }}
          step={1}
          Input={AmountInput}
          labelView="outer"
          label="Платеж в месяц"
          size={48}
        />

        <Typography.Text view="primary-medium" weight="medium">
          Наличие залога
        </Typography.Text>
      </div>
      <Swiper style={{ marginLeft: '1rem', marginRight: '1px' }} spaceBetween={8} slidesPerView="auto">
        <SwiperSlide onClick={() => setSwiperPayment('Без залога')} style={{ width: 'min-content' }}>
          <Gap size={4} />
          <div
            className={appSt.sliderCard({
              selected: swiperPayment === 'Без залога',
            })}
          >
            {swiperPayment === 'Без залога' && (
              <div className={appSt.sliderCardIcon}>
                <CheckmarkCircleSIcon />
              </div>
            )}
            <CrossMediumMIcon color={swiperPayment === 'Без залога' ? '#ffffff' : undefined} />
            <Typography.Text
              tag="p"
              view="primary-small"
              color={swiperPayment === 'Без залога' ? 'primary-inverted' : 'primary'}
              defaultMargins={false}
            >
              Без залога
            </Typography.Text>
            <Typography.Text
              tag="p"
              view="primary-small"
              color={swiperPayment === 'Без залога' ? 'secondary-inverted' : 'secondary'}
              defaultMargins={false}
            >
              Без выгоды
            </Typography.Text>
          </div>
        </SwiperSlide>
        <SwiperSlide onClick={() => setSwiperPayment('Авто')} style={{ width: 'min-content' }}>
          <Gap size={4} />
          <div
            className={appSt.sliderCard({
              selected: swiperPayment === 'Авто',
            })}
          >
            {swiperPayment === 'Авто' && (
              <div className={appSt.sliderCardIcon}>
                <CheckmarkCircleSIcon />
              </div>
            )}
            <CarMIcon color={swiperPayment === 'Авто' ? '#ffffff' : undefined} />
            <Typography.Text
              tag="p"
              view="primary-small"
              color={swiperPayment === 'Авто' ? 'primary-inverted' : 'primary'}
              defaultMargins={false}
            >
              Авто
            </Typography.Text>
            <Typography.Text tag="p" view="primary-small" color="positive" defaultMargins={false}>
              -
              {(
                calculateMonthlyPayment(rateBasedOnSelection['Без залога'], 12, years * 12, amount) -
                calculateMonthlyPayment(rateBasedOnSelection['Авто'], 12, years * 12, amount)
              ).toLocaleString('ru-RU', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              ₽/мес
            </Typography.Text>
          </div>
        </SwiperSlide>
        <SwiperSlide onClick={() => setSwiperPayment('Имущества')} style={{ width: 'min-content' }}>
          <Gap size={4} />
          <div
            className={appSt.sliderCard({
              selected: swiperPayment === 'Имущества',
            })}
          >
            {swiperPayment === 'Имущества' && (
              <div className={appSt.sliderCardIcon}>
                <CheckmarkCircleSIcon />
              </div>
            )}
            <HousesMIcon color={swiperPayment === 'Имущества' ? '#ffffff' : undefined} />
            <Typography.Text
              tag="p"
              view="primary-small"
              color={swiperPayment === 'Имущества' ? 'primary-inverted' : 'primary'}
              defaultMargins={false}
            >
              Имущества
            </Typography.Text>
            <Typography.Text tag="p" view="primary-small" color="positive" defaultMargins={false}>
              -
              {(
                calculateMonthlyPayment(rateBasedOnSelection['Без залога'], 12, years * 12, amount) -
                calculateMonthlyPayment(rateBasedOnSelection['Имущества'], 12, years * 12, amount)
              ).toLocaleString('ru-RU', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}{' '}
              ₽/мес
            </Typography.Text>
          </div>
        </SwiperSlide>
      </Swiper>
      <div className={appSt.container}>
        <div className={appSt.row}>
          <Typography.Text view="primary-small">Залог безопасен для вас</Typography.Text>

          <div className={appSt.rowCenter} onClick={() => setPop(true)}>
            <Typography.Text view="primary-small">Подробнее</Typography.Text>
            <InformationCircleLineMIcon />
          </div>
        </div>

        <SliderInput
          block={true}
          value={amount * 100}
          sliderValue={amount}
          onInputChange={handleAmountInputChange}
          onSliderChange={handleAmountSliderChange}
          onBlur={() => setAmount(prev => clamp(prev, MIN_AMOUNT, MAX_AMOUNT))}
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          range={{ min: MIN_AMOUNT, max: MAX_AMOUNT }}
          pips={{
            mode: 'values',
            values: [MIN_AMOUNT, MAX_AMOUNT],
            format: { to: formatPipsValue },
          }}
          step={1}
          Input={AmountInput}
          labelView="outer"
          label="Сумма"
          size={48}
        />

        <SliderInput
          block={true}
          value={stringYears}
          sliderValue={years}
          onInputChange={handleYearsInputChange}
          onSliderChange={handleYearsSliderChange}
          onBlur={() => setAmount(prev => clamp(prev, MIN_YEARS, MAX_YEARS))}
          min={MIN_YEARS}
          max={MAX_YEARS}
          range={{ min: MIN_YEARS, max: MAX_YEARS }}
          pips={{
            mode: 'values',
            values: [MIN_YEARS, MAX_YEARS],
            format: { to: formatPipsYearsValue },
          }}
          step={1}
          labelView="outer"
          label="Срок"
          size={48}
        />
      </div>

      <PopupSheet hasCloser swipeable open={openPop} onClose={() => setPop(false)}>
        <div>
          <Typography.Text view="primary-medium" weight="medium">
            Залог улучшает условия по кредиту. Позволяет банку снизить риски при выдаче кредитов и выдать вам нужную сумму с
            выгодной ставкой
          </Typography.Text>
        </div>
      </PopupSheet>
      <Gap size={96} />

      <div className={appSt.bottomBtn}>
        <ButtonMobile loading={loading} block view="primary" onClick={() => setView('confirm')}>
          Продолжить
        </ButtonMobile>
      </div>
    </>
  );
};
