import Task from "../models/Task.js";
import User from "../models/User.js";
import excelJS from "exceljs"

//@desc Export all tasks as an Exel file
//@route GET /api/reports/export/tasks
//@access Private (Admin)


// @desc Export all tasks as an Excel file
// @route GET /api/reports/export/tasks
// @access Private (Admin)
const exportTaskReport = async (req, res) => {
  try {
    // Fetch all tasks, populate assigned users, and use lean() for clean JSON
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .lean();

    // Initialize workbook and worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    // Define worksheet columns
    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 40 },
    ];

    // Make header row bold
    worksheet.getRow(1).font = { bold: true };

    // Add data rows
    tasks.forEach((task) => {
      const assignedTo = (task.assignedTo || [])
        .map((user) => `${user.name} (${user.email})`)
        .join(", ");

      worksheet.addRow({
        _id: task._id?.toString() || "—",
        title: task.title || "—",
        description: task.description || "—",
        priority: task.priority || "—",
        status: task.status || "—",
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : "No Due Date",
        assignedTo: assignedTo || "Unassigned",
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks_report.xlsx"'
    );

    // Send Excel file as response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting tasks:", error);
    res
      .status(500)
      .json({ message: "Error exporting tasks", error: error.message });
  }
};


//@desc Export user-task report as an Exel file
//@route GET /api/reports/export/user
//@access Private (Admin)
const exportUserReport = async (req, res) => {
  try {
    // Fetch all users and tasks
    const users = await User.find().select("name email _id").lean();
    const userTasks = await Task.find()
      .populate("assignedTo", "name email _id")
      .lean();

    // Initialize a map to hold user-task data
    const userTaskMap = {};

    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name || "—",
        email: user.email || "—",
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    // Process all tasks and count by status
    userTasks.forEach((task) => {
      if (Array.isArray(task.assignedTo)) {
        task.assignedTo.forEach((assignedUser) => {
          const userData = userTaskMap[assignedUser._id];
          if (userData) {
            userData.totalTasks += 1;

            switch (task.status) {
              case "Pending":
                userData.pendingTasks += 1;
                break;
              case "In Progress":
                userData.inProgressTasks += 1;
                break;
              case "Completed":
                userData.completedTasks += 1;
                break;
              default:
                break;
            }
          }
        });
      }
    });

    // Create workbook and worksheet
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    // Define worksheet columns
    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Assigned Tasks", key: "totalTasks", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    // Make header row bold
    worksheet.getRow(1).font = { bold: true };

    // Add data to the worksheet
    Object.values(userTaskMap).forEach((userData) => {
      worksheet.addRow(userData);
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="user_task_report.xlsx"'
    );

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting user report:", error);
    res
      .status(500)
      .json({ message: "Error exporting user report", error: error.message });
  }
};

export  { exportTaskReport, exportUserReport};