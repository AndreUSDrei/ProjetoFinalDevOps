import React, { useState } from 'react';
import { Briefcase, DollarSign, ShieldAlert, Star, Trophy, Globe, Filter, Search, Award } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useGame } from '../context/GameContext';
import teams from '../data/teams.json';
import { formatCurrency } from '../utils/formatters';

const SelectOrg = () => {
	const { setOrganization, setGameState, manager } = useGame();
	const [selectedId, setSelectedId] = useState(teams[0]?.id || null);
	const [selectedLeague, setSelectedLeague] = useState('ALL');
	const [selectedTier, setSelectedTier] = useState('ALL');
	const [searchQuery, setSearchQuery] = useState('');

	const filteredTeams = teams.filter((team) => {
		const matchesLeague = selectedLeague === 'ALL' || team.league === selectedLeague || team.region === selectedLeague;
		const matchesTier = selectedTier === 'ALL' || team.tier === selectedTier;
		const matchesSearch =
			team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			team.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
			team.league.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesLeague && matchesTier && matchesSearch;
	});

	const selectedOrganization = teams.find((org) => org.id === selectedId);

	const handleSignContract = () => {
		if (!selectedOrganization) return;
		setOrganization(selectedOrganization);
		setGameState('DASHBOARD');
	};

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

	return (
		<div className="min-h-screen bg-[#0f1923] p-6 lg:p-8 flex flex-col">
			{/* Top Header */}
			<header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[#1f2937] pb-6">
				<div>
					<div className="flex items-center gap-2">
						<span className="h-2 w-2 rounded-full bg-[#ff4655]" />
						<span className="text-xs font-bold uppercase tracking-widest text-[#ff4655]">
							Circuito Oficial VCT 2026 • Franquias Parceiras Riot Games
						</span>
					</div>
					<h1 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter mt-1">
						Propostas de <span className="text-[#ff4655]">Emprego</span>
					</h1>
					<p className="text-gray-400 mt-1 text-sm md:text-base">
						Bem-vindo, <span className="text-white font-bold">{manager.managerName || 'Treinador'}</span> ({manager.reputation}). Escolha uma organização oficial do VCT para iniciar sua carreira.
					</p>
				</div>

				{/* Filters Bar */}
				<div className="flex flex-wrap items-center gap-3">
					{/* Search Box */}
					<div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xs">
						<Search size={14} className="text-gray-400" />
						<input
							type="text"
							placeholder="Buscar time ou país..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="bg-transparent text-white text-xs font-medium focus:outline-none placeholder-gray-500 w-36"
						/>
					</div>

					{/* League Filter */}
					<div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xs">
						<Globe size={14} className="text-gray-400" />
						<span className="text-xs text-gray-400 font-bold uppercase">Liga:</span>
						<select
							value={selectedLeague}
							onChange={(e) => setSelectedLeague(e.target.value)}
							className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
						>
							<option value="ALL" className="bg-[#111827]">Todas as Ligas</option>
							<option value="VCT Americas" className="bg-[#111827]">VCT Americas</option>
							<option value="VCT EMEA" className="bg-[#111827]">VCT EMEA</option>
							<option value="VCT Pacific" className="bg-[#111827]">VCT Pacific</option>
							<option value="VCT CN" className="bg-[#111827]">VCT China</option>
						</select>
					</div>

					{/* Tier Filter */}
					<div className="flex items-center gap-2 bg-[#111827] border border-[#1f2937] px-3 py-1.5 rounded-xs">
						<Trophy size={14} className="text-gray-400" />
						<span className="text-xs text-gray-400 font-bold uppercase">Tier:</span>
						<select
							value={selectedTier}
							onChange={(e) => setSelectedTier(e.target.value)}
							className="bg-transparent text-white text-xs font-semibold focus:outline-none cursor-pointer"
						>
							<option value="ALL" className="bg-[#111827]">Todos os Tiers</option>
							<option value="S" className="bg-[#111827]">Tier S (Mundiais)</option>
							<option value="A" className="bg-[#111827]">Tier A (Playoffs)</option>
							<option value="B" className="bg-[#111827]">Tier B (Regionais)</option>
							<option value="C" className="bg-[#111827]">Tier C (Ascension)</option>
						</select>
					</div>
				</div>
			</header>

			{/* Main Grid: Teams & Contract Sticky Panel */}
			<div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Teams list */}
				<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max overflow-y-auto pr-1 pb-16 max-h-[calc(100vh-210px)]">
					{filteredTeams.map((org) => {
						const isSelected = selectedId === org.id;

						return (
							<button
								key={org.id}
								type="button"
								onClick={() => setSelectedId(org.id)}
								aria-pressed={isSelected}
								className={`p-5 text-left rounded-xs border cursor-pointer transition-all duration-200 relative overflow-hidden group ${
									isSelected
										? 'bg-[#111827] border-[#ff4655] shadow-[0_0_20px_rgba(255,70,85,0.2)] ring-1 ring-[#ff4655]'
										: 'bg-[#111827]/60 border-[#1f2937] hover:border-gray-500 hover:bg-[#111827]'
								}`}
							>
								{/* Left Accent indicator when selected */}
								{isSelected && <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]" />}

								{org.status === 'Ascended' && (
									<div className="absolute top-0 right-0 bg-[#0f1923] border-b border-l border-yellow-500/40 text-yellow-400 text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-bl-xs">
										Acesso Ascension
									</div>
								)}

								{org.tier === 'S' && org.status !== 'Ascended' && (
									<div className="absolute top-0 right-0 bg-[#ff4655] text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-widest rounded-bl-xs">
										Gigante Mundial
									</div>
								)}

								<div className="flex justify-between items-start mb-3">
									<h3 className="text-xl font-black text-white tracking-wide flex items-center gap-2.5">
										<span
											className="w-3.5 h-3.5 rounded-full ring-2 ring-white/20 shrink-0"
											style={{ backgroundColor: org.color }}
										/>
										<span>{org.name}</span>
									</h3>
									<Badge variant={getTierBadgeVariant(org.tier)}>Tier {org.tier}</Badge>
								</div>

								<div className="space-y-1.5 text-xs text-gray-400">
									<div className="flex justify-between">
										<span>Liga Oficial:</span>
										<span className="text-gray-200 font-semibold">{org.league} ({org.country})</span>
									</div>
									<div className="flex justify-between">
										<span>Orçamento Anual:</span>
										<span className="text-green-400 font-mono font-bold text-sm">
											{formatCurrency(org.budget)}
										</span>
									</div>
								</div>
							</button>
						);
					})}

					{filteredTeams.length === 0 && (
						<div className="col-span-2 py-16 text-center text-gray-500">
							Nenhuma franquia encontrada com os filtros selecionados.
						</div>
					)}
				</div>

				{/* Right: Contract Details Card */}
				<div className="lg:col-span-1">
					<div className="bg-[#111827] border border-[#1f2937] p-6 sticky top-6 rounded-xs shadow-xl">
						<h2 className="text-lg font-black text-white uppercase border-b border-[#1f2937] pb-3 mb-4 flex items-center gap-2">
							<Briefcase className="text-[#ff4655]" size={18} /> Proposta de Contrato
						</h2>

						{selectedOrganization ? (
							<div className="space-y-5 animate-in fade-in duration-300">
								<div className="text-center py-5 bg-[#0f1923] rounded-xs border border-[#1f2937] relative overflow-hidden">
									<div
										className="w-14 h-14 mx-auto rounded-full mb-3 flex items-center justify-center font-black text-white text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20"
										style={{ backgroundColor: selectedOrganization.color }}
									>
										{selectedOrganization.name.charAt(0)}
									</div>
									<h3 className="text-2xl font-black text-white tracking-tighter">
										{selectedOrganization.name}
									</h3>
									<p className="text-gray-400 text-xs mt-1">
										{selectedOrganization.league} • {selectedOrganization.country} ({selectedOrganization.status})
									</p>
								</div>

								{/* Transfer budget stat */}
								<div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xs">
									<p className="text-[11px] text-green-400 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
										<DollarSign size={14} /> Teto Orçamentário Anual
									</p>
									<p className="text-3xl font-mono text-white font-black">
										{formatCurrency(selectedOrganization.budget)}
									</p>
								</div>

								{/* Board Expectations Box */}
								<div className="bg-[#0f1923] border border-[#1f2937] p-4 rounded-xs space-y-1.5">
									<p className="text-xs text-yellow-500 uppercase font-black tracking-widest flex items-center gap-1.5">
										<ShieldAlert size={14} /> Exigência da Diretoria
									</p>
									<p className="text-xs text-gray-300 leading-relaxed">
										{selectedOrganization.expectation}
									</p>
								</div>

								{/* Sign Contract CTA */}
								<Button onClick={handleSignContract} className="w-full py-3.5 text-sm mt-4">
									Assinar Contrato Oficial <Star size={16} />
								</Button>
							</div>
						) : (
							<div className="h-64 flex flex-col items-center justify-center text-gray-600 space-y-3">
								<Trophy size={42} className="opacity-20" />
								<p className="text-center text-sm font-medium">
									Selecione uma organização
									<br />
									para analisar a proposta.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SelectOrg;
