import { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MatchScores, TStats } from 'types';
import { Stats } from 'renderer/components/stats/stats';
import { Finish } from 'renderer/components/finish/finish';
import { impossibleNumbers, minFinish } from '../../utils/constants';
import './game.scss';

const startScore = {
  0: 501,
  1: 501,
};

const emptyStats: TStats = {
  bestLeg: 0,
  highOut: 0,
  one40: 0,
  one80: 0,
  onehundred: 0,
  darts: 0,
  totalScore: 0,
};

const arrayTotal = (arr: number[]) => {
  return arr.reduce((partialSum: any, a: any) => partialSum + a, 0);
};

const isValidScore = (score: any, scores: number[], row: number) => {
  // eslint-disable-next-line no-param-reassign
  scores = [...scores];
  if (score === '' || typeof score === 'undefined') {
    return false;
  }

  if (score > 180) {
    return false;
  }
  if (score < 0) {
    return false;
  }

  if (impossibleNumbers.includes(score)) {
    return false;
  }

  scores[row] = score;

  const total = arrayTotal(scores);

  if (startScore[0] - total === 1 || startScore[0] - total < 0) {
    return false;
  }

  if (total === startScore[0]) {
    // @ts-ignore
    if (!minFinish[scores[scores.length - 1].toString()]) {
      return false;
    }
  }
  return true;
};

const isEditableField = (scores: any, field: number[], starter: number) => {
  if (field[0] < 0 || field[0] > 1) {
    return false;
  }
  if (field[1] < 0) {
    return false;
  }
  const otherPlayer = 1 - field[0];
  if (starter === field[0]) {
    if (field[1] < scores[field[0]].length) {
      return true;
    }
    if (field[1] < scores[otherPlayer].length + 1) {
      return true;
    }
  } else {
    // eslint-disable-next-line no-lonely-if
    if (field[1] < scores[otherPlayer].length) {
      return true;
    }
  }

  return false;
};

const getNextNaturaPosition = (scores: MatchScores, starter: number) => {
  let column = 0;
  let row = 0;
  if (scores[0].length === scores[1].length) {
    column = starter;
    row = scores[0].length;
  } else {
    column = scores[0].length < scores[1].length ? 0 : 1;
    row = Math.max(scores[0].length, scores[1].length) - 1;
  }

  return [column, row];
};

const getNextField = (
  scores: MatchScores,
  starter: number,
  key: string,
  field: number[]
) => {
  let newField = field;
  switch (key) {
    case 'ArrowLeft':
      newField = [0, field[1]];
      if (starter === field[0]) {
        if (field[1] >= scores[field[0]].length) {
          newField = [1 - field[0], field[1] - 1];
        }
      }
      break;
    case 'ArrowRight':
      newField = [1, field[1]];
      if (starter === field[0]) {
        if (field[1] >= scores[field[0]].length) {
          newField = [1 - field[0], field[1] - 1];
        }
      }
      break;
    case 'ArrowUp':
      newField = [field[0], field[1] - 1];
      break;
    case 'ArrowDown':
      newField = [field[0], field[1] + 1];
      if (starter !== field[0]) {
        if (field[1] + 1 >= scores[field[0]].length) {
          newField = [1 - field[0], field[1] + 1];
        }
      }
      break;
    default:
      newField = getNextNaturaPosition(scores, starter);
      break;
  }

  if (isEditableField(scores, newField, starter)) {
    return newField;
  }
  return field;
};

const getFieldValue = (
  field: any,
  scores: number[],
  editField: boolean,
  editValue: number,
  i: number,
  column: number
) => {
  if (field.join('') === `${column}${i}` && editField) {
    return editValue;
  }
  return scores[i] === 0 ? '0' : scores[i] || '';
};

