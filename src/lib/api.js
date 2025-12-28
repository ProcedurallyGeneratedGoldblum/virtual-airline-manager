// API client for backend communication
const API_URL = import.meta.env.VITE_API_URL || '';

class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Company endpoints
    async getCompany() {
        return this.request('/api/company');
    }

    async updateCompany(data) {
        return this.request('/api/company', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Pilot endpoints
    async getPilot() {
        return this.request('/api/pilot');
    }

    async updatePilot(data) {
        return this.request('/api/pilot', {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Fleet endpoints
    async getFleet() {
        return this.request('/api/fleet');
    }

    async addAircraft(data) {
        return this.request('/api/fleet', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async updateAircraft(id, data) {
        return this.request(`/api/fleet/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteAircraft(id) {
        return this.request(`/api/fleet/${id}`, {
            method: 'DELETE',
        });
    }

    // Active flights endpoints
    async getActiveFlights() {
        return this.request('/api/flights/active');
    }

    async addActiveFlight(data) {
        return this.request('/api/flights/active', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async deleteActiveFlight(id) {
        return this.request(`/api/flights/active/${id}`, {
            method: 'DELETE',
        });
    }

    // Completed flights endpoints
    async getCompletedFlights() {
        return this.request('/api/flights/completed');
    }

    async addCompletedFlight(data) {
        return this.request('/api/flights/completed', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Missions endpoints
    async getMissions() {
        return this.request('/api/missions');
    }

    async refreshMissions(missions) {
        return this.request('/api/missions/refresh', {
            method: 'POST',
            body: JSON.stringify({ missions }),
        });
    }

    // Logistics endpoints
    async refuelAircraft(id, amount, cost) {
        return this.request(`/api/fleet/${id}/refuel`, {
            method: 'POST',
            body: JSON.stringify({ amount, cost }),
        });
    }

    async repairAircraft(id, cost, type = 'full') {
        return this.request(`/api/fleet/${id}/repair`, {
            method: 'POST',
            body: JSON.stringify({ cost, type }),
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

export const api = new APIClient(API_URL);
export default api;
