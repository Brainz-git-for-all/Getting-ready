import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true, // Required to send and receive HttpOnly cookies
});

// Response Interceptor to handle expired tokens and prevent infinite loops
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 (Unauthorized) and we haven't retried this request yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            // BREAK THE LOOP: If the /refresh call itself returns a 401, give up
            if (originalRequest.url.includes('/auth/refresh')) {
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                // Attempt to refresh the access token via the refresh cookie
                await api.post('/auth/refresh');

                // If successful, the backend sent a new accessToken cookie.
                // We now retry the original request.
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails (e.g., refresh token is expired or missing)
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout'),
};

export const sprintService = {
    getAll: () => api.get('/sprints'),
    create: (sprintData) => api.post('/sprints', sprintData),
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
    delete: (id) => api.delete(`/sprints/${id}`)
};

export const habitService = {
    getAll: () => api.get('/habits'),
    create: (habitData) => api.post('/habits', habitData),
    delete: (id) => api.delete(`/habits/${id}`),

    // FETCH today's completed IDs for a specific user
    // Note: This matches your Spring Boot: /api/habits/log/user/{id}
    // But we need a GET mapping for this in your Controller too!
    getTodaysLog: (userId, date) => api.get(`/habits/log/user/${userId}?date=${date}`),

    // SAVE today's completed IDs
    saveTodaysLog: (userId, habitIds) => api.post(`/habits/log/user/${userId}`, habitIds)
};
export default api;