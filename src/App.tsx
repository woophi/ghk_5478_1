import { ButtonMobile } from '@alfalab/core-components/button/mobile';

import { Typography } from '@alfalab/core-components/typography';

import { AmountInput } from '@alfalab/core-components/amount-input';
import { Divider } from '@alfalab/core-components/divider';
import { Gap } from '@alfalab/core-components/gap';
import { SliderInput } from '@alfalab/core-components/slider-input';
import { Switch } from '@alfalab/core-components/switch';
import { CheckmarkCircleSIcon } from '@alfalab/icons-glyph/CheckmarkCircleSIcon';
import { InformationCircleLineSIcon } from '@alfalab/icons-glyph/InformationCircleLineSIcon';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import { GaPayload, sendDataToGA } from './utils/events';

function calculateMonthlyPayment(annualRate: number, periodsPerYear: number, totalPeriods: number, loanAmount: number) {
  const monthlyRate = annualRate / periodsPerYear;

  return (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -totalPeriods));
}

const swiperPaymentToGa: Record<string, GaPayload['chosen_option']> = {
  'Без залога': 'nothing',
  Авто: 'auto',
  Недвижимость: 'property',
};

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [thx, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [amount, setAmount] = useState(1_900_000);
  const [years, setYears] = useState(1);
  const [stringYears, setStringYears] = useState('до 1 года');
  const [isAutoChecked, setIsAutoChecked] = useState(false);
  const [swiperPayment, setSwiperPayment] = useState('Без залога');
  const [isRealEstate, setIsRealEstate] = useState(false);
  const [step, setStep] = useState(0);
  const swiperRef = useRef<SwiperRef | null>(null);

  const handleSumSliderChange = ({ value }: { value: number }) => {
    setAmount(value);
  };

  const handleYearsSliderChange = ({ value }: { value: number }) => {
    setYears(value);

    if (value <= 1) {
      setStringYears('до 1 года');
    } else {
      setStringYears(`до ${value} лет`);
    }
  };

  const handleSumInputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setAmount(Number(value) / 100);
  };

  const handleYearsInputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setYears(Number(value) / 100);
  };

  const formatPipsValue = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

  const formatPipsYearsValue = (value: number) => {
    return `${value.toLocaleString('ru-RU')} ${value <= 1 ? 'год' : 'лет'}`;
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const submit = () => {
    setLoading(true);
    sendDataToGA({
      sum_cred: amount.toFixed(2),
      srok_kredita: years,
      platezh_mes: '0',
      chosen_option: swiperPaymentToGa[swiperPayment],
    }).then(() => {
      LS.setItem(LSKeys.ShowThx, true);
      setThx(true);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (step === 1 || thx) {
      document.body.style.backgroundColor = 'white';
    } else {
      document.body.style.backgroundColor = '#F3F4F5';
    }
  }, [step]);

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.swiper.update();
    }
  }, [isAutoChecked, isRealEstate]);

  if (thx) {
    return <ThxLayout />;
  }

  return (
    <>
      {step === 0 && (
        <>
          <div className={appSt.container} style={{ backgroundColor: 'white' }}>
            <Gap size={16} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography.Text
                tag="p"
                view="primary-medium"
                color="secondary"
                defaultMargins={false}
                style={{ textAlign: 'center' }}
              >
                Кредит наличными
              </Typography.Text>
              <Typography.TitleResponsive font="system" tag="h3" view="medium" className={appSt.productsTitle}>
                На своих условиях
              </Typography.TitleResponsive>
            </div>

            <Gap size={32} />

            <SliderInput
              block={true}
              value={amount * 100}
              sliderValue={amount}
              onInputChange={handleSumInputChange}
              onSliderChange={handleSumSliderChange}
              onBlur={() => setAmount(prev => clamp(prev, 50_000, 1_900_000))}
              min={50_000}
              max={1_900_000}
              range={{ min: 50_000, max: 1_900_000 }}
              pips={{
                mode: 'values',
                values: [50_000, 1_900_000],
                format: { to: formatPipsValue },
              }}
              step={1}
              Input={AmountInput}
              labelView="outer"
              size={48}
            />

            <Gap size={16} />

            <SliderInput
              block={true}
              value={stringYears}
              sliderValue={years}
              onInputChange={handleYearsInputChange}
              onSliderChange={handleYearsSliderChange}
              onBlur={() => setAmount(prev => clamp(prev, 1, 20))}
              min={1}
              max={20}
              range={{ min: 1, max: 20 }}
              pips={{
                mode: 'values',
                values: [1, 20],
                format: { to: formatPipsYearsValue },
              }}
              step={1}
              labelView="outer"
              size={48}
            />

            <Gap size={16} />

            <div className={appSt.sumContainer}>
              <div className={appSt.sumCard}>
                <Switch
                  id="auto"
                  block={true}
                  reversed={true}
                  checked={isAutoChecked}
                  label="Оставить авто в залог"
                  onChange={() => setIsAutoChecked(prevState => !prevState)}
                />
              </div>
              <Divider className={appSt.divider} />
              <div
                className={appSt.sumCard}
                style={{
                  borderBottomLeftRadius: '1rem',
                  borderBottomRightRadius: '1rem',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  marginTop: '-1px',
                }}
              >
                <Switch
                  id="auto"
                  block={true}
                  reversed={true}
                  checked={isRealEstate}
                  label="Оставить недвижимость в залог"
                  onChange={() => setIsRealEstate(prevState => !prevState)}
                />
              </div>
            </div>

            <Gap size={8} />

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Text tag="p" view="primary-small" defaultMargins={false} style={{ fontSize: '12px' }}>
                Залог безопасен для вас
              </Typography.Text>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Typography.Text
                  tag="p"
                  view="primary-small"
                  defaultMargins={false}
                  style={{ fontSize: '12px', color: '#2A77EF' }}
                >
                  Подробнее
                </Typography.Text>
                <Gap size={4} direction="horizontal" />
                <InformationCircleLineSIcon color="#2A77EF" />
              </div>
            </div>

            <Gap size={8} />
          </div>

          <Gap size={24} />

          <Swiper style={{ marginLeft: '1px', marginRight: '1px' }} spaceBetween={8} slidesPerView="auto">
            <SwiperSlide onClick={() => setSwiperPayment('Без залога')} style={{ width: '170px' }}>
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
                <Typography.Text
                  tag="p"
                  view="primary-small"
                  color={swiperPayment === 'Без залога' ? 'secondary-inverted' : 'secondary'}
                  defaultMargins={false}
                >
                  Платеж в месяц
                </Typography.Text>
                <Typography.Text
                  tag="p"
                  view="primary-large"
                  defaultMargins={false}
                  style={{
                    color: swiperPayment === 'Без залога' ? 'white' : 'black',
                  }}
                >
                  {calculateMonthlyPayment(0.339, 12, years * 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
                <Gap size={12} />
                <Typography.Text
                  tag="p"
                  view="primary-small"
                  defaultMargins={false}
                  color={swiperPayment === 'Без залога' ? 'secondary-inverted' : 'secondary'}
                >
                  {amount.toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
                <Typography.Text
                  tag="p"
                  view="primary-small"
                  color={swiperPayment === 'Без залога' ? 'secondary-inverted' : 'secondary'}
                  defaultMargins={false}
                >
                  На 5 лет
                </Typography.Text>
                <Typography.Text
                  tag="p"
                  view="primary-small"
                  color={swiperPayment === 'Без залога' ? 'secondary-inverted' : 'secondary'}
                  defaultMargins={false}
                >
                  Без залога <br /> <br />
                </Typography.Text>
              </div>
            </SwiperSlide>

            {isRealEstate && (
              <SwiperSlide
                onClick={() => setSwiperPayment('Недвижимость')}
                style={{
                  width: '170px',
                  ...(isAutoChecked && { marginRight: '16px' }),
                }}
              >
                <Gap size={4} />
                <div
                  className={appSt.sliderCard({
                    selected: swiperPayment === 'Недвижимость',
                  })}
                >
                  {swiperPayment === 'Недвижимость' && (
                    <div className={appSt.sliderCardIcon}>
                      <CheckmarkCircleSIcon />
                    </div>
                  )}
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Недвижимость' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    Платеж в месяц
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-large"
                    defaultMargins={false}
                    style={{
                      color: swiperPayment === 'Недвижимость' ? 'white' : 'black',
                    }}
                  >
                    {calculateMonthlyPayment(0.2807, 12, years * 12, amount).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                  <Gap size={12} />
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Недвижимость' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    {amount.toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Недвижимость' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    На {years} {years <= 1 ? 'год' : 'лет'}
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Недвижимость' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    Под залог недвижимости
                  </Typography.Text>
                </div>
              </SwiperSlide>
            )}

            {isAutoChecked && (
              <SwiperSlide
                onClick={() => setSwiperPayment('Авто')}
                style={{
                  width: '170px',
                  ...(isRealEstate && { marginRight: '16px' }),
                }}
              >
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
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Авто' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    Платеж в месяц
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-large"
                    defaultMargins={false}
                    style={{
                      color: swiperPayment === 'Авто' ? 'white' : 'black',
                    }}
                  >
                    {calculateMonthlyPayment(0.27, 12, years * 12, amount).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                  <Gap size={12} />
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    defaultMargins={false}
                    color={swiperPayment === 'Авто' ? 'secondary-inverted' : 'secondary'}
                  >
                    {amount.toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Авто' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    На {years} {years <= 1 ? 'год' : 'лет'}
                  </Typography.Text>
                  <Typography.Text
                    tag="p"
                    view="primary-small"
                    color={swiperPayment === 'Авто' ? 'secondary-inverted' : 'secondary'}
                    defaultMargins={false}
                  >
                    Под залог <br /> авто
                  </Typography.Text>
                </div>
              </SwiperSlide>
            )}

            {isAutoChecked && isRealEstate && <SwiperSlide style={{ width: '1px', visibility: 'hidden' }}></SwiperSlide>}
          </Swiper>
        </>
      )}

      {step === 1 && (
        <div
          className={appSt.container}
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            paddingTop: 0,
          }}
        >
          <div
            style={{
              backgroundColor: '#F3F4F5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Gap size={32} />
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Кредит наличными
            </Typography.Text>
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              На своих условиях
            </Typography.TitleResponsive>
            <Gap size={48} />
          </div>

          <div
            className={appSt.sumContainer}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginTop: '-16px',
            }}
          >
            <div className={appSt.sumCard}>
              <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                {amount.toLocaleString('ru-RU', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{' '}
                ₽
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Сумма кредита
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
              <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                На {years} {years === 1 && 'год'} {years <= 4 && years > 1 && 'года'}
                {years > 4 && 'лет'}
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Срок кредита
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
              {swiperPayment === 'Без залога' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.339, 12, years * 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}

              {swiperPayment === 'Авто' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.27, 12, years * 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}

              {swiperPayment === 'Недвижимость' && (
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {calculateMonthlyPayment(0.2807, 12, years * 12, amount).toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
              )}
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Платёж в месяц
              </Typography.Text>
            </div>
            <Divider className={appSt.divider} />
            <div
              className={appSt.sumCard}
              style={{
                borderBottomLeftRadius: '1rem',
                borderBottomRightRadius: '1rem',
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                marginTop: '-1px',
              }}
            >
              <Typography.Text tag="p" view="primary-large" defaultMargins={false} weight={'bold'}>
                {swiperPayment}
              </Typography.Text>
              <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                Под залог
              </Typography.Text>
            </div>
          </div>
        </div>
      )}

      <Gap size={96} />

      {step === 0 && (
        <div className={appSt.bottomBtnThx}>
          <ButtonMobile loading={loading} onClick={() => setStep(1)} block view="primary">
            Продолжить
          </ButtonMobile>
        </div>
      )}

      {step === 1 && (
        <div className={appSt.bottomBtnThx}>
          <ButtonMobile loading={loading} onClick={submit} block view="primary">
            Отправить заявку
          </ButtonMobile>
          <Gap size={8} />
          <ButtonMobile loading={loading} onClick={() => setStep(0)} block view="ghost" style={{ height: '56px' }}>
            Изменить условия
          </ButtonMobile>
        </div>
      )}
    </>
  );
};