export const GamePage = (): ReactElement => {
  const navigate = useNavigate();
  const [scores, setScores] = useState({
    0: [],
    1: [],
  } as MatchScores);

  const [starter, setStarter] = useState(0);
  const [field, setField] = useState([starter as 0 | 1, 0]);
  const [matchScore, setMatchScore] = useState([0, 0]);
  const [currentScore, setCurrentScore] = useState({ ...startScore });
  const [editField, setEditField] = useState(false);
  const [editValue, setEditValue] = useState(0);
  const [scroll, setScroll] = useState(0);
  const [showFinish, setShowFinish] = useState(false);
  const [winner, setWinner] = useState(0);
  const [stats, setStats] = useState({
    0: { ...emptyStats },
    1: { ...emptyStats },
  });
  const [previousStats, setPreviousStats] = useState({
    0: { ...emptyStats },
    1: { ...emptyStats },
  });

  useEffect(() => {
    let totalLeft = 0;
    let totalRight = 0;

    const newStats = {
      0: { ...previousStats[0] },
      1: { ...previousStats[1] },
    };

    scores[0].forEach((score) => {
      totalLeft += score;
      if (score === 180) {
        newStats[0].one80 += 1;
      } else if (score >= 140) {
        newStats[0].one40 += 1;
      } else if (score >= 100) {
        newStats[0].onehundred += 1;
      }
    });
    scores[1].forEach((score) => {
      totalRight += score;
      if (score === 180) {
        newStats[1].one80 += 1;
      } else if (score >= 140) {
        newStats[1].one40 += 1;
      } else if (score >= 100) {
        newStats[1].onehundred += 1;
      }
    });

    newStats[0].totalScore = previousStats[0].totalScore + totalLeft;
    newStats[1].totalScore = previousStats[1].totalScore + totalRight;
    newStats[0].darts = scores[0].length * 3 + previousStats[0].darts;
    newStats[1].darts = scores[1].length * 3 + previousStats[1].darts;

    setStats(newStats);

    // @ts-ignore
    setCurrentScore({
      0: totalLeft > startScore[0] ? 0 : startScore[0] - totalLeft,
      1: totalRight > startScore[1] ? 0 : startScore[1] - totalRight,
    });

    // if (totalLeft === startScore[0]) {
    //   setWinner(0);
    //   se`tShowFinish(true);
    // }
    // if (totalRight === startScore[1]) {
    //   setWinner(1);
    //   setShowFinish(true);
    // }
  }, [scores, previousStats]);

  const finish = useCallback(
    (darts: number) => {
      const total = arrayTotal(scores[field[0]]);
      const finishScore = startScore[0] - total;
      if (isValidScore(finishScore, scores[field[0]], field[1])) {
        // @ts-ignore
        if (minFinish[finishScore] <= darts) {
          setEditField(true);
          setEditValue(finishScore);
          setWinner(field[0]);
          setShowFinish(true);
          setCurrentScore({
            ...currentScore,
            [field[0] as 0 | 1]: 0,
          });
        }
      }
    },
    [field, scores, currentScore]
  );

  const handleGameKeyPress = useCallback(
    (key: string) => {
      const processField = (ef: boolean, ev: number) => {
        if (ef) {
          if (isValidScore(ev, scores[field[0] as 0 | 1], field[1])) {
            const newScores = { 0: [...scores[0]], 1: [...scores[1]] };
            newScores[field[0] as 0 | 1][field[1]] = ev;
            const total = newScores[field[0] as 0 | 1].reduce(
              (partialSum: any, a: any) => partialSum + a,
              0
            );

            if (total === startScore[field[0] as 0 | 1]) {
              // show ending screen
              setWinner(field[0]);
              setShowFinish(true);
              setCurrentScore({
                ...currentScore,
                [field[0] as 0 | 1]: 0,
              });
            } else if (total < startScore[field[0] as 0 | 1] - 1) {
              setEditField(false);
              setEditValue(0);
              setScores(newScores);
              setField(getNextField(newScores, starter, key, field));
            }
          }
        } else {
          setField(getNextField(scores, starter, key, field));
        }
      };

      switch (key) {
        case 'ArrowLeft':
          if (!editField && scores[0].length === 0 && scores[1].length === 0) {
            setStarter(0);
            setField([0, 0]);
          } else {
            processField(editField, editValue);
          }
          break;
        case 'ArrowRight':
          if (!editField && scores[0].length === 0 && scores[1].length === 0) {
            setStarter(1);
            setField([1, 0]);
          } else {
            processField(editField, editValue);
          }
          break;
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Enter': {
          processField(editField, editValue);
          break;
        }
        case 'Backspace': {
          if (editField) {
            setEditValue(Math.floor(editValue / 10));
          } else {
            // eslint-disable-next-line no-lonely-if
            setEditField(true);
            setEditValue(Math.floor((scores[field[0]][field[1]] || 0) / 10));
          }
          break;
        }
        case 'F1': {
          processField(true, 0);
          break;
        }
        case 'F2': {
          processField(true, 26);
          break;
        }
        case 'F3': {
          processField(true, 41);
          break;
        }
        case 'F4': {
          processField(true, 45);
          break;
        }
        case 'F5': {
          processField(true, 60);
          break;
        }
        case 'F6': {
          processField(true, 81);
          break;
        }
        case 'F7': {
          processField(true, 85);
          break;
        }
        case 'F8': {
          processField(true, 100);
          break;
        }
        case 'F9': {
          const value = editField ? editValue : scores[field[0]][field[1]] || 0;
          const newScores = [...scores[field[0]]];
          newScores[field[1]] = value;
          const total = arrayTotal(newScores);
          const scoreLeft = startScore[0] - total;
          if (value > 0 && isValidScore(scoreLeft, newScores, field[1])) {
            newScores[field[1]] = scoreLeft;
            setEditField(false);
            setEditValue(0);
            setScores({ ...scores, [field[0]]: newScores });
            setField(
              getNextField(
                { ...scores, [field[0]]: newScores },
                starter,
                'Enter',
                field
              )
            );
          }
          break;
        }
        case 'F10': {
          finish(1);
          break;
        }
        case 'F11': {
          finish(2);
          break;
        }
        case 'F12': {
          finish(3);
          break;
        }
        default: {
          // console.log(key);
          if (/^[0-9]$/i.test(key)) {
            if (!editField) {
              setEditField(true);
              setEditValue(parseInt(key, 10));
            } else {
              // eslint-disable-next-line no-lonely-if
              if (editValue < 100) {
                setEditValue(editValue * 10 + parseInt(key, 10));
              }
            }
          }
        }
      }
    },
    [field, editField, editValue, scores, starter, currentScore, finish]
  );

  const handleUserKeyPress = useCallback(
    (event: any) => {
      if (
        (event.key === 'm' || event.key === 'M') &&
        (event.metaKey || event.ctrlKey)
      ) {
        if (window.confirm('Quit to menu?')) {
          navigate('/menu');
        }
      }
      if (!showFinish) {
        handleGameKeyPress(event.key);
      }
    },
    [handleGameKeyPress, showFinish, navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  let scoreLeftCounter = startScore[0];
  let scoreRightCounter = startScore[1];
  let lineCounter = 0;

  const rows = scores[0].length > 4 ? scores[0].length + 2 : 6;

  useEffect(() => {
    if (field[1] > scroll + 4) {
      setScroll(field[1] - 4);
    }
    if (field[1] < scroll) {
      setScroll(field[1]);
    }
  }, [field, scroll]);
  return (
    <div className="game-page">
      <div className="scores">
        <div className="score-left">{currentScore[0]}</div>
        <div className="score-right">{currentScore[1]}</div>
      </div>
      <div className="players">
        <div className="player-left">Player 1</div>
        <div className="legs-container">
          <div className="legs">
            <div className="leg">{matchScore[0]}</div>
            <div className="leg">{matchScore[1]}</div>
          </div>
        </div>
        <div className="player-right">Player 2</div>
      </div>
      <div className="throws-container">
        <Stats stats={stats[0]} />
        <div className="throws-list-container">
          <div
            className="throws-list left"
            style={{ marginTop: `${scroll * -12}vh` }}
          >
            {[...Array(rows).keys()].map((i) => {
              if (scores[0][i]) scoreLeftCounter -= scores[0][i];
              if (scores[1][i]) scoreRightCounter -= scores[1][i];
              if (scoreLeftCounter < 0) {
                scoreLeftCounter = 0;
              }
              if (scoreRightCounter < 0) {
                scoreRightCounter = 0;
              }
              lineCounter += 1;
              const fieldLeftValue = getFieldValue(
                field,
                scores[0],
                editField,
                editValue,
                i,
                0
              );
              const fieldRightValue = getFieldValue(
                field,
                scores[1],
                editField,
                editValue,
                i,
                1
              );
              return (
                <div className="throw-line" key={i}>
                  <div
                    className={`score-input ${
                      field.join('') === `0${i}` && 'focus'
                    } ${parseInt(fieldLeftValue.toString(), 10) > 99 && 'ton'}`}
                  >
                    {fieldLeftValue}
                  </div>
                  <div className="score-after left">
                    {i in scores[0] && scoreLeftCounter}
                  </div>
                  <div className="line-counter">
                    <div className="line-display">{lineCounter * 3}</div>
                  </div>
                  <div className="score-after right">
                    {i in scores[1] && scoreRightCounter}
                  </div>
                  <div
                    className={`score-input ${
                      field.join('') === `1${i}` && 'focus'
                    } ${
                      parseInt(fieldRightValue.toString(), 10) > 99 && 'ton'
                    }`}
                  >
                    {fieldRightValue}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Stats stats={stats[1]} />
      </div>
      <div className="bottom">
        <div className="info">
          <div className="key">F1</div>
          <div className="def">0</div>
        </div>
        <div className="info">
          <div className="key">F2</div>
          <div className="def">26</div>
        </div>
        <div className="info">
          <div className="key">F3</div>
          <div className="def">41</div>
        </div>
        <div className="info">
          <div className="key">F4</div>
          <div className="def">45</div>
        </div>
        <div className="info">
          <div className="key">F5</div>
          <div className="def">60</div>
        </div>
        <div className="info">
          <div className="key">F6</div>
          <div className="def">81</div>
        </div>
        <div className="info">
          <div className="key">F7</div>
          <div className="def">85</div>
        </div>
        <div className="info">
          <div className="key">F8</div>
          <div className="def">100</div>
        </div>
        <div className="info">
          <div className="key">F9</div>
          <div className="def">Left</div>
        </div>
        <div className="info">
          <div className="key">F10</div>
          <div className="def">1st</div>
        </div>
        <div className="info">
          <div className="key">F11</div>
          <div className="def">2nd</div>
        </div>
        <div className="info">
          <div className="key">F12</div>
          <div className="def">3rd</div>
        </div>
        <div className="info">
          <div className="key">Ctrl+N</div>
          <div className="def">New game</div>
        </div>
        <div className="info">
          <div className="key">Ctrl+M</div>
          <div className="def">Menu</div>
        </div>
      </div>
      {showFinish && (
        <Finish
          // @ts-ignore
          minDarts={minFinish[scores[winner][scores[winner].length - 1]]}
          dartsNumber={0}
          winner={winner ? 'Player 2' : 'Player 1'}
          darts={
            field[1] < scores[winner].length
              ? (scores[winner].length - 1) * 3
              : scores[winner].length * 3
          }
          onCancel={() => {
            const newScores = { 0: [...scores[0]], 1: [...scores[1]] };
            newScores[field[0] as 0 | 1][field[1]] = 0;

            const total = newScores[field[0] as 0 | 1].reduce(
              (partialSum: any, a: any) => partialSum + a,
              0
            );

            setCurrentScore({
              ...currentScore,
              [field[0] as 0 | 1]: startScore[field[0] as 0 | 1] - total,
            });
            setEditValue(0);
            // setField([winner, scores[winner].length - 1]);
            setShowFinish(false);
          }}
          onFinish={(option) => {
            setScores({
              0: [],
              1: [],
            });
            setStarter(1 - starter);
            setField([1 - starter, 0]);
            setCurrentScore({ ...startScore });
            setEditField(false);
            setEditValue(0);

            const newMatchScore = [...matchScore];
            newMatchScore[winner] += 1;
            setMatchScore(newMatchScore);

            setShowFinish(false);
            setStats({
              0: { ...emptyStats },
              1: { ...emptyStats },
            });

            const newPreviousStats = {
              0: { ...stats[0] },
              1: { ...stats[1] },
            };

            const dartsThisLeg = (scores[winner].length - 1) * 3 + option + 1;
            const finishedWith = scores[winner][scores[winner].length - 1];

            // recalculate winner average
            newPreviousStats[winner as 0 | 1].darts =
              previousStats[winner as 0 | 1].darts + dartsThisLeg;

            newPreviousStats[winner as 0 | 1].totalScore =
              previousStats[winner as 0 | 1].totalScore +
              startScore[winner as 0 | 1];

            if (
              newPreviousStats[winner as 0 | 1].bestLeg === 0 ||
              newPreviousStats[winner as 0 | 1].bestLeg > dartsThisLeg
            ) {
              newPreviousStats[winner as 0 | 1].bestLeg = dartsThisLeg;
            }

            if (newPreviousStats[winner as 0 | 1].highOut < finishedWith) {
              newPreviousStats[winner as 0 | 1].highOut = finishedWith;
            }

            setPreviousStats(newPreviousStats);
          }}
        />
      )}
    </div>
  );
};
