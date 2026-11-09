import React from 'react';
import { Crown, ShoppingCart, UserMinus } from 'lucide-react';
import Badge from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

const PlayerRow = ({
	player,
	onBuy,
	onSell,
	isOwned = false,
	canAfford = true,
	isImport = false,
}) => {
	if (!player) return null;

	const {
		nickname,
		name,
		nationality,
		region,
		primaryRole,
		isIGL,
		currentTeam,
		marketValue,
		overall = 75,
		stats = {},
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
		<tr
			className={`border-b border-[#1f2937] transition-colors ${
				isOwned
					? 'bg-emerald-950/20 hover:bg-emerald-950/30'
					: 'hover:bg-[#111827]/80'
			}`}
		>
			{/* Overall */}
			<td className="py-3.5 px-4 font-mono font-black text-lg text-center">
				<span className="text-[#ff4655] bg-[#0f1923] border border-[#ff4655]/30 px-2 py-0.5 rounded-xs">
					{overall}
				</span>
			</td>

			{/* Athlete Nickname & Real Name */}
			<td className="py-3.5 px-4">
				<div className="flex items-center gap-2">
					<span className="font-black text-white text-base tracking-wide">{nickname}</span>
					{isIGL && (
						<span
							title="In-Game Leader"
							className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[10px] font-black px-1.5 py-0.2 rounded-xs flex items-center gap-0.5"
						>
							<Crown size={10} /> IGL
						</span>
					)}
					{isImport && (
						<span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] font-black px-1.5 py-0.2 rounded-xs uppercase">
							Import
						</span>
					)}
				</div>
				<p className="text-xs text-gray-400">
					{name} • {nationality} ({region})
				</p>
			</td>

			{/* Role */}
			<td className="py-3.5 px-4">
				<Badge variant={getRoleColor(primaryRole)}>{primaryRole}</Badge>
			</td>

			{/* Stats Mini Grid */}
			<td className="py-3.5 px-4 hidden md:table-cell">
				<div className="flex items-center gap-2 text-xs font-mono">
					<span title="Mecânica" className="text-gray-300">MEC: <strong className="text-white">{stats.MEC}</strong></span>
					<span title="Game Sense" className="text-gray-300">IQ: <strong className="text-white">{stats.IQ}</strong></span>
					<span title="Utilidade" className="text-gray-300">UTI: <strong className="text-white">{stats.UTI}</strong></span>
					<span title="Entry" className="text-gray-300">ENT: <strong className="text-white">{stats.ENT}</strong></span>
				</div>
			</td>

			{/* Current Team */}
			<td className="py-3.5 px-4 text-xs font-semibold">
				<span
					className={`px-2 py-0.5 rounded-xs border ${
						isFreeAgent
							? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
							: 'bg-[#0f1923] border-[#1f2937] text-gray-300'
					}`}
				>
					{currentTeam}
				</span>
			</td>

			{/* Market Value */}
			<td className="py-3.5 px-4 font-mono font-bold text-green-400 text-sm text-right">
				{formatCurrency(marketValue)}
			</td>

			{/* Action CTA */}
			<td className="py-3.5 px-4 text-right">
				{isOwned ? (
					<button
						onClick={() => onSell && onSell(player)}
						className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-wider rounded-xs inline-flex items-center gap-1 transition-all"
					>
						<UserMinus size={13} /> Vender
					</button>
				) : (
					<button
						onClick={() => onBuy && onBuy(player)}
						disabled={!canAfford}
						className={`px-3 py-1.5 font-bold text-xs uppercase tracking-wider rounded-xs inline-flex items-center gap-1 transition-all ${
							canAfford
								? 'bg-[#ff4655] hover:bg-[#ff5866] text-white shadow-sm'
								: 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
						}`}
					>
						<ShoppingCart size={13} />
						{canAfford ? 'Contratar' : 'Sem Saldo'}
					</button>
				)}
			</td>
		</tr>
	);
};

export default PlayerRow;

