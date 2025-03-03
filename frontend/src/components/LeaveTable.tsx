import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { leaveService } from "../services/leaveService";

interface LeaveRequest {
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

const LeaveTable: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await leaveService.getLeaveRequests();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await leaveService.searchLeaveRequests(searchTerm, searchDate);
      setLeaveRequests(data);
    } catch (error) {
      console.error("Error searching leave requests:", error);
    }
  };

  const handleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

    setLeaveRequests((prevRequests) =>
      [...prevRequests].sort((a, b) => {
        const dateA = new Date(a.CreatedAt).getTime();
        const dateB = new Date(b.CreatedAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      })
    );
  };

  const handleDelete = (id: number) => {
    setLeaveToDelete(id);
    setOpenDialog(true);
  };

  const confirmDelete = async () => {
    if (leaveToDelete) {
      try {
        await leaveService.deleteLeaveRequest(leaveToDelete);
        fetchData();
      } catch (error) {
        console.error("Error deleting leave request:", error);
      }
    }
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLeaveToDelete(null);
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ m: 2 }}>
        รายการคำขอลาหยุด
      </Typography>
      <div style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
        <TextField
          label="ค้นหาด้วยชื่อ"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1 }}
        />
        <TextField
          label="ค้นหาด้วยวันที่เริ่มลา"
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          ค้นหา
        </Button>
        <Button variant="contained" onClick={handleSort}>
          เรียงตามวันที่บันทึก ({sortOrder === "asc" ? "น้อยไปมาก" : "มากไปน้อย"})
        </Button>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ชื่อ</TableCell>
            <TableCell>ตำแหน่ง</TableCell>
            <TableCell>ประเภทการลา</TableCell>
            <TableCell>วันที่ลา</TableCell>
            <TableCell>สถานะ</TableCell>
            <TableCell>การจัดการ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaveRequests.length > 0 ? (
            leaveRequests.map((leave) => (
              <TableRow key={leave.LeaveID}>
                <TableCell>{leave.FullName}</TableCell>
                <TableCell>{leave.DepartmentPosition || "-"}</TableCell>
                <TableCell>{leave.LeaveType}</TableCell>
                <TableCell>
                  {new Date(leave.StartDate).toLocaleDateString()} -{" "}
                  {new Date(leave.EndDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{leave.Status}</TableCell>
                <TableCell>
                  <Button color="secondary" onClick={() => handleDelete(leave.LeaveID)}>
                    ลบ
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                ไม่พบข้อมูล
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>คุณต้องการลบคำขอลานี้ใช่ไหม?</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            ยกเลิก
          </Button>
          <Button onClick={confirmDelete} color="secondary">
            ลบ
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default LeaveTable;
