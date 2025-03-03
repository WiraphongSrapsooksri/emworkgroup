const { sql, poolPromise } = require("../config/db");

const createApiResponse = (success, data = null, message = "") => ({
  success,
  data,
  message,
});

exports.createLeaveRequest = async (req, res) => {
  try {
    const {
      fullName,
      departmentPosition,
      email,
      phoneNumber,
      leaveType,
      leaveReason,
      startDate,
      endDate,
    } = req.body;

    const today = new Date().toISOString().split("T")[0];

    if (new Date(startDate) < new Date(today)) {
      return res
        .status(400)
        .json(createApiResponse(false, null, "ไม่สามารถขอลาย้อนหลังได้!"));
    }

    if (leaveType === "พักร้อน") {
      const diffDays =
        (new Date(startDate) - new Date(today)) / (1000 * 60 * 60 * 24);
      if (diffDays < 3) {
        return res
          .status(400)
          .json(
            createApiResponse(
              false,
              null,
              "ต้องขอลาพักร้อนล่วงหน้าอย่างน้อย 3 วัน!"
            )
          );
      }
      if (
        (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) >
        2
      ) {
        return res
          .status(400)
          .json(createApiResponse(false, null, "ลาพักร้อนได้ไม่เกิน 2 วัน!"));
      }
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("DepartmentPosition", sql.NVarChar, departmentPosition || null)
      .input("Email", sql.NVarChar, email || null)
      .input("PhoneNumber", sql.NVarChar, phoneNumber)
      .input("LeaveType", sql.NVarChar, leaveType || "other")
      .input("LeaveReason", sql.NVarChar, leaveReason)
      .input("StartDate", sql.Date, startDate)
      .input("EndDate", sql.Date, endDate).query(`
        INSERT INTO LeaveRequests (FullName, DepartmentPosition, Email, PhoneNumber, LeaveType, LeaveReason, StartDate, EndDate, Status, CreatedAt)
        VALUES (@FullName, @DepartmentPosition, @Email, @PhoneNumber, @LeaveType, @LeaveReason, @StartDate, @EndDate, N'รอพิจารณา', GETDATE())
        SELECT SCOPE_IDENTITY() AS LeaveID
      `);

    const leaveId = result.recordset[0].LeaveID;
    const newLeave = await pool
      .request()
      .input("LeaveID", sql.Int, leaveId)
      .query("SELECT * FROM LeaveRequests WHERE LeaveID = @LeaveID");

    res
      .status(201)
      .json(
        createApiResponse(true, newLeave.recordset[0], "เพิ่มคำขอลาสำเร็จ!")
      );
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json(createApiResponse(false, null, "มีข้อผิดพลาดในการบันทึกข้อมูล"));
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM LeaveRequests ORDER BY CreatedAt DESC");

    // Fix Status encoding issue by adding N prefix to ensure proper Thai character rendering
    const processedRecords = result.recordset.map((record) => {
      // Ensure the Status field is properly encoded with N prefix
      if (record.Status === "?????????") {
        record.Status = "รอพิจารณา";
      }
      return record;
    });

    res.json(createApiResponse(true, processedRecords, "ดึงข้อมูลสำเร็จ!"));
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json(createApiResponse(false, null, "ไม่สามารถดึงข้อมูลได้"));
  }
};

exports.getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("LeaveID", sql.Int, id)
      .query("SELECT * FROM LeaveRequests WHERE LeaveID = @LeaveID");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json(createApiResponse(false, null, "ไม่พบคำขอลาหยุด"));
    }

    if (result.recordset[0].Status === "?????????") {
      result.recordset[0].Status = "รอพิจารณา";
    }

    res.json(createApiResponse(true, result.recordset[0], "ดึงข้อมูลสำเร็จ!"));
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json(createApiResponse(false, null, "ไม่สามารถดึงข้อมูลได้"));
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!["รอพิจารณา", "อนุมัติ", "ไม่อนุมัติ"].includes(status)) {
      return res
        .status(400)
        .json(createApiResponse(false, null, "สถานะไม่ถูกต้อง!"));
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("LeaveID", sql.Int, id)
      .input("Status", sql.NVarChar, status)
      .query(
        "UPDATE LeaveRequests SET Status = @Status WHERE LeaveID = @LeaveID"
      ); 

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json(createApiResponse(false, null, "ไม่พบคำขอลาหยุดเพื่ออัปเดต"));
    }

    const updatedLeave = await pool
      .request()
      .input("LeaveID", sql.Int, id)
      .query("SELECT * FROM LeaveRequests WHERE LeaveID = @LeaveID");

    res.json(
      createApiResponse(true, updatedLeave.recordset[0], "อัปเดตสถานะสำเร็จ!")
    );
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json(createApiResponse(false, null, "ไม่สามารถอัปเดตสถานะได้"));
  }
};

exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("LeaveID", sql.Int, id)
      .query("DELETE FROM LeaveRequests WHERE LeaveID = @LeaveID");

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json(createApiResponse(false, null, "ไม่พบคำขอลาหยุดเพื่อลบ"));
    }
    res.json(createApiResponse(true, null, "ลบคำขอลาสำเร็จ!"));
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json(createApiResponse(false, null, "ไม่สามารถลบข้อมูลได้"));
  }
};
