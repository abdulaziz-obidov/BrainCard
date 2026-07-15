interface Props {
  xp: number;
  level: number;
}

export default function XPBar({ xp, level }: Props) {
  const thresholds = [0];
  for (let i = 2; i <= 100; i++) {
    thresholds.push(thresholds[i - 2] + Math.floor(100 + (i - 2) * 25));
  }
  const current = thresholds[level - 1] ?? 0;
  const next = thresholds[level] ?? current + 100;
  const progress = Math.min(100, Math.round(((xp - current) / (next - current)) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm font-medium text-primary-700 mb-1">
        <span>Level {level}</span>
        <span>{xp} XP</span>
      </div>
      <div className="h-3 rounded-full bg-primary-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-400 to-accent-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">{next - xp} XP to next level</p>
    </div>
  );
}
