import React, { useEffect, useState } from 'react';

const getLogoPath = (team) => {
	if (!team?.id) return null;
	const extension = team.id === 'geng' ? 'webp' : 'png';
	return `/logos/teams/${team.id}.${extension}`;
};

const TeamLogo = ({ team, className = '', imageClassName = '' }) => {
	const [failed, setFailed] = useState(false);
	const logoPath = getLogoPath(team);

	useEffect(() => {
		setFailed(false);
	}, [team?.id]);

	const color = team?.color || '#ff4655';

	return (
		<div
			className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#0f1923] ${className}`}
			style={{ boxShadow: `0 0 16px ${color}22` }}
			role="img"
			aria-label={`${team?.name || 'Equipe'} logo`}
		>
			{failed || !logoPath ? (
				<span
					className="flex h-full w-full items-center justify-center font-black text-white"
					style={{ backgroundColor: color }}
					aria-hidden="true"
				>
					{team?.name?.charAt(0) || '?'}
				</span>
			) : (
				<img
					src={logoPath}
					alt=""
					className={`h-full w-full object-contain p-[12%] ${imageClassName}`}
					loading="lazy"
					onError={() => setFailed(true)}
				/>
			)}
		</div>
	);
};

export default TeamLogo;
