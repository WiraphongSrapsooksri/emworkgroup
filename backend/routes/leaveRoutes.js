const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController"); 

router.post("/leave", leaveController.createLeaveRequest);
router.get("/leave", leaveController.getAllLeaveRequests);
router.get("/leave/:id", leaveController.getLeaveRequestById);
router.put("/leave/:id/status", leaveController.updateLeaveStatus);
router.delete("/leave/:id", leaveController.deleteLeaveRequest);

module.exports = router;
