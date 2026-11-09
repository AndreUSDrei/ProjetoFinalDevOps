import React, { useState } from 'react';
import {
	Users,
	Crown,
	Shield,
	Zap,
	AlertTriangle,
	CheckCircle2,
	Sparkles,
	ArrowRightLeft,
	Plus,
	RotateCcw,
	HelpCircle,
	X,
	Flame,
	Crosshair,
	Eye,
	Compass,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useGame } from '../context/GameContext';
import { formatCurrency } from '../utils/formatters';

const SquadManagement = () => {
	const {
		organization,
		roster,
		tacticalSlots,
		assignSlot,
		autoOptimizeSlots,
		setPlayerAsIGL,
		swapStarterSub,
		squadStats,
		setCurrentView,
	} = useGame();

	const [selectedSubForSwap, setSelectedSubForSwap] = useState(null);
	const [feedbackMessage, setFeedbackMessage] = useState(null);

	// Slot definitions
	const slotDefinitions = [
		{
			key: 'duelist',
			title: 'Duelista',
			roleName: 'Duelist',
			description: 'Entry fragger & abertura de espaço',
			icon: Flame,
			color: 'text-red-400',
			borderGlow: 'hover:border-red-500/50',
		},
		{
			key: 'initiator',
			title: 'Iniciador',
			roleName: 'Initiator',
			description: 'Reconhecimento & flash de suporte',
			icon: Compass,
			color: 'text-yellow-400',
			borderGlow: 'hover:border-yellow-500/50',
		},
		{
			key: 'controller',
			title: 'Controlador',
			roleName: 'Controller',
			description: 'Smokes & bloqueio de visão',
			icon: Eye,
			color: 'text-purple-400',
			borderGlow: 'hover:border-purple-500/50',
		},
		{
			key: 'sentinel',
			title: 'Sentinela',
			roleName: 'Sentinel',
			description: 'Âncora de bombsite & lurker',
			icon: Shield,
			color: 'text-blue-400',
			borderGlow: 'hover:border-blue-500/50',
		},
		{
			key: 'flex',
			title: 'Flex / Coringa',
			roleName: 'Flex',
			description: 'Quinta função tática adaptável',
			icon: Crosshair,
			color: 'text-emerald-400',
			borderGlow: 'hover:border-emerald-500/50',
		},
	];

	// Find player assigned to a slot
	const getPlayerInSlot = (slotKey) => {
		const playerId = tacticalSlots[slotKey];
		if (!playerId) return null;
		return squadStats.effectivePlayers.find((p) => p.id === playerId) || null;
	};

	// Handle substitute swap
	const handleExecuteSwap = (starterPlayer) => {
		if (!selectedSubForSwap) return;
		const res = swapStarterSub(starterPlayer.id, selectedSubForSwap.id);
		setFeedbackMessage(res.message);
		setSelectedSubForSwap(null);
		setTimeout(() => setFeedbackMessage(null), 4000);
	};

	const startersCount = roster.starters.length;
	const subsCount = roster.substitutes.length;

	return (
		<div className="space-y-6">
			{/* Top Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-6">
				<div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-[#ff4655]" />
						<span className="text-xs font-black uppercase tracking-widest text-[#ff4655]">
							Fase 3 • Prancheta Tática & Gestão do Quinteto
						</span>
					</div>
					<h2 className="text-3xl font-black text-white uppercase tracking-tighter mt-1">
						Gestão do <span className="text-[#ff4655]">Elenco</span>
					</h2>
					<p className="text-gray-400 text-sm mt-0.5">
						Defina a escalação titular da <strong className="text-white">{organization?.name}</strong>, ajuste posições e anule penalidades de troca de função.
					</p>
				</div>

				{/* Header Actions */}
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						onClick={autoOptimizeSlots}
						className="text-xs py-2 px-3.5"
						title="Organiza automaticamente os atletas em suas melhores roles"
					>
						<RotateCcw size={14} /> Auto Otimizar Posições
					</Button>
					{startersCount < 5 && (
						<Button
							onClick={() => setCurrentView('transfers')}
							className="text-xs py-2 px-3.5"
						>
							<Plus size={14} /> Contratar no Mercado
						</Button>
					)}
				</div>
			</div>

			{/* Toast Feedback */}
			{feedbackMessage && (
				<div className="p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-xs animate-in fade-in flex items-center justify-between">
					<span>{feedbackMessage}</span>
					<button onClick={() => setFeedbackMessage(null)} className="text-xs text-gray-400 hover:text-white">✕</button>
				</div>
			)}

			{/* Tactical Scoreboard (Team Rating & Status Badges) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Team Overall Card */}
				<div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xs flex items-center justify-between shadow-lg relative overflow-hidden">
					<div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]" />
					<div>
						<span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block">
							Team Overall (OVR)
						</span>
						<span className="text-3xl font-mono font-black text-white leading-tight">
							{squadStats.teamOverall > 0 ? squadStats.teamOverall : '--'}
						</span>
						<p className="text-[11px] text-gray-400 mt-0.5">
							Média efetiva do quinteto titular
						</p>
					</div>
					<div className="w-12 h-12 rounded-full bg-[#ff4655]/15 border border-[#ff4655]/30 flex items-center justify-center font-mono font-black text-[#ff4655] text-xl shadow-[0_0_15px_rgba(255,70,85,0.2)]">
						{squadStats.teamOverall || 0}
					</div>
				</div>

				{/* IGL Leadership Buff */}
				<div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xs flex items-center justify-between shadow-lg">
					<div>
						<span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block flex items-center gap-1">
							<Crown size={12} className="text-yellow-400" /> Sinergia de IGL
						</span>
						<span
							className={`text-sm font-black block mt-1 ${squadStats.synergy.hasIGL ? 'text-green-400' : 'text-amber-400'
								}`}
						>
							{squadStats.synergy.hasIGL ? '+4 Mental Coletivo' : '-5 QI em Clutches'}
						</span>
						<p className="text-[11px] text-gray-400 mt-0.5">
							{squadStats.synergy.hasIGL
								? 'Capitão ativo no quinteto'
								: 'Equipe sem IGL titular escalado'}
						</p>
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${squadStats.synergy.hasIGL
								? 'bg-yellow-500/15 border border-yellow-500/40 text-yellow-400'
								: 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
							}`}
					>
						<Crown size={18} />
					</div>
				</div>

				{/* Tactical Composition Status */}
				<div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xs flex items-center justify-between shadow-lg">
					<div>
						<span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block">
							Composição VCT
						</span>
						<span
							className={`text-sm font-black block mt-1 ${squadStats.composition.valid ? 'text-green-400' : 'text-amber-400'
								}`}
						>
							{squadStats.composition.valid ? 'Balanceada (4/4 Roles)' : 'Incompleta'}
						</span>
						<p className="text-[11px] text-gray-400 mt-0.5">
							{squadStats.composition.statusText}
						</p>
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center ${squadStats.composition.valid
								? 'bg-green-500/15 border border-green-500/40 text-green-400'
								: 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
							}`}
					>
						{squadStats.composition.valid ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
					</div>
				</div>

				{/* Import Rule Status */}
				<div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xs flex items-center justify-between shadow-lg">
					<div>
						<span className="text-[10px] uppercase font-black tracking-widest text-gray-400 block">
							Regra de Import
						</span>
						<span
							className={`text-sm font-black block mt-1 ${squadStats.hasImportViolation ? 'text-red-400' : 'text-green-400'
								}`}
						>
							{squadStats.importCount} / 1 Import Utilizado
						</span>
						<p className="text-[11px] text-gray-400 mt-0.5">
							{squadStats.hasImportViolation
								? 'Violação: Máx 1 permitido'
								: 'Em conformidade com a Riot'}
						</p>
					</div>
					<div
						className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold ${squadStats.hasImportViolation
								? 'bg-red-500/15 border border-red-500/40 text-red-400'
								: 'bg-green-500/15 border border-green-500/40 text-green-400'
							}`}
					>
						{squadStats.importCount}/1
					</div>
				</div>
			</div>

			{/* Main Grid: Tactical Board + Substitutes Panel */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Left 3 Columns: Valorant Tactical Board (5 Slots) */}
				<div className="lg:col-span-3 space-y-4">
					<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs relative overflow-hidden shadow-2xl">
						{/* Tactical Board Background Grid Accent */}
						<div
							className="absolute inset-0 opacity-5 pointer-events-none"
							style={{
								backgroundImage:
									'linear-gradient(#ff4655 1px, transparent 1px), linear-gradient(90deg, #ff4655 1px, transparent 1px)',
								backgroundSize: '40px 40px',
							}}
						/>

						<div className="relative z-10 flex items-center justify-between mb-6 pb-3 border-b border-[#1f2937]">
							<div className="flex items-center gap-2">
								<Crosshair size={18} className="text-[#ff4655]" />
								<h3 className="text-lg font-black uppercase text-white tracking-wider">
									Prancheta Tática • Quinteto Titular ({startersCount} / 5)
								</h3>
							</div>

							<span className="text-xs text-gray-400">
								Selecione o slot para alocar o atleta na posição desejada
							</span>
						</div>

						{/* 5 Tactical Slots Grid */}
						<div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{slotDefinitions.map((slotDef) => {
								const player = getPlayerInSlot(slotDef.key);
								const Icon = slotDef.icon;

								return (
									<div
										key={slotDef.key}
										className={`bg-[#0f1923] border border-[#1f2937] ${slotDef.borderGlow} p-4 rounded-xs transition-all duration-200 flex flex-col justify-between min-h-[220px] relative group shadow-md`}
									>
										{/* Slot Header */}
										<div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1f2937]">
											<div className="flex items-center gap-2">
												<Icon size={16} className={slotDef.color} />
												<div>
													<span className="text-xs font-black uppercase text-white tracking-wider block">
														{slotDef.title}
													</span>
													<span className="text-[10px] text-gray-500 font-medium block">
														{slotDef.description}
													</span>
												</div>
											</div>
										</div>

										{/* Slot Content */}
										{player ? (
											<div className="space-y-3">
												{/* Player Info */}
												<div className="flex items-start justify-between">
													<div>
														<div className="flex items-center gap-1.5">
															<span className="text-xl font-black text-white uppercase tracking-tight">
																{player.nickname}
															</span>
															{player.isIGL && (
																<span
																	title="Capitão IGL"
																	className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[9px] font-black px-1 py-0.5 rounded-xs"
																>
																	IGL
																</span>
															)}
														</div>
														<p className="text-xs text-gray-400">
															{player.name} • {player.nationality}
														</p>
														<span className="text-[10px] text-gray-400 block mt-0.5">
															Role Original: <strong className="text-gray-300">{player.primaryRole}</strong>
														</span>
													</div>

													{/* Effective Overall Badge */}
													<div className="text-right">
														<div className="font-mono text-2xl font-black text-white leading-none">
															{player.effectiveOverall}
														</div>
														<span className="text-[9px] font-bold text-gray-500 uppercase">
															OVR EFETIVO
														</span>
													</div>
												</div>

												{/* Role Swap Penalty Indicator */}
												{player.isRoleSwapped ? (
													<div className="p-2 bg-red-500/10 border border-red-500/30 rounded-xs flex items-center justify-between text-xs text-red-300">
														<span className="flex items-center gap-1 font-semibold text-[11px]">
															<AlertTriangle size={13} className="text-red-400" /> Penalidade Role Swap
														</span>
														<span className="font-mono font-bold text-red-400">
															-{player.penalty} OVR
														</span>
													</div>
												) : (
													<div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xs flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
														<CheckCircle2 size={13} /> Posição Ideal (100% de Rendimento)
													</div>
												)}

												{/* Quick Slot Actions */}
												<div className="pt-2 border-t border-[#1f2937] flex items-center justify-between text-xs">
													{/* Set as IGL button */}
													<button
														onClick={() => setPlayerAsIGL(player.id)}
														className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${player.isIGL
																? 'text-yellow-400 font-bold'
																: 'text-gray-400 hover:text-yellow-400'
															}`}
													>
														<Crown size={12} /> {player.isIGL ? 'Capitão' : 'Definir IGL'}
													</button>

													{/* Swap Slot Dropdown */}
													<select
														value={slotDef.key}
														onChange={(e) => assignSlot(e.target.value, player.id)}
														className="bg-[#111827] border border-[#1f2937] text-gray-300 text-[11px] px-2 py-1 rounded-xs focus:outline-none cursor-pointer"
													>
														<option value="duelist">Mover p/ Duelista</option>
														<option value="initiator">Mover p/ Iniciador</option>
														<option value="controller">Mover p/ Controlador</option>
														<option value="sentinel">Mover p/ Sentinela</option>
														<option value="flex">Mover p/ Flex</option>
													</select>
												</div>
											</div>
										) : (
											/* Empty Slot */
											<div className="h-full flex flex-col items-center justify-center py-6 text-center space-y-3">
												<div className="w-10 h-10 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500">
													<Plus size={18} />
												</div>
												<div>
													<p className="text-xs font-bold text-gray-400 uppercase">Slot Vazio</p>
													<p className="text-[11px] text-gray-500">
														Nenhum atleta alocado como {slotDef.title}
													</p>
												</div>

												{startersCount < 5 ? (
													<Button
														onClick={() => setCurrentView('transfers')}
														className="text-[11px] py-1.5 px-3"
													>
														Buscar {slotDef.title}
													</Button>
												) : (
													/* Allow picking an unassigned starter */
													<select
														onChange={(e) => assignSlot(slotDef.key, e.target.value)}
														className="bg-[#111827] border border-[#1f2937] text-gray-300 text-xs px-2.5 py-1.5 rounded-xs focus:outline-none cursor-pointer"
													>
														<option value="">Alocar Titular...</option>
														{roster.starters.map((p) => (
															<option key={p.id} value={p.id}>
																{p.nickname} ({p.primaryRole})
															</option>
														))}
													</select>
												)}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>

				{/* Right 1 Column: Substitutes Bench (Banco de Reservas) */}
				<div className="space-y-4">
					<div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xs space-y-4 shadow-xl">
						<div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
							<h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
								<Users size={16} className="text-[#ff4655]" /> Banco de Reservas ({subsCount} / 2)
							</h3>
							<span className="text-[10px] text-gray-500 font-bold uppercase">VCT Sub</span>
						</div>

						{subsCount === 0 ? (
							<div className="py-8 text-center bg-[#0f1923] border border-[#1f2937] rounded-xs space-y-2">
								<Users size={28} className="mx-auto text-gray-600" />
								<p className="text-xs text-gray-400 font-medium">
									Nenhum reserva no elenco.
								</p>
								<p className="text-[10px] text-gray-500">
									Você pode assinar com até 2 reservas no mercado.
								</p>
								<Button
									onClick={() => setCurrentView('transfers')}
									className="text-xs py-1.5 px-3 mx-auto mt-2"
								>
									Contratar Reserva
								</Button>
							</div>
						) : (
							<div className="space-y-3">
								{roster.substitutes.map((sub) => (
									<div
										key={sub.id}
										className="bg-[#0f1923] border border-[#1f2937] hover:border-gray-600 p-3.5 rounded-xs transition-all space-y-2.5"
									>
										<div className="flex items-start justify-between">
											<div>
												<div className="flex items-center gap-1.5">
													<span className="font-black text-white text-base">{sub.nickname}</span>
													<Badge variant="default" className="text-[10px] py-0 px-1.5">
														{sub.primaryRole}
													</Badge>
												</div>
												<p className="text-xs text-gray-400">{sub.name} • {sub.nationality}</p>
											</div>

											<div className="text-right">
												<span className="font-mono font-black text-gray-300 text-lg">
													{sub.overall}
												</span>
												<span className="block text-[9px] font-bold text-gray-500 uppercase">OVR</span>
											</div>
										</div>

										<button
											onClick={() => setSelectedSubForSwap(sub)}
											className="w-full py-2 bg-[#ff4655]/15 hover:bg-[#ff4655]/25 border border-[#ff4655]/40 text-[#ff4655] text-xs font-bold uppercase tracking-wider rounded-xs flex items-center justify-center gap-1.5 transition-all"
										>
											<ArrowRightLeft size={13} /> Substituir Titular
										</button>
									</div>
								))}
							</div>
						)}

						{/* Tactical Tips Box */}
						<div className="p-3 bg-[#0f1923] border border-[#1f2937] rounded-xs text-xs text-gray-400 space-y-1.5">
							<p className="font-bold text-gray-300 flex items-center gap-1">
								<HelpCircle size={13} className="text-[#ff4655]" /> Como funciona o Role Swap?
							</p>
							<p className="text-[11px] leading-relaxed">
								Jogadores escalados fora de sua Role Principal sofrem penalidade reduzida pelo atributo de <strong>Flexibilidade (FLE)</strong>. Atletas com FLE 90+ quase não perdem rendimento!
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Substitute Swap Modal */}
			<Modal
				isOpen={!!selectedSubForSwap}
				onClose={() => setSelectedSubForSwap(null)}
				title={`Substituição • Entra ${selectedSubForSwap?.nickname}`}
			>
				{selectedSubForSwap && (
					<div className="space-y-4">
						<p className="text-xs text-gray-400">
							Selecione qual jogador titular dará lugar a <strong className="text-white">{selectedSubForSwap.nickname}</strong> ({selectedSubForSwap.primaryRole} • OVR {selectedSubForSwap.overall}):
						</p>

						<div className="space-y-2">
							{roster.starters.map((starter) => (
								<button
									key={starter.id}
									onClick={() => handleExecuteSwap(starter)}
									className="w-full p-3 bg-[#0f1923] border border-[#1f2937] hover:border-[#ff4655] rounded-xs flex items-center justify-between transition-colors text-left group"
								>
									<div>
										<div className="flex items-center gap-2">
											<span className="font-black text-white text-sm group-hover:text-[#ff4655]">
												{starter.nickname}
											</span>
											<span className="text-xs text-gray-400">({starter.primaryRole})</span>
										</div>
										<p className="text-xs text-gray-500">{starter.name}</p>
									</div>

									<div className="flex items-center gap-3">
										<span className="font-mono font-bold text-gray-300 text-base">
											OVR {starter.overall}
										</span>
										<ArrowRightLeft size={16} className="text-gray-500 group-hover:text-[#ff4655]" />
									</div>
								</button>
							))}
						</div>

						<div className="pt-2">
							<Button
								variant="secondary"
								onClick={() => setSelectedSubForSwap(null)}
								className="w-full text-xs py-2.5"
							>
								Cancelar
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default SquadManagement;

