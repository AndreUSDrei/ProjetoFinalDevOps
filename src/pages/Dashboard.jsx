import React, { useState } from 'react';
import {
	Briefcase,
	ChevronRight,
	DollarSign,
	ShieldAlert,
	Star,
	Users,
	Award,
	CheckCircle2,
	AlertTriangle,
	Sparkles,
	UserMinus,
	Plus,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import TeamLogo from '../components/organization/TeamLogo';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import TransferMarket from './TransferMarket';
import SquadManagement from './SquadManagement';
import MatchSim from './MatchSim';
import { useGame } from '../context/GameContext';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
	const {
		manager,
		organization,
		budget,
		roster,
		sellPlayer,
		currentView,
		setCurrentView,
	} = useGame();

	const [isExpectationsModalOpen, setIsExpectationsModalOpen] = useState(false);
	const [feedbackMessage, setFeedbackMessage] = useState(null);

	if (!organization) {
		return null;
	}

	const getTierBadgeVariant = (tier) => {
		switch (tier) {
			case 'S':
				return 'yellow';
			case 'A':
				return 'purple';
			case 'B':
				return 'blue';
			case 'C':
			default:
				return 'default';
		}
	};

	const startersCount = roster?.starters?.length || 0;
	const subsCount = roster?.substitutes?.length || 0;

	const handleSell = (player) => {
		const res = sellPlayer(player.id);
		setFeedbackMessage(res.message);
		setTimeout(() => setFeedbackMessage(null), 4000);
	};

	return (
		<div className="flex h-screen bg-[#0f1923] text-white overflow-hidden">
			{/* Modular Sidebar */}
			<Sidebar />

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col overflow-hidden">
				{/* Modular Top Header */}
				<Header />

				{/* Scrollable Dashboard Body */}
				<main className="flex-1 overflow-y-auto p-6 lg:p-8">
					<div className="max-w-7xl mx-auto space-y-6">
						{/* Feedback notification toast */}
						{feedbackMessage && (
							<div className="p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-sm font-semibold rounded-xs animate-in fade-in flex items-center justify-between">
								<span>{feedbackMessage}</span>
								<button onClick={() => setFeedbackMessage(null)} className="text-xs text-gray-400 hover:text-white">✕</button>
							</div>
						)}

						{/* View: Club Overview */}
						{currentView === 'overview' && (
							<>
								{/* Welcome Hero Banner */}
								<div className="bg-gradient-to-r from-[#111827] via-[#111827] to-[#1f2937] border border-[#374151] rounded-xs p-8 relative overflow-hidden shadow-2xl">
									<div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-[#ff4655]/15 to-transparent pointer-events-none" />
									<div className="relative z-10 max-w-3xl">
										<div className="flex items-center gap-2 mb-3">
											<span className="h-2 w-2 rounded-full bg-[#ff4655]" />
											<span className="text-xs font-black uppercase tracking-widest text-[#ff4655]">
												VCT {organization.league} • Central do Clube
											</span>
										</div>

										<h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-3">
											Bem-vindo, <span className="text-[#ff4655]">Treinador {manager.managerName ? manager.managerName.split(' ')[0] : ''}</span>
										</h2>

										<p className="text-gray-300 text-base leading-relaxed mb-6">
											A diretoria da <span className="font-bold text-white">{organization.name}</span> oficializou sua contratação como Treinador Principal & General Manager.
											Representando {manager.country ? <strong className="text-white">{manager.country}</strong> : 'o cenário internacional'} e com reputação de <span className="text-[#ff4655] font-semibold">{manager.reputation}</span>, o objetivo é construir uma dinastia no VCT {organization.region}.
										</p>

										<div className="flex flex-wrap items-center gap-3">
											<Button
												variant="outline"
												onClick={() => setIsExpectationsModalOpen(true)}
												className="text-xs py-2.5 px-4"
											>
												<ShieldAlert size={16} /> Metas da Diretoria
											</Button>
											<Button
												onClick={() => setCurrentView('transfers')}
												className="text-xs py-2.5 px-5"
											>
												Mercado de Transferências <ChevronRight size={16} />
											</Button>
										</div>
									</div>
								</div>

								{/* Manager Identity Card & Status Grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									{/* Active Roster Card */}
									<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs relative overflow-hidden">
										<div className="flex justify-between items-start mb-4">
											<h3 className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
												<Users size={16} className="text-[#ff4655]" /> Elenco Ativo
											</h3>
											<span className="text-xs font-bold text-gray-500">Regra VCT: 5 Titulares</span>
										</div>

										<div className="text-4xl font-black font-mono">
											{startersCount} <span className="text-xl text-gray-500 font-normal">/ 5</span>
										</div>

										<div className="mt-4 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs">
											<span className="text-gray-400">Reservas: {subsCount} / 2</span>
											{startersCount < 5 ? (
												<span className="text-amber-400 font-semibold flex items-center gap-1">
													<AlertTriangle size={13} /> {5 - startersCount} vaga(s) aberta(s)
												</span>
											) : (
												<span className="text-green-400 font-semibold flex items-center gap-1">
													<CheckCircle2 size={13} /> Quinteto Completo
												</span>
											)}
										</div>
									</div>

									{/* Organization Tier & Budget Card */}
									<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs">
										<div className="flex justify-between items-start mb-4">
											<h3 className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
												<Briefcase size={16} className="text-[#ff4655]" /> Orçamento Disponível
											</h3>
											<Badge variant={getTierBadgeVariant(organization.tier)}>Tier {organization.tier}</Badge>
										</div>

										<div className="text-3xl font-black text-green-400 font-mono">
											{formatCurrency(budget)}
										</div>
										<p className="text-xs text-gray-400 mt-1">Saldo em caixa para contratações</p>

										<div className="mt-4 pt-4 border-t border-[#1f2937] text-xs text-gray-400 flex justify-between">
											<span>Liga:</span>
											<span className="text-white font-semibold">{organization.league}</span>
										</div>
									</div>

									{/* Card Perfil do Treinador */}
									<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs flex flex-col justify-between">
										<div>
											<div className="flex justify-between items-start mb-4">
												<h3 className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
													<Award size={16} className="text-[#ff4655]" /> Perfil do Treinador
												</h3>
												<span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0f1923] border border-[#ff4655]/40 text-[#ff4655]">
													{manager.country || 'VCT'}
												</span>
											</div>

											<p className="text-lg font-black text-white">{manager.managerName || 'Treinador'}</p>
											<p className="text-xs text-gray-400 mt-0.5">País: <strong className="text-gray-300">{manager.country || 'Não informado'}</strong></p>
											<p className="text-xs text-[#ff4655] font-semibold mt-1.5">{manager.reputation}</p>
										</div>

										<div className="mt-4 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs text-gray-400">
											<span>Fase Atual:</span>
											<span className="text-white font-bold uppercase tracking-wider">Fase 3 Concluída</span>
										</div>
									</div>
								</div>

								{/* Roster Display Section */}
								<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs space-y-5">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
										<div>
											<h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
												<Users size={18} className="text-[#ff4655]" /> Elenco Oficial da {organization.name}
											</h3>
											<p className="text-xs text-gray-400">
												Jogadores sob contrato ativo vinculados à sua organização
											</p>
										</div>

										{startersCount < 5 && (
											<Button
												onClick={() => setCurrentView('transfers')}
												className="text-xs py-2 px-3 self-start sm:self-auto"
											>
												<Plus size={14} /> Contratar Jogadores
											</Button>
										)}
									</div>

									{/* Starters List */}
									<div>
										<h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-1.5">
											<Sparkles size={13} className="text-yellow-400" /> Quinteto Titular ({startersCount} / 5)
										</h4>

										{startersCount === 0 ? (
											<div className="p-8 text-center bg-[#0f1923] border border-[#1f2937] rounded-xs space-y-3">
												<Users size={36} className="mx-auto text-gray-600" />
												<p className="text-sm text-gray-400 font-medium">
													Nenhum jogador titular escalado ainda.
												</p>
												<Button
													onClick={() => setCurrentView('transfers')}
													className="text-xs py-2 px-4 mx-auto"
												>
													Ir ao Mercado Contratar Atletas
												</Button>
											</div>
										) : (
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{roster.starters.map((player) => (
													<div
														key={player.id}
														className="bg-[#0f1923] border border-[#1f2937] hover:border-gray-600 p-4 rounded-xs transition-all flex flex-col justify-between relative group"
													>
														<div className="flex justify-between items-start mb-2">
															<div>
																<div className="flex items-center gap-2">
																	<span className="font-black text-lg text-white">{player.nickname}</span>
																	{player.isIGL && (
																		<span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 font-black px-1.5 py-0.5 rounded uppercase">
																			IGL
																		</span>
																	)}
																</div>
																<p className="text-xs text-gray-400">{player.name} • {player.nationality}</p>
															</div>
															<div className="text-right">
																<div className="text-xl font-mono font-black text-[#ff4655]">
																	{player.overall}
																</div>
																<span className="text-[10px] text-gray-500 font-bold uppercase">OVR</span>
															</div>
														</div>

														<div className="flex items-center justify-between text-xs pt-3 border-t border-[#1f2937] text-gray-400">
															<span className="font-semibold text-gray-300">
																{player.primaryRole} {player.secondaryRole ? `(${player.secondaryRole})` : ''}
															</span>
															<span className="font-mono text-green-400 font-semibold">
																{formatCurrency(player.marketValue)}
															</span>
														</div>

														<div className="mt-3 pt-2 border-t border-[#1f2937]/50 flex justify-end">
															<button
																onClick={() => handleSell(player)}
																className="text-[11px] text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
															>
																<UserMinus size={13} /> Vender Atleta
															</button>
														</div>
													</div>
												))}
											</div>
										)}
									</div>

									{/* Substitutes List */}
									{subsCount > 0 && (
										<div className="pt-4 border-t border-[#1f2937]">
											<h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">
												Banco de Reservas ({subsCount} / 2)
											</h4>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{roster.substitutes.map((player) => (
													<div
														key={player.id}
														className="bg-[#0f1923] border border-[#1f2937] p-4 rounded-xs flex justify-between items-center"
													>
														<div>
															<div className="flex items-center gap-2">
																<span className="font-bold text-white">{player.nickname}</span>
																<span className="text-xs text-gray-400">({player.primaryRole})</span>
															</div>
															<p className="text-xs text-gray-500">{player.nationality}</p>
														</div>
														<div className="text-right">
															<span className="font-mono font-bold text-gray-300 text-lg">
																{player.overall}
															</span>
															<button
																onClick={() => handleSell(player)}
																className="block text-[11px] text-red-400 hover:text-red-300 mt-1"
															>
																Vender
															</button>
														</div>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</>
						)}

						{/* Transfer Market View (Fase 2) */}
						{currentView === 'transfers' && <TransferMarket />}

						{/* Squad Management View (Fase 3) */}
						{currentView === 'squad' && <SquadManagement />}

						{/* Match Simulation View (Fase 4) */}
						{currentView === 'matches' && <MatchSim />}
					</div>
				</main>
			</div>

			{/* Board Expectations Modal */}
			<Modal
				isOpen={isExpectationsModalOpen}
				onClose={() => setIsExpectationsModalOpen(false)}
				title={`Metas da Diretoria • ${organization.name}`}
			>
				<div className="space-y-4">
					<div className="flex items-center gap-3 bg-[#0f1923] p-4 rounded-xs border border-[#1f2937]">
						<TeamLogo team={organization} className="w-10 h-10" />
						<div>
							<h4 className="font-black text-white uppercase text-base">{organization.name}</h4>
							<p className="text-xs text-gray-400">
								Franquia Tier {organization.tier} • {organization.league} ({organization.country})
							</p>
						</div>
					</div>

					<div className="space-y-2 text-sm">
						<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Objetivo Principal:</p>
						<div className="p-3 bg-[#0f1923] border border-[#1f2937] text-gray-200 text-xs leading-relaxed rounded-xs">
							{organization.expectation}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 text-xs pt-2">
						<div className="p-3 bg-[#0f1923] border border-[#1f2937] rounded-xs">
							<span className="text-gray-500 uppercase font-bold block mb-1">Teto Salarial Anual</span>
							<span className="font-mono font-bold text-green-400 text-sm">{formatCurrency(organization.budget)}</span>
						</div>
						<div className="p-3 bg-[#0f1923] border border-[#1f2937] rounded-xs">
							<span className="text-gray-500 uppercase font-bold block mb-1">Tolerância a Erro</span>
							<span className="font-bold text-white text-sm">
								{organization.tier === 'S' ? 'Baixíssima (Exigência Máxima)' : organization.tier === 'A' ? 'Moderada' : 'Alta (Desenvolvimento)'}
							</span>
						</div>
					</div>

					{(organization.history || (organization.titles && organization.titles.length > 0)) && (
						<div className="space-y-2 pt-2 border-t border-[#1f2937]">
							<p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
								<Award size={14} className="text-yellow-500" /> Histórico & Títulos
							</p>
							{organization.history && (
								<div className="p-3 bg-[#0f1923] border border-[#1f2937] text-gray-200 text-xs leading-relaxed rounded-xs">
									{organization.history}
								</div>
							)}
							{organization.titles && (
								<ul className="space-y-1.5">
									{(Array.isArray(organization.titles) ? organization.titles : [organization.titles]).map((title, idx) => (
										<li key={idx} className="text-[11px] text-gray-300 flex items-start gap-1.5">
											<Award size={12} className="text-yellow-500 shrink-0 mt-0.5" />
											<span>{title}</span>
										</li>
									))}
								</ul>
							)}
						</div>
					)}

					<div className="pt-2">
						<Button
							onClick={() => setIsExpectationsModalOpen(false)}
							className="w-full text-xs py-2.5"
						>
							Entendido, Coach
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default Dashboard;
