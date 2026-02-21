import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true
});

// Response Interceptor to handle expired tokens
api.interceptors.response.use(
    (response) => response, // Return response if successful
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 (Unauthorized) and we haven't tried to retry yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the access token
                await api.post('/auth/refresh');

                // If successful, the new accessToken cookie is set, now retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, the user is truly logged out
                console.error("Refresh token expired. Redirecting to login...");
                // Optional: window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export const sprintService = {
    getAll: () => api.get('/sprints'),
    create: (sprintData) => api.post('/sprints', sprintData),
    update: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
    delete: (id) => api.delete(`/sprints/${id}`)
};

export const authService = {
    login: (creds) => api.post('/auth/login', creds),
    logout: () => api.post('/auth/logout')
};

export default api;