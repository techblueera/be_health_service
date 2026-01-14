import Department from "../models/hospitalModels/department.model.js";

// Helper function to seed default departments
export const seedDefaultDepartments = async (businessId) => {
  // Define default main departments
  const mainDepartments = [
    { name: "About Us", type: "Other", isActive: true },
    {
      name: "OPD (Out-Patient Departments)",
      type: "OPD",

      isActive: true,
    },
    {
      name: "IPD (In-Patient Departments / Wards)",
      type: "IPD",

      isActive: false,
    },
    {
      name: "Emergency & Critical Care",
      type: "Emergency",

      isActive: false,
    },
    {
      name: "Diagnostic Departments",
      type: "Diagnostic",

      isActive: false,
    },
    {
      name: "Medical Store",
      type: "MedicalStore",

      isActive: false,
    },
    {
      name: "Other Facilities",
      type: "Other",
      isActive: false,
    },
    {
      name: "Careers",
      type: "Other",

      isActive: false,
    },
    {
      name: "Contact Us",
      type: "Other",

      isActive: true,
    },
    {
      name: "Others Services",
      type: "Other",

      isActive: false,
    },
  ];

  // Create main departments
  const createdMainDepts = [];
  for (const dept of mainDepartments) {
    const newDept = await Department.create({
      businessId,
      ...dept,
      parentId: null,
    });
    createdMainDepts.push(newDept);
  }

  // Find the OPD main department
  const opdMain = createdMainDepts.find((d) => d.type === "OPD");

  // Define OPD sub-departments
  const opdSubDepartments = [
    { name: "General Medicine", isActive: true },
    { name: "General Surgery", isActive: true },
    { name: "Orthopedics", isActive: false },
    {
      name: "Obstetrics & Gynecology",

      isActive: false,
    },
    { name: "Pediatrics", isActive: false },
    { name: "ENT (Ear, Nose, Throat)", isActive: false },
    { name: "Ophthalmology (Eye)", isActive: false },
    { name: "Dermatology (Skin)", isActive: false },
    { name: "Psychiatry", isActive: false },
    { name: "Dental OPD", isActive: false },
  ];

  // Create OPD sub-departments
  for (const subDept of opdSubDepartments) {
    await Department.create({
      businessId,
      type: "OPD",
      parentId: opdMain._id,
      ...subDept,
    });
  }

  // Find the IPD main department
  const ipdMain = createdMainDepts.find((d) => d.type === "IPD");

  // Define IPD sub-departments (Wards)
  const ipdSubDepartments = [
    {
      name: "General Ward (Male / Female)",

      isActive: true,
    },
    { name: "Semi-Private Ward", isActive: false },
    { name: "Private Ward", isActive: false },
    { name: "Isolation Ward", isActive: false },
    { name: "Pediatric Ward", isActive: false },
    { name: "Maternity Ward", isActive: false },
  ];

  // Create IPD sub-departments
  for (const subDept of ipdSubDepartments) {
    await Department.create({
      businessId,
      type: "IPD",
      parentId: ipdMain._id,
      ...subDept,
    });
  }

  const otherFacilitiesMain = createdMainDepts.find(
    (d) => d.name === "Other Facilities"
  );

  const otherFacilities = [
    {
      name: "Cash Less Insurance",
      isActive: false,
    },
    {
      name: "Ambulance",
      isActive: false,
    },
    {
      name: "PM-Swasthya Bima Yojana",
      isActive: false,
    },
    {
      name: "Blood Bank",
      isActive: false,
    },
  ];

  for (const subDept of otherFacilities) {
    await Department.create({
      businessId,
      type: "Other",
      parentId: otherFacilitiesMain._id,
      ...subDept,
    });
  }

  // Find the Emergency main department
  const emergencyMain = createdMainDepts.find((d) => d.type === "Emergency");

  // Define Emergency sub-departments
  const emergencySubDepartments = [
    {
      name: "Emergency / Casualty",
      isActive: true,
    },
    { name: "Trauma Care", isActive: false },
    {
      name: "ICU (Intensive Care Unit)",
      isActive: false,
    },
    {
      name: "CCU (Cardiac Care Unit)",
      isActive: false,
    },
    { name: "NICU (Neonatal ICU)", isActive: false },
    {
      name: "PICU (Pediatric ICU)",
      isActive: false,
    },
  ];

  // Create Emergency sub-departments
  for (const subDept of emergencySubDepartments) {
    await Department.create({
      businessId,
      type: "Emergency",
      parentId: emergencyMain._id,
      ...subDept,
    });
  }
};
