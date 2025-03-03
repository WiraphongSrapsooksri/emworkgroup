SELECT DB_NAME() AS CurrentDatabase;


SELECT * FROM fn_my_permissions(NULL, 'DATABASE');

-- DROP TABLE LeaveRequests

CREATE TABLE LeaveRequests (
    LeaveID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    DepartmentPosition NVARCHAR(100),
    Email NVARCHAR(100),
    PhoneNumber NVARCHAR(20) NOT NULL,
    LeaveType NVARCHAR(20) NOT NULL DEFAULT N'other',
    LeaveReason NVARCHAR(MAX) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    Status NVARCHAR(50) DEFAULT N'รอพิจารณา'
);


INSERT INTO LeaveRequests (FullName, DepartmentPosition, Email, PhoneNumber, LeaveType, LeaveReason, StartDate, EndDate)
VALUES
(N'สมชาย ใจดี', N'แผนก IT', 'somchai@example.com', '0812345678', N'ลาป่วย', N'เป็นไข้หวัด', '2025-03-05', '2025-03-06'),
(N'สมหญิง ทองดี', N'ฝ่ายบัญชี', 'somying@example.com', '0823456789', N'ลากิจ', N'ธุระด่วนที่ธนาคาร', '2025-03-10', '2025-03-10'),
(N'อนันต์ รักสงบ', N'ฝ่ายขาย', 'anan@example.com', '0834567890', N'พักร้อน', N'ไปเที่ยวทะเล', '2025-04-10', '2025-04-11'),
(N'กนกวรรณ วัฒนธรรม', N'ฝ่ายบุคคล', 'kanokwan@example.com', '0845678901', N'ลาป่วย', N'เจ็บป่วยต้องพักฟื้น', '2025-03-15', '2025-03-16'),
(N'พิชัย ทรงธรรม', N'วิศวกร', 'pichai@example.com', '0856789012', N'ลากิจ', N'ไปอบรมสัมมนา', '2025-03-20', '2025-03-20'),
(N'มัณฑนา สายใจ', N'แผนกออกแบบ', 'mantana@example.com', '0867890123', N'พักร้อน', N'ท่องเที่ยวกับครอบครัว', '2025-05-15', '2025-05-16'),
(N'ประสิทธิ์ แสงสว่าง', N'ฝ่ายตรวจสอบ', 'prasith@example.com', '0878901234', N'ลาป่วย', N'ผ่าตัดฟันคุด', '2025-03-25', '2025-03-26'),
(N'นิรุตต์ พัฒนากุล', N'ฝ่ายขาย', 'nirut@example.com', '0889012345', N'ลากิจ', N'เดินทางกลับบ้านเกิด', '2025-03-30', '2025-03-30'),
(N'อารยา วัฒนวงศ์', N'ฝ่ายการตลาด', 'araya@example.com', '0890123456', N'พักร้อน', N'เดินทางไปต่างประเทศ', '2025-06-10', '2025-06-11'),
(N'วิไลลักษณ์ โชติพงษ์', N'ฝ่ายสนับสนุนลูกค้า', 'wilai@example.com', '0801234567', N'ลาป่วย', N'อาการปวดหลังรุนแรง', '2025-03-28', '2025-03-29');



SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'LeaveRequests';

DELETE FROM LeaveRequests



SELECT * FROM LeaveRequests ORDER BY CreatedAt DESC;


SELECT * FROM LeaveRequests WHERE LeaveID = 1;

UPDATE LeaveRequests 
SET Status = N'อนุมัติ' 
WHERE LeaveID = 1;

DELETE FROM LeaveRequests WHERE LeaveID = 1;
