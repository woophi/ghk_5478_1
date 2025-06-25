import { Typography } from '@alfalab/core-components/typography';
import rocket from '../assets/rocket.png';
import { thxSt } from './style.css';

export const ThxLayout = () => {
  return (
    <>
      <div className={thxSt.container}>
        <img alt="Картинка ракеты" src={rocket} width={170} className={thxSt.rocket} />
        <Typography.TitleResponsive font="system" tag="h1" view="medium" defaultMargins weight="bold">
          Спасибо за участие
        </Typography.TitleResponsive>
        <Typography.Text tag="p" view="primary-medium">
          Мы проводим исследование для нового сервиса. Скоро расскажем о нём подробнее, следите за новостями!
        </Typography.Text>
      </div>
    </>
  );
};
