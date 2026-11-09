import React from 'react';
import { DollarSign, Shield, Zap, Globe, Crown, ShoppingCart, UserMinus, Award } from 'lucide-react';
import StatBar from './StatBar';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

const PlayerCard = ({
	player,
	onBuy,
	onSell,
	isOwned = false,
	canAfford = true,
	isImport = false,
	teamRegion = '',
}) => {
	if (!player) return null;

	const {
		id,
		nickname,
		name,
		age,
		nationality,
		region,
		primaryRole,
		secondaryRole,
		isIGL,
		currentTeam,
		marketValue,
		salary,
		stats = {},
		overall = 75,
		liquipediaAchievements,
	} = player;

	const getRoleColor = (role) => {
		switch (role?.toLowerCase()) {
			case 'duelist':
				return 'red';
			case 'initiator':
				return 'yellow';
			case 'controller':
				return 'purple';
			case 'sentinel':
				return 'blue';
			case 'flex':
			default:
				return 'green';
		}
	};

	const isFreeAgent = !currentTeam || currentTeam.toLowerCase() === 'free agent';

	return (
		<div
			className={`bg-[#111827] border rounded-xs p-5 flex flex-col justify-between transition-all duration-300 relative overflow-hidden group shadow-lg ${
				isOwned
					? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
					: 'border-[#1f2937] hover:border-[#ff4655]/50 hover:shadow-[0_0_20px_rgba(255,70,85,0.15)]'
			}`}
		>
			{/* Top glow accent */}
			<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff4655] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

			{/* Card Top: Overall Rating & Tags */}
			<div>
				<div className="flex justify-between items-start mb-3">
					<div className="flex items-center gap-2">
						{/* Overall Badge (FIFA Card Style) */}
						<div className="bg-[#0f1923] border border-[#ff4655]/50 px-2.5 py-1 rounded-xs flex flex-col items-center justify-center shadow-md">
							<span className="font-mono text-2xl font-black text-[#ff4655] leading-none">
								{overall}
							</span>
							<span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">
								OVR
							</span>
						</div>

						<div>
							<div className="flex items-center gap-1.5">
								<h3 className="text-xl font-black text-white tracking-wide uppercase">
									{nickname}
								</h3>
								{isIGL && (
									<span
										title="In-Game Leader (Capitão)"
										className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-black px-1.5 py-0.5 rounded-xs flex items-center gap-1 uppercase"
									>
										<Crown size={11} /> IGL
									</span>
								)}
							</div>
							<p className="text-xs text-gray-400">
								{name} • <span className="text-gray-300">{age} anos</span>
							</p>
						</div>
					</div>

					{/* Role Badges */}
					<div className="flex flex-col items-end gap-1">
						<Badge variant={getRoleColor(primaryRole)}>{primaryRole}</Badge>
						{secondaryRole && (
							<span className="text-[10px] text-gray-400 font-semibold uppercase">
								Sub: {secondaryRole}
							</span>
						)}
					</div>
				</div>

				{/* Nationality & Current Team Strip */}
				<div className="flex items-center justify-between py-2 border-y border-[#1f2937] text-xs text-gray-400 my-3">
					<div className="flex items-center gap-1.5">
						<Globe size={13} className="text-gray-500" />
						<span className="text-gray-200 font-medium">{nationality}</span>
						<span className="text-gray-500 text-[11px]">({region})</span>
						{isImport && (
							<span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-xs uppercase">
								Estrangeiro
							</span>
						)}
					</div>

					<div>
						<span
							className={`font-semibold text-xs px-2 py-0.5 rounded-xs border ${
								isFreeAgent
									? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
									: 'bg-[#0f1923] border-[#1f2937] text-gray-300'
							}`}
						>
							{currentTeam}
						</span>
					</div>
				</div>

				{/* 6 Stats Grid */}
				<div className="grid grid-cols-2 gap-x-3 gap-y-2 py-2">
					<StatBar label="MEC (Mira)" value={stats.MEC} />
					<StatBar label="IQ (Sense)" value={stats.IQ} />
					<StatBar label="UTI (Util)" value={stats.UTI} />
					<StatBar label="ENT (Entry)" value={stats.ENT} />
					<StatBar label="FLE (Flex)" value={stats.FLE} />
					<StatBar label="MEN (Clutch)" value={stats.MEN} />
				</div>

				{/* Liquipedia Historic Achievement */}
				{liquipediaAchievements && (
					<div className="mt-2.5 p-2 bg-[#0f1923] border border-[#1f2937] rounded-xs text-[11px] text-gray-400 flex items-start gap-1.5">
						<Award size={13} className="text-yellow-500 shrink-0 mt-0.5" />
						<span className="line-clamp-2 leading-relaxed">{liquipediaAchievements}</span>
					</div>
				)}
			</div>

			{/* Card Bottom: Price, Salary & CTA */}
			<div className="mt-4 pt-3 border-t border-[#1f2937]">
				<div className="flex items-center justify-between mb-3 text-xs">
					<div>
						<span className="text-[10px] uppercase font-bold text-gray-500 block">Passe</span>
						<span className="font-mono font-black text-green-400 text-sm">
							{formatCurrency(marketValue)}
						</span>
					</div>
					{salary && (
						<div className="text-right">
							<span className="text-[10px] uppercase font-bold text-gray-500 block">Salário Anual</span>
							<span className="font-mono font-medium text-gray-400 text-xs">
								{formatCurrency(salary)}/ano
							</span>
						</div>
					)}
				</div>

				{/* Action Buttons */}
				{isOwned ? (
					<button
						onClick={() => onSell && onSell(player)}
						className="w-full py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-all"
					>
						<UserMinus size={14} /> Vender do Elenco (75% Reembolso)
					</button>
				) : (
					<button
						onClick={() => onBuy && onBuy(player)}
						disabled={!canAfford}
						className={`w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-all ${
							canAfford
								? 'bg-[#ff4655] hover:bg-[#ff5866] text-white shadow-[0_0_12px_rgba(255,70,85,0.3)] hover:shadow-[0_0_20px_rgba(255,70,85,0.5)]'
								: 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
						}`}
					>
						<ShoppingCart size={14} />
						{canAfford ? (isFreeAgent ? 'Assinar Contrato' : 'Comprar Passe') : 'Saldo Insuficiente'}
					</button>
				)}
			</div>
		</div>
	);
};

export default PlayerCard;

