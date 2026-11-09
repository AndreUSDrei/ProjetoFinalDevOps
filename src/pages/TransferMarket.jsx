import React, { useState, useMemo } from 'react';
import {
	Search,
	Filter,
	DollarSign,
	LayoutGrid,
	List,
	ArrowUpDown,
	Sparkles,
	CheckCircle2,
	AlertTriangle,
	Info,
	ShoppingCart,
	Globe,
	Crown,
	X,
} from 'lucide-react';
import PlayerCard from '../components/player/PlayerCard';
import PlayerRow from '../components/player/PlayerRow';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useGame } from '../context/GameContext';
import { isPlayerImport, validateImportRule } from '../utils/calculators';
import { formatCurrency } from '../utils/formatters';

const TransferMarket = () => {
	const {
		organization,
		budget,
		roster,
		marketPlayers,
		buyPlayer,
		sellPlayer,
	} = useGame();

	// State for UI filters & search
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedRole, setSelectedRole] = useState('ALL');
	const [selectedRegion, setSelectedRegion] = useState('ALL');
	const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'FREE_AGENTS' | 'CONTRACT' | 'MY_TEAM'
	const [sortBy, setSortBy] = useState('OVERALL_DESC'); // 'OVERALL_DESC' | 'OVERALL_ASC' | 'PRICE_DESC' | 'PRICE_ASC'
	const [viewMode, setViewMode] = useState('CARDS'); // 'CARDS' | 'TABLE'

	// Modal states
	const [negotiatingPlayer, setNegotiatingPlayer] = useState(null);
	const [feedbackNotification, setFeedbackNotification] = useState(null);

	// Check if a player is in our roster
	const isPlayerInRoster = (playerId) => {
		return (
			roster.starters.some((p) => p.id === playerId) ||
			roster.substitutes.some((p) => p.id === playerId)
		);
	};

	// Filtered & Sorted Players List
	const filteredPlayers = useMemo(() => {
		return marketPlayers
			.filter((player) => {
				// Search matching
				const query = searchQuery.toLowerCase().trim();
				const matchesSearch =
					!query ||
					player.nickname.toLowerCase().includes(query) ||
					player.name.toLowerCase().includes(query) ||
					player.nationality.toLowerCase().includes(query) ||
					(player.currentTeam && player.currentTeam.toLowerCase().includes(query));

				// Role matching
				const matchesRole =
					selectedRole === 'ALL' ||
					player.primaryRole?.toLowerCase() === selectedRole.toLowerCase() ||
					player.secondaryRole?.toLowerCase() === selectedRole.toLowerCase();

				// Region matching
				const matchesRegion =
					selectedRegion === 'ALL' ||
					player.region?.toLowerCase() === selectedRegion.toLowerCase();

				// Status matching
				const isOwned = isPlayerInRoster(player.id);
				const isFreeAgent =
					!player.currentTeam || player.currentTeam.toLowerCase() === 'free agent';

				let matchesStatus = true;
				if (selectedStatus === 'FREE_AGENTS') {
					matchesStatus = isFreeAgent && !isOwned;
				} else if (selectedStatus === 'CONTRACT') {
					matchesStatus = !isFreeAgent && !isOwned;
				} else if (selectedStatus === 'MY_TEAM') {
					matchesStatus = isOwned;
				}

				return matchesSearch && matchesRole && matchesRegion && matchesStatus;
			})
			.sort((a, b) => {
				switch (sortBy) {
					case 'OVERALL_DESC':
						return (b.overall || 0) - (a.overall || 0);
					case 'OVERALL_ASC':
						return (a.overall || 0) - (b.overall || 0);
					case 'PRICE_DESC':
						return (b.marketValue || 0) - (a.marketValue || 0);
					case 'PRICE_ASC':
						return (a.marketValue || 0) - (b.marketValue || 0);
					default:
						return 0;
				}
			});
	}, [marketPlayers, searchQuery, selectedRole, selectedRegion, selectedStatus, sortBy, roster]);

	// Open purchase confirmation modal
	const handleInitiateBuy = (player) => {
		setNegotiatingPlayer(player);
	};

	// Confirm purchase
	const handleConfirmBuy = () => {
		if (!negotiatingPlayer) return;

		const result = buyPlayer(negotiatingPlayer);
		setFeedbackNotification({
			type: result.success ? 'success' : 'error',
			message: result.message,
		});

		setNegotiatingPlayer(null);
		setTimeout(() => setFeedbackNotification(null), 5000);
	};

	// Handle Sell
	const handleSell = (player) => {
		const result = sellPlayer(player.id);
		setFeedbackNotification({
			type: result.success ? 'success' : 'error',
			message: result.message,
		});
		setTimeout(() => setFeedbackNotification(null), 5000);
	};

	// Import validation for the negotiating player
	const negotiatingImportValidation = useMemo(() => {
		if (!negotiatingPlayer || !organization) return { valid: true };
		return validateImportRule(roster.starters, negotiatingPlayer, organization.region);
	}, [negotiatingPlayer, roster.starters, organization]);

	const startersCount = roster?.starters?.length || 0;
	const subsCount = roster?.substitutes?.length || 0;
	const totalRoster = startersCount + subsCount;

	return (
		<div className="space-y-6">
			{/* Top Bar: Title & Available Budget */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
				<div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-[#ff4655]" />
						<span className="text-xs font-black uppercase tracking-widest text-[#ff4655]">
							Fase 2 • Mercado Oficial de Transferências VCT
						</span>
					</div>
					<h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-1">
						Mercado de <span className="text-[#ff4655]">Transferências</span>
					</h2>
					<p className="text-gray-400 text-sm mt-0.5">
						Explore, negocie e assine com atletas do cenário internacional para o seu elenco da{' '}
						<strong className="text-white">{organization?.name}</strong>.
					</p>
				</div>

				{/* Quick Stats Pill */}
				<div className="flex items-center gap-3">
					<div className="bg-[#111827] border border-[#1f2937] px-4 py-2 rounded-xs">
						<span className="text-[10px] text-gray-500 uppercase font-black block">Elenco Atual</span>
						<span className="text-sm font-black text-white">
							{startersCount} Titulares • {subsCount} Reservas
						</span>
					</div>

					<div className="bg-[#111827] border border-green-500/30 px-4 py-2 rounded-xs">
						<span className="text-[10px] text-green-400 uppercase font-black block">Saldo Disponível</span>
						<span className="text-lg font-mono font-black text-green-400 leading-none">
							{formatCurrency(budget)}
						</span>
					</div>
				</div>
			</div>

			{/* Feedback Notification Toast */}
			{feedbackNotification && (
				<div
					className={`p-4 rounded-xs text-sm font-semibold flex items-center justify-between animate-in fade-in duration-200 border ${
						feedbackNotification.type === 'success'
							? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
							: 'bg-red-500/10 border-red-500/40 text-red-300'
					}`}
				>
					<div className="flex items-center gap-2">
						{feedbackNotification.type === 'success' ? (
							<CheckCircle2 size={18} className="text-emerald-400" />
						) : (
							<AlertTriangle size={18} className="text-red-400" />
						)}
						<span>{feedbackNotification.message}</span>
					</div>
					<button
						onClick={() => setFeedbackNotification(null)}
						className="text-gray-400 hover:text-white"
					>
						<X size={16} />
					</button>
				</div>
			)}

			{/* Filter & Control Bar */}
			<div className="bg-[#111827] border border-[#1f2937] p-4 rounded-xs space-y-3 shadow-md">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					{/* Search Box */}
					<div className="relative col-span-1 md:col-span-2">
						<Search
							size={16}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
						/>
						<input
							type="text"
							placeholder="Buscar por nickname, nome real, time ou país..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full bg-[#0f1923] border border-[#1f2937] text-white pl-10 pr-4 py-2.5 rounded-xs text-xs font-medium focus:outline-none focus:border-[#ff4655] placeholder-gray-500"
						/>
					</div>

					{/* Role Filter */}
					<div>
						<select
							value={selectedRole}
							onChange={(e) => setSelectedRole(e.target.value)}
							className="w-full bg-[#0f1923] border border-[#1f2937] text-white px-3 py-2.5 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#ff4655] cursor-pointer"
						>
							<option value="ALL">Todas as Funções (Roles)</option>
							<option value="Duelist">Duelistas (Duelist)</option>
							<option value="Initiator">Iniciadores (Initiator)</option>
							<option value="Controller">Controladores (Controller)</option>
							<option value="Sentinel">Sentinelas (Sentinel)</option>
							<option value="Flex">Coringas / Flex</option>
						</select>
					</div>

					{/* Region Filter */}
					<div>
						<select
							value={selectedRegion}
							onChange={(e) => setSelectedRegion(e.target.value)}
							className="w-full bg-[#0f1923] border border-[#1f2937] text-white px-3 py-2.5 rounded-xs text-xs font-semibold focus:outline-none focus:border-[#ff4655] cursor-pointer"
						>
							<option value="ALL">Todas as Regiões</option>
							<option value="Americas">Americas</option>
							<option value="EMEA">EMEA</option>
							<option value="Pacific">Pacific</option>
							<option value="China">China</option>
						</select>
					</div>
				</div>

				{/* Secondary Filter Row: Status, Sort and Mode */}
				<div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#1f2937]">
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-xs text-gray-400 font-bold uppercase tracking-wider mr-1">
							Status:
						</span>
						<button
							onClick={() => setSelectedStatus('ALL')}
							className={`text-xs px-2.5 py-1 rounded-xs font-semibold transition-colors ${
								selectedStatus === 'ALL'
									? 'bg-[#ff4655] text-white font-bold'
									: 'bg-[#0f1923] text-gray-400 hover:text-white border border-[#1f2937]'
							}`}
						>
							Todos ({marketPlayers.length})
						</button>
						<button
							onClick={() => setSelectedStatus('FREE_AGENTS')}
							className={`text-xs px-2.5 py-1 rounded-xs font-semibold transition-colors ${
								selectedStatus === 'FREE_AGENTS'
									? 'bg-[#ff4655] text-white font-bold'
									: 'bg-[#0f1923] text-gray-400 hover:text-white border border-[#1f2937]'
							}`}
						>
							Agentes Livres (Free Agents)
						</button>
						<button
							onClick={() => setSelectedStatus('CONTRACT')}
							className={`text-xs px-2.5 py-1 rounded-xs font-semibold transition-colors ${
								selectedStatus === 'CONTRACT'
									? 'bg-[#ff4655] text-white font-bold'
									: 'bg-[#0f1923] text-gray-400 hover:text-white border border-[#1f2937]'
							}`}
						>
							Sob Contrato
						</button>
						<button
							onClick={() => setSelectedStatus('MY_TEAM')}
							className={`text-xs px-2.5 py-1 rounded-xs font-semibold transition-colors ${
								selectedStatus === 'MY_TEAM'
									? 'bg-[#ff4655] text-white font-bold'
									: 'bg-[#0f1923] text-gray-400 hover:text-white border border-[#1f2937]'
							}`}
						>
							Meu Elenco ({totalRoster})
						</button>
					</div>

					{/* Sorting and Mode switch */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-1.5 bg-[#0f1923] border border-[#1f2937] px-2 py-1 rounded-xs">
							<ArrowUpDown size={13} className="text-gray-400" />
							<select
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
								className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
							>
								<option value="OVERALL_DESC" className="bg-[#111827]">Maior Overall</option>
								<option value="OVERALL_ASC" className="bg-[#111827]">Menor Overall</option>
								<option value="PRICE_DESC" className="bg-[#111827]">Mais Caros</option>
								<option value="PRICE_ASC" className="bg-[#111827]">Mais Baratos</option>
							</select>
						</div>

						{/* Mode toggle */}
						<div className="flex items-center bg-[#0f1923] border border-[#1f2937] p-0.5 rounded-xs">
							<button
								onClick={() => setViewMode('CARDS')}
								className={`p-1.5 rounded-xs transition-colors ${
									viewMode === 'CARDS'
										? 'bg-[#ff4655] text-white'
										: 'text-gray-400 hover:text-white'
								}`}
								title="Visualização em Cards"
							>
								<LayoutGrid size={15} />
							</button>
							<button
								onClick={() => setViewMode('TABLE')}
								className={`p-1.5 rounded-xs transition-colors ${
									viewMode === 'TABLE'
										? 'bg-[#ff4655] text-white'
										: 'text-gray-400 hover:text-white'
								}`}
								title="Visualização em Tabela"
							>
								<List size={15} />
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content: Cards Grid or Table */}
			{filteredPlayers.length === 0 ? (
				<div className="bg-[#111827] border border-[#1f2937] p-12 text-center rounded-xs space-y-3">
					<Filter size={40} className="mx-auto text-gray-600" />
					<h3 className="text-xl font-bold text-white">Nenhum jogador encontrado</h3>
					<p className="text-gray-400 text-xs">
						Tente ajustar os filtros de busca, função ou região.
					</p>
					<Button
						variant="secondary"
						onClick={() => {
							setSearchQuery('');
							setSelectedRole('ALL');
							setSelectedRegion('ALL');
							setSelectedStatus('ALL');
						}}
						className="text-xs py-2 px-4 mx-auto"
					>
						Limpar Filtros
					</Button>
				</div>
			) : viewMode === 'CARDS' ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
					{filteredPlayers.map((player) => {
						const isOwned = isPlayerInRoster(player.id);
						const canAfford = budget >= (player.marketValue || 0);
						const isImport = isPlayerImport(player.region, organization?.region);

						return (
							<PlayerCard
								key={player.id}
								player={player}
								isOwned={isOwned}
								canAfford={canAfford}
								isImport={isImport}
								teamRegion={organization?.region}
								onBuy={() => handleInitiateBuy(player)}
								onSell={() => handleSell(player)}
							/>
						);
					})}
				</div>
			) : (
				<div className="bg-[#111827] border border-[#1f2937] rounded-xs overflow-x-auto shadow-md">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="border-b border-[#1f2937] bg-[#0f1923] text-gray-400 text-xs uppercase tracking-wider">
								<th className="py-3 px-4 text-center">OVR</th>
								<th className="py-3 px-4">Atleta</th>
								<th className="py-3 px-4">Função</th>
								<th className="py-3 px-4 hidden md:table-cell">Atributos Chave</th>
								<th className="py-3 px-4">Time Atual</th>
								<th className="py-3 px-4 text-right">Passe</th>
								<th className="py-3 px-4 text-right">Ação</th>
							</tr>
						</thead>
						<tbody>
							{filteredPlayers.map((player) => {
								const isOwned = isPlayerInRoster(player.id);
								const canAfford = budget >= (player.marketValue || 0);
								const isImport = isPlayerImport(player.region, organization?.region);

								return (
									<PlayerRow
										key={player.id}
										player={player}
										isOwned={isOwned}
										canAfford={canAfford}
										isImport={isImport}
										onBuy={() => handleInitiateBuy(player)}
										onSell={() => handleSell(player)}
									/>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{/* Purchase Confirmation Modal */}
			<Modal
				isOpen={!!negotiatingPlayer}
				onClose={() => setNegotiatingPlayer(null)}
				title={`Proposta de Contratação • ${negotiatingPlayer?.nickname}`}
			>
				{negotiatingPlayer && (
					<div className="space-y-4">
						{/* Player Summary Header */}
						<div className="flex items-center justify-between p-4 bg-[#0f1923] border border-[#1f2937] rounded-xs">
							<div>
								<div className="flex items-center gap-2">
									<h4 className="text-xl font-black text-white">{negotiatingPlayer.nickname}</h4>
									<span className="text-xs bg-[#ff4655]/20 text-[#ff4655] font-bold px-2 py-0.5 rounded">
										{negotiatingPlayer.primaryRole}
									</span>
								</div>
								<p className="text-xs text-gray-400 mt-0.5">
									{negotiatingPlayer.name} • {negotiatingPlayer.nationality} ({negotiatingPlayer.region})
								</p>
							</div>

							<div className="text-right">
								<span className="text-2xl font-mono font-black text-[#ff4655]">
									{negotiatingPlayer.overall}
								</span>
								<span className="block text-[10px] uppercase font-bold text-gray-500">OVR</span>
							</div>
						</div>

						{/* Import Rule Validation Warning */}
						{!negotiatingImportValidation.valid && (
							<div className="p-3 bg-red-500/15 border border-red-500/50 rounded-xs flex items-start gap-2.5">
								<AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
								<div className="text-xs text-red-300 space-y-1">
									<p className="font-bold text-red-200">
										Atenção: Limite de Importação do VCT
									</p>
									<p>{negotiatingImportValidation.error}</p>
									<p className="text-[11px] text-gray-400">
										O jogador será contratado diretamente para o <strong>Banco de Reservas</strong> para cumprir o regulamento oficial.
									</p>
								</div>
							</div>
						)}

						{/* Financial breakdown */}
						<div className="space-y-2 text-xs bg-[#0f1923] p-4 rounded-xs border border-[#1f2937]">
							<div className="flex justify-between text-gray-400">
								<span>Saldo Atual da {organization?.name}:</span>
								<span className="font-mono font-bold text-white">{formatCurrency(budget)}</span>
							</div>

							<div className="flex justify-between text-gray-400 border-b border-[#1f2937] pb-2">
								<span>Custo do Passe de Transferência:</span>
								<span className="font-mono font-bold text-red-400">
									- {formatCurrency(negotiatingPlayer.marketValue)}
								</span>
							</div>

							<div className="flex justify-between text-sm font-bold pt-1">
								<span className="text-white">Saldo Restante:</span>
								<span
									className={`font-mono ${
										budget >= (negotiatingPlayer.marketValue || 0)
											? 'text-green-400'
											: 'text-red-400'
									}`}
								>
									{formatCurrency(budget - (negotiatingPlayer.marketValue || 0))}
								</span>
							</div>
						</div>

						{/* Confirmation Buttons */}
						<div className="flex gap-3 pt-2">
							<Button
								variant="secondary"
								onClick={() => setNegotiatingPlayer(null)}
								className="flex-1 text-xs py-3"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleConfirmBuy}
								disabled={budget < (negotiatingPlayer.marketValue || 0)}
								className="flex-1 text-xs py-3"
							>
								<ShoppingCart size={14} /> Confirmar Contratação
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default TransferMarket;

