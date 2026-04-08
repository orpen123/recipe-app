import api from './axios';

// ─── AUTH ────────────────────────────────────────────────
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// ─── RECIPES ─────────────────────────────────────────────
export const getAllRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// ─── LIKES ───────────────────────────────────────────────
export const likeRecipe = (id) => api.post(`/recipes/${id}/like`);
export const unlikeRecipe = (id) => api.delete(`/recipes/${id}/like`);

// ─── SAVES ───────────────────────────────────────────────
export const saveRecipe = (id) => api.post(`/recipes/${id}/save`);
export const unsaveRecipe = (id) => api.delete(`/recipes/${id}/save`);


export const getSavedRecipes = () => api.get('/recipes/saved');

// ─── COMMENTS ────────────────────────────────────────────
export const getComments = (recipeId) => api.get(`/recipes/${recipeId}/comments`);
export const addComment = (recipeId, data) => api.post(`/recipes/${recipeId}/comments`, data);
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

// ─── FOLLOWS ─────────────────────────────────────────────
export const followUser = (userId) => api.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.delete(`/users/${userId}/follow`);
export const getFollowers = (userId) => api.get(`/users/${userId}/followers`);
export const getFollowing = (userId) => api.get(`/users/${userId}/following`);

// ─── MESSAGES ────────────────────────────────────────────
export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (userId, data) => api.post(`/messages/${userId}`, data);

// ─── USERS ───────────────────────────────────────────────
export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (id, data) => api.put(`/users/${id}`, data);

// ─── NOTIFICATIONS ───────────────────────────────────────
export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');