import React, { useState } from 'react';
import { User, MapPin, Trophy, Star, Award, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useGame } from '../context/GameContext';

const SetupManager = () => {
	const { setManager, setGameState } = useGame();

	const [formData, setFormData] = useState({
		managerName: 'Andreus Vinícius Araújo de Andrade',
		originCity: 'Wanel Ville',
		coachLevel: 25,
		overallRating: 82,
		reputation: 'National Prospect',
	});

	const handleSubmit = (event) => {
		event.preventDefault();
		setManager({
			...formData,
			coachLevel: Number(formData.coachLevel),
			overallRating: Number(formData.overallRating),
			get name() {
				return this.managerName;
			},
			get origin() {
				return this.originCity;
			},
			get experience() {
				return `Nível ${this.coachLevel} (Overall ${this.overallRating})`;
			},
		});
		setGameState('SELECT_ORG');
	};

	return (
		<div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f2937] to-[#0f1923]">
			<div className="w-full max-w-2xl bg-[#111827]/95 backdrop-blur-md border border-[#374151] p-10 rounded-sm shadow-2xl relative overflow-hidden">
				{/* Visual Valorant accents */}
				<div className="absolute top-0 left-0 w-2 h-full bg-[#ff4655]" />
				<div className="absolute top-0 right-0 w-40 h-40 bg-[#ff4655] opacity-10 blur-[100px]" />

				<div className="mb-8 text-center relative z-10">
					<div className="inline-block px-3 py-1 bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-black uppercase tracking-widest rounded-xs mb-3">
						Etapa 1 • VCT Season 2026
					</div>
					<h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
						Create <span className="text-[#ff4655]">Profile</span>
					</h1>
					<p className="text-gray-400 font-medium">Head Coach / General Manager Registry</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-5 relative z-10">
					{/* Full Name */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
							<User size={14} className="text-[#ff4655]" /> Full Name
						</label>
						<input
							type="text"
							value={formData.managerName}
							onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs"
							required
						/>
					</div>

					{/* Origin City */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
							<MapPin size={14} className="text-[#ff4655]" /> Origin / City
						</label>
						<input
							type="text"
							value={formData.originCity}
							onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs"
							required
						/>
					</div>

					{/* Coach Level and Overall Rating (Grid) */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
								<Trophy size={14} className="text-[#ff4655]" /> Coach Level
							</label>
							<input
								type="number"
								min="1"
								max="99"
								value={formData.coachLevel}
								onChange={(e) => setFormData({ ...formData, coachLevel: e.target.value })}
								className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-mono font-bold text-base rounded-xs"
								required
							/>
						</div>

						<div className="space-y-1.5">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
								<Star size={14} className="text-[#ff4655]" /> Overall Rating (OVR)
							</label>
							<input
								type="number"
								min="50"
								max="99"
								value={formData.overallRating}
								onChange={(e) => setFormData({ ...formData, overallRating: e.target.value })}
								className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-mono font-bold text-base rounded-xs"
								required
							/>
						</div>
					</div>

					{/* Reputation */}
					<div className="space-y-1.5">
						<label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
							<Award size={14} className="text-[#ff4655]" /> Reputation
						</label>
						<select
							value={formData.reputation}
							onChange={(e) => setFormData({ ...formData, reputation: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs cursor-pointer"
						>
							<option value="Rookie Prospect">Rookie Prospect</option>
							<option value="Regional Coach">Regional Coach</option>
							<option value="National Prospect">National Prospect</option>
							<option value="International Contender">International Contender</option>
							<option value="World Champion Mastermind">World Champion Mastermind</option>
						</select>
					</div>

					<div className="pt-4">
						<Button type="submit" className="w-full py-4 text-base">
							Confirm Registry <ChevronRight size={18} />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SetupManager;
