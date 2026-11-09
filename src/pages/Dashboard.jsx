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
	Info,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useGame } from '../context/GameContext';
import { formatCurrency } from '../utils/formatters';

const Dashboard = () => {
	const { manager, organization, budget, roster, currentView, setCurrentView } = useGame();
	const [isExpectationsModalOpen, setIsExpectationsModalOpen] = useState(false);

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
												Etapa 1 Concluída • Painel Oficial do Treinador
											</span>
										</div>

										<h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-3">
											Welcome to the Board, <span className="text-[#ff4655]">Coach {manager.managerName.split(' ')[0]}</span>
										</h2>

										<p className="text-gray-300 text-base leading-relaxed mb-6">
											A diretoria da <span className="font-bold text-white">{organization.name}</span> oficializou sua contratação como Head Coach & General Manager.
											Com sua base em <span className="text-white font-semibold">{manager.originCity}</span>, nível <span className="text-white font-semibold">{manager.coachLevel}</span> (OVR {manager.overallRating}) e reputação de <span className="text-[#ff4655] font-semibold">{manager.reputation}</span>, o objetivo é construir uma dinastia no VCT {organization.region}.
										</p>

										<div className="flex flex-wrap items-center gap-3">
											<Button
												variant="outline"
												onClick={() => setIsExpectationsModalOpen(true)}
												className="text-xs py-2.5 px-4"
											>
												<ShieldAlert size={16} /> Ver Metas da Diretoria
											</Button>
											<Button
												onClick={() => setCurrentView('transfers')}
												className="text-xs py-2.5 px-5"
											>
												Ir para Mercado (Fase 2) <ChevronRight size={16} />
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
												<Users size={16} className="text-[#ff4655]" /> Active Roster
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
													<AlertTriangle size={13} /> Elenco Incompleto
												</span>
											) : (
												<span className="text-green-400 font-semibold flex items-center gap-1">
													<CheckCircle2 size={13} /> Elenco Pronto
												</span>
											)}
										</div>
									</div>

									{/* Organization Tier & Budget Card */}
									<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs">
										<div className="flex justify-between items-start mb-4">
											<h3 className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
												<Briefcase size={16} className="text-[#ff4655]" /> Status da Organização
											</h3>
											<Badge variant={getTierBadgeVariant(organization.tier)}>Tier {organization.tier}</Badge>
										</div>

										<div className="text-3xl font-black text-white font-mono">
											{formatCurrency(budget)}
										</div>
										<p className="text-xs text-gray-400 mt-1">Saldo em caixa para contratações</p>

										<div className="mt-4 pt-4 border-t border-[#1f2937] text-xs text-gray-400 flex justify-between">
											<span>Região:</span>
											<span className="text-white font-semibold">{organization.region}</span>
										</div>
									</div>

									{/* Head Coach Profile Card */}
									<div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xs flex flex-col justify-between">
										<div>
											<div className="flex justify-between items-start mb-4">
												<h3 className="text-gray-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
													<Award size={16} className="text-[#ff4655]" /> GM Profile
												</h3>
												<span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#0f1923] border border-[#ff4655]/40 text-[#ff4655]">
													OVR {manager.overallRating}
												</span>
											</div>

											<p className="text-base font-bold text-white">{manager.managerName}</p>
											<p className="text-xs text-gray-400 mt-0.5">{manager.originCity} • Nível {manager.coachLevel}</p>
											<p className="text-xs text-[#ff4655] font-semibold mt-1">{manager.reputation}</p>
										</div>

										<div className="mt-4 pt-4 border-t border-[#1f2937] flex items-center justify-between text-xs text-gray-400">
											<span>Etapa Atual:</span>
											<span className="text-white font-bold uppercase tracking-wider">Etapa 1 Pronta</span>
										</div>
									</div>
								</div>

								{/* Next Step Banner (Ready for Phase 2 validation) */}
								<div className="bg-[#111827] border border-[#ff4655]/30 p-6 rounded-xs flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
									<div className="space-y-1 text-center sm:text-left">
										<div className="flex items-center justify-center sm:justify-start gap-2 text-[#ff4655] text-xs font-black uppercase tracking-widest">
											<Star size={14} /> Próxima Etapa: Fase 2
										</div>
										<h4 className="text-lg font-black text-white uppercase">
											Mercado de Transferências & Recrutamento
										</h4>
										<p className="text-xs text-gray-400 max-w-2xl">
											A primeira etapa (Setup de GM, Franquias, Orçamentos e Layout Base) está finalizada e validada. Na Fase 2 implementaremos o catálogo com mais de 15 jogadores mundiais, regras de import, filtros de compra e deduct do saldo.
										</p>
									</div>

									<Button
										onClick={() => setCurrentView('transfers')}
										className="shrink-0 text-xs py-3 px-5"
									>
										Acessar Mercado <ChevronRight size={16} />
									</Button>
								</div>
							</>
						)}

						{/* Placeholder for Transfer Market (Phase 2 preview) */}
						{currentView === 'transfers' && (
							<div className="bg-[#111827] border border-[#1f2937] p-10 rounded-xs text-center space-y-4">
								<DollarSign size={48} className="mx-auto text-[#ff4655]" />
								<h3 className="text-2xl font-black uppercase text-white">Mercado de Transferências (Fase 2)</h3>
								<p className="text-gray-400 text-sm max-w-lg mx-auto">
									A Fase 1 (Estrutura Base & Identidade do GM) foi concluída com sucesso!
									Para iniciar a Fase 2 (criação do catálogo de jogadores, filtros, sistema de contratação e checagem de import rule), solicite o início da Fase 2.
								</p>
								<Button
									variant="secondary"
									onClick={() => setCurrentView('overview')}
									className="text-xs py-2 px-4 mx-auto"
								>
									Voltar ao Painel do Clube
								</Button>
							</div>
						)}

						{/* Placeholder for Squad Management (Phase 3 preview) */}
						{currentView === 'squad' && (
							<div className="bg-[#111827] border border-[#1f2937] p-10 rounded-xs text-center space-y-4">
								<Users size={48} className="mx-auto text-[#ff4655]" />
								<h3 className="text-2xl font-black uppercase text-white">Gestão Tática do Elenco (Fase 3)</h3>
								<p className="text-gray-400 text-sm max-w-lg mx-auto">
									Esta área será desbloqueada na Fase 3 após a montagem do mercado de contratações. Permitirá organizar a escalação dos 5 Titulares e 2 Reservas com bônus de IGL e validação de Roles.
								</p>
								<Button
									variant="secondary"
									onClick={() => setCurrentView('overview')}
									className="text-xs py-2 px-4 mx-auto"
								>
									Voltar ao Painel do Clube
								</Button>
							</div>
						)}
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
						<div
							className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0"
							style={{ backgroundColor: organization.color }}
						>
							{organization.name.charAt(0)}
						</div>
						<div>
							<h4 className="font-black text-white uppercase text-base">{organization.name}</h4>
							<p className="text-xs text-gray-400">
								Franquia Tier {organization.tier} • {organization.region} ({organization.country})
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
