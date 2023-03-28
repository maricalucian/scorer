import { ReactElement } from 'react';
import './stats.scss';
import { TStats } from 'types';

type TStatsProps = {
  stats: TStats;
};

export const Stats = ({ stats }: TStatsProps): ReactElement => {
  return (
    <div className="stats">
      <div className="stat-line">
        <div className="stat-label">100+</div>
        <div className="stat-value">{stats.onehundred}</div>
      </div>
      <div className="stat-line">
        <div className="stat-label">140+</div>
        <div className="stat-value">{stats.one40}</div>
      </div>
      <div className="stat-line">
        <div className="stat-label">180</div>
        <div className="stat-value">{stats.one80}</div>
      </div>
      <div className="stat-line">
        <div className="stat-label">High out</div>
        <div className="stat-value">{stats.highOut}</div>
      </div>
      <div className="stat-line">
        <div className="stat-label">Best leg</div>
        <div className="stat-value">{stats.bestLeg}</div>
      </div>
      <div className="stat-line accent">
        <div className="stat-label">3DA</div>
        <div className="stat-value">
          {stats.darts && ((stats.totalScore / stats.darts) * 3).toFixed(2)}
        </div>
      </div>
    </div>
  );
};
