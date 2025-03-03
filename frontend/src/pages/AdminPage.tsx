import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { LeaveRequest, leaveService } from "../services/leaveService";

const AdminPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>("รอพิจารณา");
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      let data;
      if (searchTerm || searchDate) {
        data = await leaveService.searchLeaveRequests(searchTerm, searchDate);
      } else {
        data = await leaveService.getLeaveRequests();
      }
      setLeaveRequests(data);
      setSubmissionStatus(null); 
    } catch (error) {
      setSubmissionStatus({ success: false, message: (error as Error).message || "ไม่สามารถโหลดข้อมูลได้" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setNewStatus(leave.Status || "รอพิจารณา");
    setOpenStatusDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("คุณต้องการลบคำขอลานี้ใช่ไหม?")) {
      try {
        const response = await leaveService.deleteLeaveRequest(id);
        setSubmissionStatus({ success: true, message: response.message || "ลบคำขอสำเร็จ!" });
        loadData();
      } catch (error) {
        setSubmissionStatus({ success: false, message: (error as Error).message || "ไม่สามารถลบคำขอได้" });
      }
    }
  };

  const handleViewDetails = (leave: LeaveRequest) => {
    setSelectedLeave(leave);
    setOpenDetailDialog(true);
  };

  const confirmStatusChange = async () => {
    if (selectedLeave) {
      try {
        const response = await leaveService.updateLeaveStatus(selectedLeave.LeaveID, newStatus);
        setSubmissionStatus({ success: true, message: response.message || "อัปเดตสถานะสำเร็จ!" });
        loadData();
        setOpenStatusDialog(false);
        setSelectedLeave(null);
      } catch (error) {
        setSubmissionStatus({ success: false, message: (error as Error).message || "ไม่สามารถอัปเดตสถานะได้" });
      }
    }
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedLeave(null);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedLeave(null);
  };

  const handleSearch = () => {
    loadData();
  };

  // ล้างสถานะหลังจากแสดงผล 3 วินาที
  useEffect(() => {
    if (submissionStatus) {
      const timer = setTimeout(() => {
        setSubmissionStatus(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus]);

  return (
    <Container maxWidth="lg" sx={{ p: 3, bgcolor: '#f5f7fa', borderRadius: 2 }}>

      {submissionStatus && (
        <Alert severity={submissionStatus.success ? "success" : "error"} sx={{ mb: 2 }}>
          {submissionStatus.message}
        </Alert>
      )}

      {/* ช่องค้นหา */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 2 }}>
        <TextField
          label="ค้นหาด้วยชื่อ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: 1 }}
        />
        <TextField
          label="ค้นหาด้วยวันที่เริ่มลา"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
          sx={{ flex: 1, bgcolor: '#ffffff', borderRadius: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSearch}
          sx={{ bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' }, textTransform: 'none' }}
        >
          ค้นหา
        </Button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          {/* ตารางสำหรับคำขอลาที่รออนุมัติ */}
          <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold', mb: 2 }}>
            คำขอลาที่รออนุมัติ
          </Typography>
          <TableContainer component={Paper} elevation={4} sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Table sx={{ minWidth: 650, bgcolor: '#ffffff' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#34495e', color: 'white' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ประเภท</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สถานะ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests
                  .filter((leave) => leave.Status === "รอพิจารณา")
                  .map((leave) => (
                    <TableRow key={leave.LeaveID} sx={{ '&:nth-of-type(odd)': { bgcolor: '#ffffff' }, '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                      <TableCell sx={{ py: 1.5 }}>{leave.FullName}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{leave.LeaveType}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{leave.Status}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleStatusChange(leave)}
                          sx={{ mr: 1, bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' }, textTransform: 'none' }}
                        >
                          เปลี่ยนสถานะ
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(leave.LeaveID)}
                          sx={{ mr: 1, bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' }, textTransform: 'none' }}
                        >
                          ลบ
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          onClick={() => handleViewDetails(leave)}
                          sx={{ bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' }, textTransform: 'none' }}
                        >
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ตารางสำหรับคำขอลาที่อนุมัติหรือไม่อนุมัติ */}
          <Typography variant="h5" gutterBottom sx={{ color: '#2c3e50', fontWeight: 'bold', mb: 2 }}>
            คำขอลาที่ดำเนินการแล้ว
          </Typography>
          <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 2, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Table sx={{ minWidth: 650, bgcolor: '#ffffff' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#34495e', color: 'white' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ชื่อ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ประเภท</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>สถานะ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>การจัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaveRequests
                  .filter((leave) => leave.Status === "อนุมัติ" || leave.Status === "ไม่อนุมัติ")
                  .map((leave) => (
                    <TableRow key={leave.LeaveID} sx={{ '&:nth-of-type(odd)': { bgcolor: '#ffffff' }, '&:nth-of-type(even)': { bgcolor: '#f9f9f9' } }}>
                      <TableCell sx={{ py: 1.5 }}>{leave.FullName}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{leave.LeaveType}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>{leave.Status}</TableCell>
                      <TableCell sx={{ py: 1.5 }}>
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(leave.LeaveID)}
                          sx={{ mr: 1, bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' }, textTransform: 'none' }}
                        >
                          ลบ
                        </Button>
                        <Button
                          variant="contained"
                          color="info"
                          onClick={() => handleViewDetails(leave)}
                          sx={{ bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' }, textTransform: 'none' }}
                        >
                          ดูรายละเอียด
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Dialog สำหรับเปลี่ยนสถานะ */}
      <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#34495e', color: 'white' }}>เปลี่ยนสถานะคำขอลา</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ mb: 2 }}>เลือกสถานะสำหรับ {selectedLeave?.FullName}</Typography>
          <Select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as string)}
            fullWidth
            variant="outlined"
            sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
          >
            <MenuItem value="รอพิจารณา">รอพิจารณา</MenuItem>
            <MenuItem value="อนุมัติ">อนุมัติ</MenuItem>
            <MenuItem value="ไม่อนุมัติ">ไม่อนุมัติ</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseStatusDialog} variant="outlined" color="primary" sx={{ mr: 1 }}>
            ยกเลิก
          </Button>
          <Button onClick={confirmStatusChange} variant="contained" color="secondary" sx={{ bgcolor: '#e74c3c', '&:hover': { bgcolor: '#c0392b' }, textTransform: 'none' }}>
            ยืนยัน
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับดูรายละเอียด */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#34495e', color: 'white' }}>รายละเอียดคำขอลา</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedLeave && (
            <div>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>ชื่อ-นามสกุล:</strong> {selectedLeave.FullName}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>ตำแหน่ง:</strong> {selectedLeave.DepartmentPosition}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>อีเมล:</strong> {selectedLeave.Email}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>เบอร์โทรศัพท์:</strong> {selectedLeave.PhoneNumber}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>ประเภทการลา:</strong> {selectedLeave.LeaveType}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>เหตุผล:</strong> {selectedLeave.LeaveReason}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>วันที่เริ่มลา:</strong> {new Date(selectedLeave.StartDate).toLocaleDateString()}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>วันที่สิ้นสุด:</strong> {new Date(selectedLeave.EndDate).toLocaleDateString()}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>วันที่บันทึก:</strong> {new Date(selectedLeave.CreatedAt).toLocaleString()}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}><strong>สถานะ:</strong> {selectedLeave.Status}</Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetailDialog} variant="contained" color="primary" sx={{ bgcolor: '#3498db', '&:hover': { bgcolor: '#2980b9' }, textTransform: 'none' }}>
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;