import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import './menu.scss';

export const MenuPage = (): ReactElement => {
  const navigate = useNavigate();
  const [option, setOption] = useState(0);
  const [showQR, setShowQR] = useState(false);

  const handleUserKeyPress = useCallback(
    (event: any) => {
      switch (event.key) {
        case 'ArrowUp':
          if (option > 0) {
            setOption(option - 1);
          }
          break;
        case 'ArrowDown':
          if (option < 1) {
            setOption(option + 1);
          }
          break;
        case 'Enter':
          if (option === 1) {
            setShowQR(true);
          } else if (option === 0) {
            navigate('/');
          }
          break;
        default: {
          if (showQR) {
            setShowQR(false);
          }
        }
      }
    },
    [option, showQR, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);
  return (
    <div className="menu-page">
      <div className="menu">
        <div className={`menu-item ${option === 0 && 'selected'}`}>
          Play 501 Game
        </div>
        <div className={`menu-item ${option === 1 && 'selected'}`}>
          Competition Mode
        </div>
      </div>
      {showQR && (
        <div className="qr-block">
          <div className="qr-overlay" />
          <div className="qr-container">
            Scan code to connect to competition
            <QRCode
              value="connect-to-competition"
              size={256}
              style={{
                height: '40vh',
                maxWidth: '40vh',
                width: '40vh',
                marginTop: '4vh',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
