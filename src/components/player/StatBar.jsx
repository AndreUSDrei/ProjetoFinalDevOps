import React from 'react';

const StatBar = ({ label, value, showValue = true }) => {
	const clampedValue = Math.min(99, Math.max(1, Number(value) || 50));

	// Cor dinâmica com base na faixa de pontuação estilo FIFA/VALORANT
	const getBarColor = (val) => {
		if (val >= 95) return 'bg-[#ff4655] shadow-[0_0_8px_rgba(255,70,85,0.6)]';
		if (val >= 90) return 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.4)]';
		if (val >= 80) return 'bg-emerald-400';
		if (val >= 70) return 'bg-cyan-400';
		return 'bg-gray-400';
	};

	const getTextColor = (val) => {
		if (val >= 95) return 'text-[#ff4655] font-black';
		if (val >= 90) return 'text-yellow-400 font-black';
		if (val >= 80) return 'text-emerald-400 font-bold';
		if (val >= 70) return 'text-cyan-400 font-bold';
		return 'text-gray-400 font-medium';
	};

	return (
		<div className="space-y-1">
			<div className="flex justify-between items-center text-xs">
				<span className="text-gray-400 font-bold tracking-wider uppercase text-[11px]">{label}</span>
				{showValue && <span className={`font-mono ${getTextColor(clampedValue)}`}>{clampedValue}</span>}
			</div>
			<div className="h-1.5 w-full bg-[#0f1923] rounded-full overflow-hidden border border-[#1f2937]">
				<div
					className={`h-full transition-all duration-500 rounded-full ${getBarColor(clampedValue)}`}
					style={{ width: `${clampedValue}%` }}
				/>
			</div>
		</div>
	);
};

export default StatBar;

