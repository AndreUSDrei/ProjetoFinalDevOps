import React, { useState } from 'react';
import { Swords, MapPin, Play, Trophy, TrendingUp, X } from 'lucide-react';
import Button from '../components/ui/Button';
import MatchView from '../components/match/MatchView';
import { useGame } from '../context/GameContext';
import teams from '../data/teams.json';
import { MAPS } from '../utils/maps';
import { simulateMatch, teamStrength } from '../utils/matchEngine';

const MatchSim = () => {
	const { organization, roster, marketPlayers, matchHistory, recordMatchResult } = useGame();
	const [opponentId, setOpponentId] = useState('');
	const [mapId, setMapId] = useState(MAPS[0].id);
	const [match, setMatch] = useState(null);
	const [lastChanges, setLastChanges] = useState(null);

	if (!organization) return null;

	const opponents = teams.filter((t) => t.name !== organization.name);
	const opponent = opponents.find((t) => t.id === opponentId) || opponents[0];
	const opponentStarters = marketPlayers
		.filter((p) => p.currentTeam && p.currentTeam.toLowerCase() === opponent.name.toLowerCase())
		.slice(0, 5);

	const myTeam = {
		name: organization.name,
		color: organization.color,
		region: organization.region,
		starters: roster.starters,
	};
	const oppTeam = {
		name: opponent.name,
		color: opponent.color,
		region: opponent.region,
		starters: opponentStarters,
	};
	const myStrength = Math.round(teamStrength(myTeam));
	const oppStrength = Math.round(teamStrength(oppTeam));
	const canSimulate = roster.starters.length === 5 && opponentStarters.length === 5;

	const handleSimulate = () => {
		const result = simulateMatch({ teamA: myTeam, teamB: oppTeam, mapId, seed: Date.now() });
		setLastChanges(null);
		setMatch(result);
	};

	const handleComplete = (result) => {
		const changes = recordMatchResult(result);
		setLastChanges(changes);
		setMatch(null);
	};

	if (match) {
		return (
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
						<Swords size={20} className="text-[#ff4655]" /> Partida ao Vivo
					</h2>
					<button onClick={() => setMatch(null)} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
						<X size={14} /> Abortar
					</button>
				</div>
				<MatchView match={match} onComplete={handleComplete} />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
				<Swords size={20} className="text-[#ff4655]" /> Simulação de Partidas
			</h2>

			{lastChanges && (
				<div className="p-4 bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm rounded-xs">
					<p className="font-bold flex items-center gap-2 mb-1">
						<TrendingUp size={16} /> Evolução pós-partida
					</p>
					{lastChanges.length === 0 ? (
						<p className="text-xs text-gray-400">Nenhum atleta evoluiu nesta partida.</p>
					) : (
						<ul className="text-xs space-y-0.5">
							{lastChanges.map((c) => (
								<li key={c.id}>
									{c.nickname}: OVR {c.from} → <span className="font-bold text-emerald-400">{c.to}</span>
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{/* Setup panel */}
			<div className="bg-[#111827] border border-[#1f2937] rounded-xs p-6 space-y-5">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2">Oponente</label>
						<select
							value={opponent.id}
							onChange={(e) => setOpponentId(e.target.value)}
							className="w-full bg-[#0f1923] border border-[#1f2937] rounded-xs px-3 py-2.5 text-sm text-gray-200"
						>
							{opponents.map((t) => (
								<option key={t.id} value={t.id}>
									{t.name} ({t.league})
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="text-xs font-black uppercase tracking-widest text-gray-500 block mb-2 flex items-center gap-1">
							<MapPin size={12} /> Mapa
						</label>
						<select
							value={mapId}
							onChange={(e) => setMapId(e.target.value)}
							className="w-full bg-[#0f1923] border border-[#1f2937] rounded-xs px-3 py-2.5 text-sm text-gray-200"
						>
							{MAPS.map((m) => (
								<option key={m.id} value={m.id}>
									{m.name}
								</option>
							))}
						</select>
					</div>
				</div>

				{/* Strength preview */}
				<div className="flex items-center justify-between bg-[#0f1923] border border-[#1f2937] rounded-xs px-5 py-4">
					<div className="text-center">
						<p className="font-black uppercase text-sm" style={{ color: organization.color }}>
							{organization.name}
						</p>
						<p className="font-mono text-2xl font-black text-white">{myStrength}</p>
						<p className="text-[10px] uppercase text-gray-500 font-bold">Força do quinteto</p>
					</div>
					<span className="text-gray-600 font-black text-xl">VS</span>
					<div className="text-center">
						<p className="font-black uppercase text-sm" style={{ color: opponent.color }}>
							{opponent.name}
						</p>
						<p className="font-mono text-2xl font-black text-white">{oppStrength}</p>
						<p className="text-[10px] uppercase text-gray-500 font-bold">Força do quinteto</p>
					</div>
				</div>

				{!canSimulate && (
					<p className="text-xs text-amber-400">
						É preciso ter 5 titulares escalados e o oponente precisa ter 5 atletas no BD para simular.
					</p>
				)}
				<Button onClick={handleSimulate} disabled={!canSimulate} className="text-sm py-3 px-6">
					<Play size={16} /> Simular Partida
				</Button>
			</div>

			{/* History */}
			<div className="bg-[#111827] border border-[#1f2937] rounded-xs p-6">
				<h3 className="text-sm font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
					<Trophy size={14} /> Histórico de Partidas
				</h3>
				{matchHistory.length === 0 ? (
					<p className="text-xs text-gray-600">Nenhuma partida simulada ainda.</p>
				) : (
					<div className="space-y-2">
						{matchHistory.map((h) => (
							<div key={h.id} className="flex items-center justify-between bg-[#0f1923] border border-[#1f2937] rounded-xs px-4 py-2 text-xs">
								<span className="text-gray-300 font-semibold">
									{h.teamAName} <span className="font-mono text-white">{h.scoreA}:{h.scoreB}</span> {h.teamBName}
								</span>
								<span className="text-gray-500">
									{h.mapName} • MVP {h.mvpNick || '-'} • <span className="text-[#ff4655] font-bold">{h.winnerName}</span>
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default MatchSim;