import { ReactElement } from 'react';
import './blank.scss';

type TBlankProps = {};

// eslint-disable-next-line no-empty-pattern
export const Blank = ({}: TBlankProps): ReactElement => {
  return <div className="blank"></div>;
};
