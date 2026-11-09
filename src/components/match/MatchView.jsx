import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, FastForward, SkipForward, Trophy, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import { getMap } from '../../utils/maps';
import { positionAt } from '../../utils/matchEngine';

const ROUND_SECONDS = 5;
const CANVAS_W = 760;
const CANVAS_H = 430;

const MatchView = ({ match, onComplete }) => {
	const canvasRef = useRef(null);
	const timeRef = useRef(0);
	const roundRef = useRef(0);
	const playingRef = useRef(true);
	const speedRef = useRef(1);
	const finishedRef = useRef(false);
	const eventCountRef = useRef(0);
	const timerRef = useRef(0);

	const [uiRound, setUiRound] = useState(0);
	const [feed, setFeed] = useState([]);
	const [playing, setPlaying] = useState(true);
	const [speed, setSpeed] = useState(1);
	const [finished, setFinished] = useState(false);

	const rounds = match.rounds;
	const map = getMap(match.mapId);

	const togglePlay = () => {
		playingRef.current = !playingRef.current;
		setPlaying(playingRef.current);
	};
	const changeSpeed = (v) => {
		speedRef.current = v;
		setSpeed(v);
	};
	const skipRound = () => {
		timeRef.current = 1;
	};
	const skipAll = () => {
		roundRef.current = rounds.length;
		timeRef.current = 0;
		finishedRef.current = true;
		playingRef.current = false;
		setFinished(true);
		setPlaying(false);
		setUiRound(rounds.length);
		setFeed(
			rounds.flatMap((r) => r.events.filter((e) => e.type !== 'roundEnd').map((e) => ({ ...e, round: r.number }))).slice(-40)
		);
	};
	const replay = () => {
		roundRef.current = 0;
		timeRef.current = 0;
		eventCountRef.current = 0;
		finishedRef.current = false;
		playingRef.current = true;
		setFinished(false);
		setPlaying(true);
		setUiRound(0);
		setFeed([]);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		const TILE = 17;
		const cx = CANVAS_W / 2;
		const cy = 34;
		const iso = (x, y) => [cx + (x - y) * TILE, cy + (x + y) * TILE * 0.5];

		const diamond = (pts) => {
			ctx.beginPath();
			ctx.moveTo(pts[0][0], pts[0][1]);
			for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
			ctx.closePath();
		};

		const drawSite = (site, label, color) => {
			const pts = [iso(site.x - 2, site.y - 2), iso(site.x + 2, site.y - 2), iso(site.x + 2, site.y + 2), iso(site.x - 2, site.y + 2)];
			diamond(pts);
			ctx.fillStyle = `${color}22`;
			ctx.fill();
			ctx.strokeStyle = `${color}88`;
			ctx.lineWidth = 1;
			ctx.stroke();
			const [lx, ly] = iso(site.x, site.y);
			ctx.fillStyle = color;
			ctx.font = 'bold 14px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(label, lx, ly + 5);
		};

		const drawBox = (b) => {
			const z = 10;
			const t = [iso(b.x, b.y), iso(b.x + b.w, b.y), iso(b.x + b.w, b.y + b.h), iso(b.x, b.y + b.h)].map(([x, y]) => [x, y - z]);
			const g = [iso(b.x, b.y), iso(b.x + b.w, b.y), iso(b.x + b.w, b.y + b.h), iso(b.x, b.y + b.h)];
			// left face
			ctx.beginPath();
			ctx.moveTo(t[3][0], t[3][1]);
			ctx.lineTo(t[2][0], t[2][1]);
			ctx.lineTo(g[2][0], g[2][1]);
			ctx.lineTo(g[3][0], g[3][1]);
			ctx.closePath();
			ctx.fillStyle = '#0b1220';
			ctx.fill();
			// right face
			ctx.beginPath();
			ctx.moveTo(t[1][0], t[1][1]);
			ctx.lineTo(t[2][0], t[2][1]);
			ctx.lineTo(g[2][0], g[2][1]);
			ctx.lineTo(g[1][0], g[1][1]);
			ctx.closePath();
			ctx.fillStyle = '#161e2b';
			ctx.fill();
			// top face
			diamond(t);
			ctx.fillStyle = '#1f2937';
			ctx.fill();
			ctx.strokeStyle = '#374151';
			ctx.stroke();
		};

		const draw = () => {
			ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
			ctx.fillStyle = '#0f1923';
			ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

			// floor
			diamond([iso(0, 0), iso(20, 0), iso(20, 20), iso(0, 20)]);
			ctx.fillStyle = '#111827';
			ctx.fill();
			ctx.strokeStyle = '#1f2937';
			ctx.lineWidth = 1;
			ctx.stroke();
			ctx.strokeStyle = '#1a2432';
			for (let i = 2; i < 20; i += 2) {
				let a = iso(i, 0);
				let b = iso(i, 20);
				ctx.beginPath();
				ctx.moveTo(a[0], a[1]);
				ctx.lineTo(b[0], b[1]);
				ctx.stroke();
				a = iso(0, i);
				b = iso(20, i);
				ctx.beginPath();
				ctx.moveTo(a[0], a[1]);
				ctx.lineTo(b[0], b[1]);
				ctx.stroke();
			}

			drawSite(map.siteA, 'A', '#ff4655');
			drawSite(map.siteB, 'B', '#38bdf8');
			map.boxes.forEach(drawBox);

			const rIdx = Math.min(roundRef.current, rounds.length - 1);
			const round = rounds[rIdx];
			const time = finishedRef.current ? 1 : timeRef.current;

			// spike plant marker
			const plant = round.events.find((e) => e.type === 'plant');
			const defuse = round.events.find((e) => e.type === 'defuse');
			const detonate = round.events.find((e) => e.type === 'detonate');
			const site = round.site === 'A' ? map.siteA : map.siteB;
			if (plant && time >= plant.t && !(defuse && time >= defuse.t) && !(detonate && time >= detonate.t)) {
				const [sx, sy] = iso(site.x, site.y);
				ctx.fillStyle = '#facc15';
				ctx.beginPath();
				ctx.arc(sx, sy - 4, 4 + Math.sin(time * 40) * 1.5, 0, Math.PI * 2);
				ctx.fill();
			}

			// players (painter order by depth)
			const all = [
				...match.teamA.players.map((p) => ({ ...p, color: match.teamA.color })),
				...match.teamB.players.map((p) => ({ ...p, color: match.teamB.color })),
			];
			const rendered = all.map((p) => {
				const path = round.moves[p.id];
				const pos = positionAt(path, time);
				const dead = round.events.some((e) => e.type === 'kill' && e.targetId === p.id && e.t <= time);
				return { p, pos, dead };
			});
			rendered.sort((a, b) => a.pos.x + a.pos.y - (b.pos.x + b.pos.y));
			rendered.forEach(({ p, pos, dead }) => {
				const [x, y] = iso(pos.x, pos.y);
				if (dead) {
					ctx.strokeStyle = '#4b5563';
					ctx.lineWidth = 1.5;
					ctx.beginPath();
					ctx.moveTo(x - 4, y - 4);
					ctx.lineTo(x + 4, y + 4);
					ctx.moveTo(x + 4, y - 4);
					ctx.lineTo(x - 4, y + 4);
					ctx.stroke();
					return;
				}
				ctx.fillStyle = 'rgba(0,0,0,0.4)';
				ctx.beginPath();
				ctx.ellipse(x, y + 3, 6, 2.5, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.fillStyle = p.color;
				ctx.beginPath();
				ctx.arc(x, y - 4, 5, 0, Math.PI * 2);
				ctx.fill();
				ctx.strokeStyle = '#0f1923';
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.fillStyle = '#ece8e1';
				ctx.font = '9px sans-serif';
				ctx.textAlign = 'center';
				ctx.fillText(p.nickname, x, y - 12);
			});

			// kill flashes
			round.events
				.filter((e) => e.type === 'kill' && time >= e.t && time - e.t < 0.1)
				.forEach((e) => {
					const pos = positionAt(round.moves[e.targetId], e.t);
					const [x, y] = iso(pos.x, pos.y);
					ctx.strokeStyle = '#ff4655';
					ctx.lineWidth = 2;
					ctx.beginPath();
					ctx.arc(x, y - 4, 8 + (time - e.t) * 60, 0, Math.PI * 2);
					ctx.stroke();
				});
		};

		let last = performance.now();
		const tick = () => {
			const now = performance.now();
			const dt = Math.min(1, (now - last) / 1000);
			last = now;
			if (playingRef.current && !finishedRef.current) {
				timeRef.current += (dt * speedRef.current) / ROUND_SECONDS;
				if (timeRef.current >= 1) {
					roundRef.current += 1;
					timeRef.current = 0;
					eventCountRef.current = 0;
					if (roundRef.current >= rounds.length) {
						finishedRef.current = true;
						playingRef.current = false;
						setFinished(true);
						setPlaying(false);
					}
					setUiRound(roundRef.current);
				}
				const r = rounds[Math.min(roundRef.current, rounds.length - 1)];
				const visible = r.events.filter((e) => e.t <= timeRef.current && e.type !== 'roundEnd');
				if (visible.length > eventCountRef.current) {
					const add = visible.slice(eventCountRef.current).map((e) => ({ ...e, round: r.number }));
					eventCountRef.current = visible.length;
					setFeed((f) => [...f, ...add].slice(-40));
				}
			}
			draw();
		};
		timerRef.current = setInterval(tick, 50);
		return () => clearInterval(timerRef.current);
	}, [match, rounds, map]);

	const prevRound = rounds[uiRound - 1];
	const liveA = finished ? match.scoreA : prevRound ? prevRound.scoreA : 0;
	const liveB = finished ? match.scoreB : prevRound ? prevRound.scoreB : 0;
	const roundLabel = finished ? rounds.length : Math.min(uiRound + 1, rounds.length);

	const feedText = (e) => {
		switch (e.type) {
			case 'kill':
				return `${e.actorNick} eliminou ${e.targetNick}`;
			case 'plant':
				return `${e.actorNick} plantou a spike`;
			case 'defuse':
				return `${e.actorNick} desarmou a spike`;
			case 'detonate':
				return 'Spike detonada';
			default:
				return e.type;
		}
	};

	return (
		<div className="space-y-4">
			{/* Scoreboard */}
			<div className="flex items-center justify-between bg-[#111827] border border-[#1f2937] rounded-xs px-6 py-3">
				<div className="flex items-center gap-3">
					<span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamA.color }} />
					<span className="font-black uppercase tracking-wider">{match.teamA.name}</span>
				</div>
				<div className="text-center">
					<div className="font-mono text-3xl font-black text-white">
						{liveA} <span className="text-gray-500 text-xl">:</span> {liveB}
					</div>
					<div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
						{map.name} • Round {roundLabel}/{rounds.length}
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="font-black uppercase tracking-wider">{match.teamB.name}</span>
					<span className="w-3 h-3 rounded-full" style={{ backgroundColor: match.teamB.color }} />
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Canvas */}
				<div className="lg:col-span-2 relative bg-[#0f1923] border border-[#1f2937] rounded-xs overflow-hidden">
					<canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="w-full block" />
					{finished && (
						<div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
							<div className="text-center space-y-3 max-w-md">
								<Trophy size={40} className="mx-auto text-yellow-400" />
								<h3 className="text-2xl font-black uppercase tracking-tighter text-white">{match.winnerName} vence!</h3>
								<p className="font-mono text-xl text-gray-300">
									{match.scoreA} : {match.scoreB}
								</p>
								{match.mvp && (
									<p className="text-sm text-gray-400">
										MVP: <span className="text-[#ff4655] font-bold">{match.mvp.nickname}</span> ({match.mvp.stats.kills} kills)
									</p>
								)}
								<div className="flex gap-2 justify-center pt-2">
									<Button variant="outline" onClick={replay} className="text-xs py-2 px-4">
										<RotateCcw size={14} /> Rever
									</Button>
									<Button onClick={() => onComplete(match)} className="text-xs py-2 px-4">
										Concluir e aplicar evolução
									</Button>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Event feed + controls */}
				<div className="flex flex-col gap-4">
					<div className="bg-[#111827] border border-[#1f2937] rounded-xs p-4 flex items-center justify-between gap-2">
						<button
							onClick={togglePlay}
							disabled={finished}
							className="p-2 rounded-xs bg-[#1f2937] hover:bg-[#374151] text-white disabled:opacity-40"
						>
							{playing ? <Pause size={16} /> : <Play size={16} />}
						</button>
						<select
							value={speed}
							onChange={(e) => changeSpeed(Number(e.target.value))}
							className="bg-[#0f1923] border border-[#1f2937] text-xs font-bold rounded-xs px-2 py-2 text-gray-300"
						>
							<option value={1}>1x</option>
							<option value={2}>2x</option>
							<option value={4}>4x</option>
						</select>
						<button onClick={skipRound} disabled={finished} className="p-2 rounded-xs bg-[#1f2937] hover:bg-[#374151] text-white disabled:opacity-40" title="Pular round">
							<FastForward size={16} />
						</button>
						<button onClick={skipAll} disabled={finished} className="p-2 rounded-xs bg-[#1f2937] hover:bg-[#374151] text-white disabled:opacity-40" title="Pular partida">
							<SkipForward size={16} />
						</button>
					</div>
					<div className="bg-[#111827] border border-[#1f2937] rounded-xs p-4 flex-1 overflow-y-auto max-h-[340px]">
						<h4 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Feed da Partida</h4>
						<div className="space-y-1.5">
							{feed.length === 0 && <p className="text-xs text-gray-600">Aguardando ação...</p>}
							{feed.map((e, i) => (
								<div key={i} className="text-xs text-gray-300 flex gap-2">
									<span className="text-gray-600 font-mono shrink-0">R{e.round}</span>
									<span className={e.type === 'kill' ? 'text-gray-300' : 'text-yellow-400'}>{feedText(e)}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MatchView;