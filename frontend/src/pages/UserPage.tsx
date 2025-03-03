import {
  Alert,
  Button,
  CircularProgress,
  Container,
  Grid,
  Pagination,
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
import LeaveForm from "../components/LeaveForm";
import { LeaveRequest, leaveService } from "../services/leaveService";

const UserPage: React.FC = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissionStatus, setSubmissionStatus] = useState<{ success: boolean; message?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchDate, setSearchDate] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    handleSearchAndSort();
  }, [searchTerm, searchDate, sortOrder, leaveRequests]);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getLeaveRequests();
      setLeaveRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAndSort = () => {
    let results = [...leaveRequests];

    if (searchTerm) {
      results = results.filter((req) => req.FullName.includes(searchTerm));
    }

    if (searchDate) {
      results = results.filter((req) => req.StartDate === searchDate);
    }

    results.sort((a, b) => {
      const dateA = new Date(a.CreatedAt).getTime();
      const dateB = new Date(b.CreatedAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredRequests(results);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom> ระบบขออนุญาตลาหยุด </Typography>

      {submissionStatus && (
        <Alert severity={submissionStatus.success ? "success" : "error"} sx={{ mb: 2 }}>
          {submissionStatus.message}
        </Alert>
      )}

      {/* 🔍 ค้นหา + เรียงลำดับ */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="ค้นหาด้วยชื่อ" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField fullWidth label="ค้นหาด้วยวันที่เริ่มลา" type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={handleSearchAndSort} fullWidth> ค้นหา </Button>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")} fullWidth>
            เรียงวันที่ {sortOrder === "asc" ? "⬆️" : "⬇️"}
          </Button>
        </Grid>
      </Grid>

      {/* 📋 ตารางรายการขอลา */}
      <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center"><b>ชื่อ</b></TableCell>
              <TableCell align="center"><b>ประเภท</b></TableCell>
              <TableCell align="center"><b>วันที่เริ่ม</b></TableCell>
              <TableCell align="center"><b>วันที่สิ้นสุด</b></TableCell>
              <TableCell align="center"><b>สถานะ</b></TableCell>
              <TableCell align="center"><b>วันที่บันทึก</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center"><CircularProgress /></TableCell>
              </TableRow>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.slice((page - 1) * rowsPerPage, page * rowsPerPage).map((request) => (
                <TableRow key={request.LeaveID}>
                  <TableCell align="center">{request.FullName}</TableCell>
                  <TableCell align="center">{request.LeaveType}</TableCell>
                  <TableCell align="center">{new Date(request.StartDate).toLocaleDateString()}</TableCell>
                  <TableCell align="center">{new Date(request.EndDate).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <b style={{ color: request.Status === "อนุมัติ" ? "green" : request.Status === "ไม่อนุมัติ" ? "red" : "orange" }}>
                      {request.Status}
                    </b>
                  </TableCell>
                  <TableCell align="center">{new Date(request.CreatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">ไม่มีข้อมูลคำขอลา</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Grid container justifyContent="center" sx={{ mt: 2 }}>
        <Pagination count={Math.ceil(filteredRequests.length / rowsPerPage)} page={page} onChange={(e, value) => setPage(value)} color="primary" />
      </Grid>

      {/* ฟอร์มส่งคำขอ */}
      <Grid container justifyContent="center" sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>📝 ส่งคำขอลา</Typography>
          <LeaveForm onSubmit={async (formData) => {
            const response = await leaveService.createLeaveRequest(formData);
            fetchLeaveRequests();
            return response;
          }} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserPage;
