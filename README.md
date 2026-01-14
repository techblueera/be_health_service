# be_health_service - Backend

Bootstrapped backend for the **be_health_service** application.

## Features

* **Express Server** with ES Modules.
* **Dual Logging**: An ASCII startup banner and a structured application logger.
* **MongoDB Integration** using Mongoose.
* **Swagger API Documentation** at `/api-docs`.
* **AWS Secrets Manager** integration for production environments.
* **Code Quality** with ESLint and Prettier.
* **Testing** with Jest.

## How AWS Secrets Manager is Used

In a **production** environment (`NODE_ENV=production`), the application will automatically attempt to load secrets from AWS Secrets Manager at startup. It expects `AWS_REGION` and `SECRET_NAME` to be set in the environment.

The secrets from AWS are loaded into `process.env`, making them available throughout the application just like variables from the `.env` file. This allows for a secure way to manage database credentials and other sensitive information without hardcoding them.

For **development**, the application uses the variables defined in the `.env` file.

## Prerequisites

* Node.js (v18+) & npm
* MongoDB
* GitHub CLI (`gh`) (optional)

## Running the Application

1.  **Install dependencies:** `npm install`
2.  **Configure environment:** Copy `.env.example` to `.env` and fill in your details.
3.  **Run in development:** `npm run dev`
4.  **Access API Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
# be_health_service
# be_healthcare_service


// Update Tab Page:
// GET /api/departments/main
// Shows: About Us, OPD, IPD, Emergency, etc. (parentId = null)

// OPD Page:
// GET /api/departments/dept_opd_main/sub
// Shows: General Medicine, General Surgery, Orthopedics, etc. (parentId = dept_opd_main)

// IPD Page:
// GET /api/departments/dept_ipd_main/sub
// Shows: General Ward, Semi-Private Ward, etc. (parentId = dept_ipd_main)

// Emergency Page:
// GET /api/departments/dept_emergency_main/sub
// Shows: ICU, CCU, NICU, etc. (parentId = dept_emergency_main)


Screen 2: About Us Page
GET /api/about-us - Get About Us content
PUT /api/about-us - Update About Us content

// For each sub-page:
- Vision & Mission
- History  
- Management


Screen 3: OPD (Out-Patient Departments)
GET /api/departments?type=OPD - Get all OPD departments
GET /api/doctors?departmentId=:id - Get doctors by department
POST /api/doctors - Add new doctor
PUT /api/doctors/:id - Update doctor
DELETE /api/doctors/:id - Delete doctor
PUT /api/doctors/:id/leave - Set doctor on leave
DELETE /api/doctors/:id/leave - Remove doctor leave


Screen 4: General Medicine (Department Detail)
GET /api/doctors?departmentId=:id - Get doctors in this department
POST /api/doctors - Add more doctors
PUT /api/doctors/:id - Update doctor details (fees, availability, etc.)


Screen 5: IPD (In-Patient Departments/Wards)
GET /api/departments?type=IPD - Get IPD department
GET /api/wards?departmentId=:id - Get all wards
POST /api/wards - Add new ward
PUT /api/wards/:id - Update ward
DELETE /api/wards/:id - Delete ward


Screen 6: General Medicine Ward (Beds)
GET /api/beds?wardId=:id - Get beds in ward
POST /api/beds - Add new bed
PUT /api/beds/:id - Update bed details
DELETE /api/beds/:id - Delete bed
PATCH /api/beds/:id/occupancy - Toggle bed occupancy
PATCH /api/wards/:id/beds - Update available beds count


Screen 7: Emergency & Critical Care
GET /api/departments?type=Emergency - Get emergency department
GET /api/emergency-services?departmentId=:id - Get emergency services
POST /api/emergency-services - Add new service (ICU, CCU, NICU, PICU)
PUT /api/emergency-services/:id - Update service
DELETE /api/emergency-services/:id - Delete service


Screen 8: Other Facilities
GET /api/facilities - Get all facilities
POST /api/facilities - Add new facility (Insurance, Ambulance, Blood Bank, etc.)
PUT /api/facilities/:id - Update facility
DELETE /api/facilities/:id - Delete facility


Screen 9: Management Page
GET /api/doctors - Get all management staff/doctors
POST /api/doctors - Add management member
PUT /api/doctors/:id - Update member details
DELETE /api/doctors/:id - Delete member


Screen 10: Contact Us
GET /api/contact - Get contact information
POST /api/contact - Create contact information
PUT /api/contact - Update contact information
DELETE /api/contact - Delete contact information

// For branches:
GET /api/branches - Get all branches
POST /api/branches - Link another branch
PUT /api/branches/:id - Update branch
DELETE /api/branches/:id - Delete branch


Additional APIs (from other screens):


Careers Page
GET /api/careers - Get all job postings
GET /api/careers/active - Get active job postings
POST /api/careers - Create new job posting
PUT /api/careers/:id - Update job posting
DELETE /api/careers/:id - Delete job posting
PATCH /api/careers/:id/status - Toggle job active/inactive
Diagnostic Departments
GET /api/departments?type=Diagnostic - Get diagnostic departments
// Similar structure to OPD


Medical Store
GET /api/departments?type=MedicalStore - Get medical store status
PUT /api/departments/:id - Toggle medical store on/off

User Flow Example:
1. Initial Setup (First Time)
1. POST /api/about-us (Setup Vision, History, Management)
2. POST /api/contact (Add contact information)
3. POST /api/departments (Create OPD, IPD, Emergency departments)
2. Adding Doctors to OPD
1. GET /api/departments?type=OPD
2. POST /api/doctors (Add Dr. Ramesh Gupta to General Medicine)
3. POST /api/doctors (Add Dr. Sarmista Roy to General Medicine)
3. Setting Up IPD Wards
1. GET /api/departments?type=IPD
2. POST /api/wards (Create General Ward Male/Female)
3. POST /api/beds (Add beds to ward)
4. Managing Doctor Leave
1. GET /api/doctors/:id
2. PUT /api/doctors/:id/leave (Set leave dates)
5. Toggle Department Status
1. GET /api/departments
2. PUT /api/departments/:id (Turn on/off departments)