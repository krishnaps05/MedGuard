import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';

const SafetyBadge = ({ level, score }) => {
  const getIcon = () => {
    switch (level) {
      case 'Safe': return <ShieldCheck size={18} />;
      case 'Uncertain': return <ShieldQuestion size={18} />;
      case 'High Risk': return <ShieldAlert size={18} />;
      default: return <ShieldQuestion size={18} />;
    }
  };

  const badgeClass = `safety-badge badge-${level.replace(' ', '.')}`;

  return (
    <div className={badgeClass}>
      {getIcon()}
      <span>{level} ({score}%)</span>
    </div>
  );
};

export default SafetyBadge;
