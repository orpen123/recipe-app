import api from './axios';

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

export const getAllRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

export const getRecipeLikes = (id) => api.get(`/recipes/${id}/likes`);
export const likeRecipe = (id) => api.post(`/recipes/${id}/like`);
export const unlikeRecipe = (id) => api.delete(`/recipes/${id}/like`);

export const saveRecipe = (id) => api.post(`/recipes/${id}/save`);
export const unsaveRecipe = (id) => api.delete(`/recipes/${id}/save`);

export const getSavedRecipes = () => api.get('/recipes/saved');

export const getComments = (recipeId) => api.get(`/recipes/${recipeId}/comments`);
export const addComment = (recipeId, data) => api.post(`/recipes/${recipeId}/comments`, data);
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);

export const followUser = (userId) => api.post(`/users/${userId}/follow`);
export const unfollowUser = (userId) => api.delete(`/users/${userId}/follow`);
export const removeFollower = (followerId) => api.delete(`/users/followers/${followerId}`);
export const getFollowers = (userId) => api.get(`/users/${userId}/followers`);
export const getFollowing = (userId) => api.get(`/users/${userId}/following`);

export const getConversations = () => api.get('/messages/conversations');
export const getMessages = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (userId, data) => api.post(`/messages/${userId}`, data);
export const deleteConversation = (userId) => api.delete(`/messages/conversations/${userId}`);

export const getUserProfile = (id) => api.get(`/users/${id}`);
export const updateProfile = (id, data) => api.put(`/users/${id}`, data);
export const getLikedRecipes = (id) => api.get(`/users/${id}/liked`);

export const getNotifications = () => api.get('/notifications');
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all');

export const getRecipeReviews = (recipeId) => api.get(`/recipes/${recipeId}/reviews`);
export const getMyReview = (recipeId) => api.get(`/recipes/${recipeId}/reviews/me`);
export const submitReview = (recipeId, data) => api.post(`/recipes/${recipeId}/reviews`, data);
export const deleteReview = (recipeId) => api.delete(`/recipes/${recipeId}/reviews`);