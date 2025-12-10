import axiosClient from './axiosClient';

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty?: string;
}

export interface UpdateProfileResponse {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
  specialty?: string;
}

export const userService = {
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    const response = await axiosClient.put<UpdateProfileResponse>('/auth/profile', data);
    return response.data;
  }
};
