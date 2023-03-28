import { ReactElement, useCallback, useEffect, useState } from 'react';
import './finish.scss';

type TFinishProps = {
  winner: string;
  onCancel: () => void;
  onFinish: (option: number) => void;
  darts: number;
  minDarts: number;
  dartsNumber: number;
};

// eslint-disable-next-line no-empty-pattern
export const Finish = ({
  winner,
  onCancel,
  onFinish,
  darts,
  minDarts,
  dartsNumber,
}: TFinishProps): ReactElement => {
  const [option, setOption] = useState(
    dartsNumber + 1 >= minDarts ? dartsNumber : minDarts - 1
  );

  console.log(minDarts);

  const handleUserKeyPress = useCallback(
    (event: any) => {
      switch (event.key) {
        case 'ArrowLeft':
          if (option >= minDarts) {
            setOption(option - 1);
          }
          break;
        case 'ArrowRight':
          if (option < 3) {
            setOption(option + 1);
          }
          break;
        case 'Escape':
          onCancel();
          break;
        case 'Enter':
          if (option === 3) {
            onCancel();
          } else {
            onFinish(option);
          }
          break;
        default: {
          console.log(event.key);
          /* empty */
        }
      }
    },
    [option, onCancel, onFinish, minDarts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);
  return (
    <div className="finish">
      <div className="finish-overlay" />
      <div className="finish-container">
        <div className="winner">{winner} wins!</div>
        <div className="darts-count">
          &nbsp;{option < 3 && `${darts + option + 1} darts`}&nbsp;
        </div>
        <div className="buttons">
          <div
            className={`option ${option === 0 && 'selected'} ${
              minDarts > 1 && 'disabled'
            }`}
          >
            1 dart
          </div>
          <div
            className={`option ${option === 1 && 'selected'} ${
              minDarts > 2 && 'disabled'
            }`}
          >
            2 darts
          </div>
          <div className={`option ${option === 2 && 'selected'}`}>3 darts</div>
          <div className={`option negative ${option === 3 && 'selected'}`}>
            Cancel
          </div>
        </div>
      </div>
    </div>
  );
};
