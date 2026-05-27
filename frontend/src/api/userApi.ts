import client from './client';

export interface UpdateProfileRequest {
  displayName?: string;
  email?: string;
}

export const userApi = {
  updateProfile: (data: UpdateProfileRequest) =>
    client.put('/users/profile', data),
  
  getProfile: () =>
    client.get('/users/profile'),
};
