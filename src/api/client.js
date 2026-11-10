const base = import.meta.env.VITE_API_URL ?? '';

const request = async (path, options = {}) => {
	const response = await fetch(`${base}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			...(options.headers || {}),
		},
		...options,
	});

	if (response.status === 404) return null;
	if (!response.ok) {
		throw new Error(`API ${response.status}: ${path}`);
	}
	if (response.status === 204) return null;
	return response.json();
};

export const api = {
	health: () => request('/health'),
	getPlayers: () => request('/api/players'),
	getOrganizations: () => request('/api/organizations'),
	getSave: (slot = 'default') => request(`/api/saves/${slot}`),
	putSave: (slot, payload) =>
		request(`/api/saves/${slot}`, {
			method: 'PUT',
			body: JSON.stringify(payload),
		}),
};

export const LOCAL_SAVE_KEY = 'vac-save';
export const SAVE_SLOT = 'default';

export const withManagerGetters = (manager = {}) => ({
	managerName: manager.managerName || '',
	country: manager.country || '',
	reputation: manager.reputation || 'Promessa Regional',
	get name() {
		return this.managerName;
	},
	get origin() {
		return this.country;
	},
});

export const serializeManager = (manager = {}) => ({
	managerName: manager.managerName || '',
	country: manager.country || '',
	reputation: manager.reputation || 'Promessa Regional',
});
