import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatCurrency } from '../../utils/formatters';

const Header = () => {
	const { organization, manager, budget } = useGame();

	if (!organization) return null;

	return (
		<header className="h-20 border-b border-[#1f2937] flex items-center justify-between px-8 bg-[#111827]/80 backdrop-blur-md sticky top-0 z-20">
			{/* Organization & Manager Info */}
			<div className="flex items-center gap-4">
				<div
					className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg border border-white/10"
					style={{ backgroundColor: organization.color || '#ff4655' }}
				>
					{organization.name.charAt(0)}
				</div>
				<div>
					<div className="flex items-center gap-2">
						<h2 className="text-xl font-black uppercase tracking-wider text-white">{organization.name}</h2>
						<span className="text-xs px-2 py-0.5 rounded bg-[#0f1923] text-gray-400 border border-[#1f2937] font-semibold">
							{organization.region}
						</span>
					</div>
					<p className="text-xs text-gray-400 font-medium">
						GM: <span className="text-gray-200">{manager.managerName}</span> (OVR {manager.overallRating})
					</p>
				</div>
			</div>

			{/* Available Budget Pill */}
			<div className="bg-[#0f1923] border border-[#1f2937] px-4 py-2 rounded-md flex items-center gap-3 shadow-inner">
				<div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
				<div>
					<span className="text-[10px] uppercase text-gray-500 font-bold tracking-widest block leading-none">
						Available Budget
					</span>
					<span className="font-mono font-bold text-green-400 text-lg leading-tight">
						{formatCurrency(budget)}
					</span>
				</div>
			</div>
		</header>
	);
};

export default Header;

