import {
  Alert,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { ApiResponse, LeaveRequest } from "../services/leaveService";

interface LeaveFormProps {
  onSubmit: (formData: Partial<LeaveRequest>) => Promise<ApiResponse>;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<LeaveRequest>>({
    FullName: "",
    DepartmentPosition: "",
    Email: "",
    PhoneNumber: "",
    LeaveType: "ลาป่วย",
    LeaveReason: "",
    StartDate: "",
    EndDate: "",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateLeaveRequest = (): boolean => {
    if (!formData.FullName || !formData.PhoneNumber || !formData.LeaveType || !formData.LeaveReason || !formData.StartDate || !formData.EndDate) {
      setDialogMessage("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      setOpenDialog(true);
      return false;
    }

    const start = new Date(formData.StartDate);
    const end = new Date(formData.EndDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setDialogMessage("กรุณาระบุวันที่ลาให้ถูกต้อง");
      setOpenDialog(true);
      return false;
    }

    if (start < today) {
      setDialogMessage("ไม่อนุญาตให้บันทึกวันลาย้อนหลัง");
      setOpenDialog(true);
      return false;
    }

    if (formData.LeaveType === "พักร้อน") {
      const daysInAdvance = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const leaveDuration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (daysInAdvance < 3) {
        setDialogMessage("ต้องแจ้งลาพักร้อนล่วงหน้าอย่างน้อย 3 วัน");
        setOpenDialog(true);
        return false;
      }

      if (leaveDuration > 2) {
        setDialogMessage("การลาพักร้อนสามารถลาติดต่อกันได้ไม่เกิน 2 วัน");
        setOpenDialog(true);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLeaveRequest()) return;

    try {
      const response = await onSubmit(formData);
      setSubmissionStatus({ success: response.success, message: response.message || "✅ ส่งคำขอวันลาสำเร็จ!" });

      if (response.success) {
        setFormData({
          FullName: "",
          DepartmentPosition: "",
          Email: "",
          PhoneNumber: "",
          LeaveType: "ลาป่วย",
          LeaveReason: "",
          StartDate: "",
          EndDate: "",
        });
      }
    } catch (error) {
      setSubmissionStatus({ success: false, message: (error as Error).message || "❌ เกิดข้อผิดพลาดในการส่งคำขอ" });
    }
  };

  useEffect(() => {
    if (submissionStatus) {
      const timer = setTimeout(() => setSubmissionStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        ขออนุญาตลาหยุด
      </Typography>

      {submissionStatus && (
        <Alert severity={submissionStatus.success ? "success" : "error"} sx={{ mb: 2 }}>
          {submissionStatus.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField fullWidth margin="normal" name="FullName" label="ชื่อ-นามสกุล" value={formData.FullName} onChange={handleChange} required />
        <TextField fullWidth margin="normal" name="DepartmentPosition" label="ตำแหน่ง" value={formData.DepartmentPosition} onChange={handleChange} />
        <TextField fullWidth margin="normal" name="Email" label="อีเมล" value={formData.Email} onChange={handleChange} />
        <TextField fullWidth margin="normal" name="PhoneNumber" label="เบอร์โทรศัพท์" value={formData.PhoneNumber} onChange={handleChange} required />

        <TextField fullWidth select margin="normal" name="LeaveType" label="ประเภทการลา" value={formData.LeaveType} onChange={handleChange}>
          <MenuItem value="ลาป่วย">ลาป่วย</MenuItem>
          <MenuItem value="ลากิจ">ลากิจ</MenuItem>
          <MenuItem value="พักร้อน">พักร้อน</MenuItem>
          <MenuItem value="อื่นๆ">อื่นๆ</MenuItem>
        </TextField>

        <TextField fullWidth margin="normal" name="LeaveReason" label="เหตุผล" value={formData.LeaveReason} onChange={handleChange} required />
        <TextField fullWidth margin="normal" name="StartDate" type="date" label="วันที่เริ่มลา" InputLabelProps={{ shrink: true }} value={formData.StartDate} onChange={handleChange} required />
        <TextField fullWidth margin="normal" name="EndDate" type="date" label="วันที่สิ้นสุด" InputLabelProps={{ shrink: true }} value={formData.EndDate} onChange={handleChange} required />

        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          ส่งคำขอ
        </Button>
      </form>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>แจ้งเตือน</DialogTitle>
        <DialogContent>{dialogMessage}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LeaveForm;
