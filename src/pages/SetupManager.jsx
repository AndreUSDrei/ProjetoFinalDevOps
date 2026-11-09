import React, { useState } from 'react';
import { User, Globe, Award, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button';
import { useGame } from '../context/GameContext';

const SetupManager = () => {
	const { setManager, setGameState } = useGame();

	// Sem dados pré-preenchidos, tudo em português
	const [formData, setFormData] = useState({
		managerName: '',
		country: '',
		reputation: 'Promessa Regional',
	});

	const handleSubmit = (event) => {
		event.preventDefault();
		if (!formData.managerName.trim() || !formData.country.trim()) {
			alert('Por favor, preencha todos os campos obrigatórios.');
			return;
		}

		setManager({
			managerName: formData.managerName.trim(),
			country: formData.country.trim(),
			reputation: formData.reputation,
			get name() {
				return this.managerName;
			},
			get origin() {
				return this.country;
			},
		});

		setGameState('SELECT_ORG');
	};

	return (
		<div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f2937] to-[#0f1923]">
			<div className="w-full max-w-xl bg-[#111827]/95 backdrop-blur-md border border-[#374151] p-10 rounded-xs shadow-2xl relative overflow-hidden">
				{/* Detalhes visuais no tema Valorant */}
				<div className="absolute top-0 left-0 w-2 h-full bg-[#ff4655]" />
				<div className="absolute top-0 right-0 w-40 h-40 bg-[#ff4655] opacity-10 blur-[100px]" />

				<div className="mb-8 text-center relative z-10">
					<div className="inline-block px-3 py-1 bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-black uppercase tracking-widest rounded-xs mb-3">
						Circuito Oficial VCT 2026
					</div>
					<h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
						Criar <span className="text-[#ff4655]">Perfil</span>
					</h1>
					<p className="text-gray-400 font-medium text-sm">
						Registro de Treinador Principal / General Manager
					</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6 relative z-10">
					{/* Nome Completo */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
							<User size={15} className="text-[#ff4655]" /> Nome Completo
						</label>
						<input
							type="text"
							placeholder="Digite seu nome ou nickname..."
							value={formData.managerName}
							onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs placeholder-gray-600"
							required
						/>
					</div>

					{/* País de Origem */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
							<Globe size={15} className="text-[#ff4655]" /> País de Origem
						</label>
						<input
							type="text"
							placeholder="Ex: Brasil, Portugal, Argentina, Estados Unidos..."
							value={formData.country}
							onChange={(e) => setFormData({ ...formData, country: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs placeholder-gray-600"
							required
						/>
					</div>

					{/* Reputação Inicial */}
					<div className="space-y-2">
						<label className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
							<Award size={15} className="text-[#ff4655]" /> Reputação Inicial no Cenário
						</label>
						<select
							value={formData.reputation}
							onChange={(e) => setFormData({ ...formData, reputation: e.target.value })}
							className="w-full bg-[#0f1923] border border-[#374151] text-white p-3.5 focus:outline-none focus:border-[#ff4655] transition-colors font-medium text-base rounded-xs cursor-pointer"
						>
							<option value="Promessa Regional" className="bg-[#0f1923]">Promessa Regional (Início de Carreira)</option>
							<option value="Treinador Reconhecido" className="bg-[#0f1923]">Treinador Reconhecido (Experiência Nacional)</option>
							<option value="Estrategista Internacional" className="bg-[#0f1923]">Estrategista Internacional (Disputou Masters)</option>
							<option value="Mente Campeã Mundial" className="bg-[#0f1923]">Mente Campeã Mundial (Lenda do VALORANT)</option>
						</select>
					</div>

					<div className="pt-4">
						<Button type="submit" className="w-full py-4 text-base">
							Confirmar Registro e Ver Propostas <ChevronRight size={18} />
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default SetupManager;
