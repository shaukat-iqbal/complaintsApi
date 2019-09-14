const { Complaint } = require("../models/complaint");
const { Assignee } = require("../models/assignee");
const authAdmin = require("../middleware/authAdmin");
const io = require("../socket");
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
// const mongoose = require("mongoose");

// Getting complaints of Admin -- Admin
router.get("/", authAdmin, async (req, res) => {
  const complaints = await Complaint.find()
    .select("_id title status")
    .populate("assignedTo", "name _id")
    .populate("complainer", "name _id")
    .populate("category", "name _id");
  // const complaints = await Complaint.find({
  //   complainer: req.complainer._id
  // })
  //   // .populate('category', 'name -_id')
  //   // .populate('complainer', 'name -_id')
  //   // .populate('assignedTo', 'name -_id')
  //   .select('title status details location -_id');

  if (!complaints) return res.status(404).send("No complaints was found.");

  res.send(complaints);
});

// Admin can get any complaint by ID -- Admin
router.get("/:id", authAdmin, async (req, res) => {
  // if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  //   return res.status(400).send("The id is not valid.");
  // }
  const complaint = await Complaint.findOne({ _id: req.params.id })
    .select(
      "_id title status location assigned spam details files remarks timeStamp feedbackRemarks feedbackTags"
    )
    .populate("assignedTo", "name _id")
    .populate("complainer", "name _id")
    .populate("category", "name _id");
  if (!complaint)
    return res
      .status(404)
      .send("The complaint with the given ID was not found.");

  res.send(complaint);
});

// generating reports pdf
router.get("/generate/pdf/v1", async (req, res, next) => {
  try {
    const cmp = await Complaint.find();
    const spamcomplaints = await Complaint.find({ spam: true });
    const rescomplaints = await Complaint.find({
      status: { $ne: "in-progress" }
    });
    const progcomplaints = await Complaint.find({ status: "in-progress" });

    const pdfDoc = new PDFDocument();
    const reportName = "report" + Date.now() + ".pdf";

    const pdfPath = path.join("public", "files", "reports", reportName);

    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.pipe(res);
    pdfDoc.fontSize(20).text("Complaints' Report");

    pdfDoc.moveDown();

    pdfDoc
      .fontSize(12)
      .text(
        "Respected Sir, it is stated that we have prepared a report based on the number of complaints that are marked spam by the Assignee, resolved complaints and those who are in yet in-progress."
      );
    pdfDoc.text(" ");
    pdfDoc.text(
      "We have generated this report just to let you know the overall situation in the organization."
    );
    pdfDoc.moveDown();

    pdfDoc.fontSize(15).text(`Total Complaints: ${cmp.length} `);
    pdfDoc
      .fillColor("red")
      .fontSize(12)
      .text(`Spam Complaints: ${spamcomplaints.length} `);
    pdfDoc
      .fillColor("green")
      .text(`Resolved Complaints: ${rescomplaints.length} `);
    pdfDoc.text(`In Progress Complaints: ${progcomplaints.length} `);

    pdfDoc.fillColor("black").text("Regards", { align: "right" });

    pdfDoc.text("Management Team", { align: "right" });
    pdfDoc.moveDown();

    const date = new Date();
    const todayDate = date.getDate();
    const year = date.getFullYear();

    pdfDoc.fontSize(12).text(
      `${date.toLocaleString("default", {
        month: "long"
      })} ${todayDate}th,  ${year}`,
      {
        align: "right"
      }
    );

    pdfDoc.end();

    // fs.readFile(pdfPath, (err, data) => {
    //   if (err) return next(err);

    //   res.setHeader("Content-Type", "application/pdf");
    //   res.setHeader(
    //     "Content-Disposition",
    //     'inline; filename="' + reportName + '"'
    //   );

    //   res.send(data);
    // });

    // const file = fs.createReadStream(pdfPath);
    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", 'inline; filename="' + reportName + '"');
    // file.pipe(res);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + reportName + '"'
    );
    res
      .header("filename", pdfPath)
      .header("access-control-expose-headers", "filename");
  } catch (ex) {
    console.log("Error has occured.");
  }
});

// task assignment to assignee
router.put(
  "/assigned/:complaintId/:assigneeId",
  authAdmin,
  async (req, res) => {
    const complaint = await Complaint.findById(req.params.complaintId);

    complaint.assigned = true;
    complaint.assignedTo = { _id: req.params.assigneeId };

    await complaint.save();

    io.getIO().emit("complaints", {
      action: "task assigned",
      complaint: complaint
    });
    console.log("Task Assigned - admin");

    res.status(200).send(complaint);
  }
);

module.exports = router;
