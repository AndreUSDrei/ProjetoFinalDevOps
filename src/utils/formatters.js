export const formatCurrency = (value) => {
	if (typeof value !== 'number') return '$0';
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	}).format(value);
};

export const formatCompactCurrency = (value) => {
	if (typeof value !== 'number') return '$0';
	if (value >= 1_000_000) {
		return `$${(value / 1_000_000).toFixed(1)}M`;
	}
	if (value >= 1_000) {
		return `$${(value / 1_000).toFixed(0)}K`;
	}
	return `$${value}`;
};

export const getTierBadgeClass = (tier) => {
	switch (tier) {
		case 'S':
			return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
		case 'A':
			return 'border-purple-500/50 text-purple-400 bg-purple-500/10 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
		case 'B':
			return 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]';
		case 'C':
		default:
			return 'border-gray-500/50 text-gray-400 bg-gray-500/10';
	}
};

