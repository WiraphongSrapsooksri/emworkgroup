import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3003/api";

export interface LeaveRequest {
  LeaveID: number;
  FullName: string;
  DepartmentPosition?: string;
  Email?: string;
  PhoneNumber: string;
  LeaveType: string;
  LeaveReason: string;
  StartDate: string;
  EndDate: string;
  CreatedAt: string;
  Status: string;
}

export interface ApiResponse<T = LeaveRequest> {
  success: boolean;
  data?: T;
  message?: string;
}

export const leaveService = {
  // Fetch all leave requests
  getLeaveRequests: async (): Promise<LeaveRequest[]> => {
    try {
      const response = await axios.get<ApiResponse<LeaveRequest[]>>(`${API_URL}/leave`);

      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error("Invalid API response format");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      throw new Error("ไม่สามารถดึงข้อมูลคำขอลาได้");
    }
  },

  createLeaveRequest: async (data: Partial<LeaveRequest>): Promise<ApiResponse> => {
    try {
      const payload = {
        fullName: data.FullName,
        departmentPosition: data.DepartmentPosition || null,
        email: data.Email || null,
        phoneNumber: data.PhoneNumber,
        leaveType: data.LeaveType,
        leaveReason: data.LeaveReason,
        startDate: data.StartDate,
        endDate: data.EndDate,
        status: "รอพิจารณา",
      };

      const response = await axios.post<ApiResponse>(`${API_URL}/leave`, payload);

      return { success: response.data.success, data: response.data.data, message: "ส่งคำขอวันลาสำเร็จ!" };
    } catch (error) {
      console.error("Error creating leave request:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "ส่งคำขอวันลาล้มเหลว");
      }
      throw new Error("ส่งคำขอวันลาล้มเหลว");
    }
  },

  updateLeaveStatus: async (id: number, status: string): Promise<ApiResponse> => {
    try {
      const response = await axios.put<ApiResponse>(`${API_URL}/leave/${id}/status`, { status });

      return { success: response.data.success, data: response.data.data, message: "อัปเดตสถานะสำเร็จ!" };
    } catch (error) {
      console.error("Error updating leave status:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "ไม่สามารถอัปเดตสถานะได้");
      }
      throw new Error("ไม่สามารถอัปเดตสถานะได้");
    }
  },

  deleteLeaveRequest: async (id: number): Promise<ApiResponse> => {
    try {
      const response = await axios.delete<ApiResponse>(`${API_URL}/leave/${id}`);

      return { success: response.data.success, message: "ลบคำขอสำเร็จ!" };
    } catch (error) {
      console.error("Error deleting leave request:", error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.message || "ไม่สามารถลบคำขอได้");
      }
      throw new Error("ไม่สามารถลบคำขอได้");
    }
  },

  searchLeaveRequests: async (searchTerm: string, searchDate?: string): Promise<LeaveRequest[]> => {
    try {
      let url = `${API_URL}/leave`;

      const params = new URLSearchParams();
      if (searchTerm) params.append("fullName", searchTerm);
      if (searchDate) params.append("startDate", searchDate);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await axios.get<ApiResponse<LeaveRequest[]>>(url);

      if (!response.data.success || !Array.isArray(response.data.data)) {
        throw new Error("Invalid API response format");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error searching leave requests:", error);
      throw new Error("ไม่สามารถค้นหาคำขอได้");
    }
  },
};
