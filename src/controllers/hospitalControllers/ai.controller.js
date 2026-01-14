// controllers/hospitalControllers/hospitalDataController.js
import Department from '../../models/hospitalModels/department.model.js';
import Doctor from '../../models/hospitalModels/doctor.model.js';
import Ward from '../../models/hospitalModels/ward.model.js';
import EmergencyService from '../../models/hospitalModels/emergencyService.model.js';
import Facility from '../../models/hospitalModels/facility.model.js';
import Contact from '../../models/hospitalModels/contact.model.js';
import Career from '../../models/hospitalModels/career.model.js';
import AboutUs from '../../models/hospitalModels/aboutUs.model.js';

// Save Complete Hospital Data
export const saveHospitalData = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { data } = req.body;

    // 1. SAVE ABOUT US
    if (data.ABOUT_US) {
      await AboutUs.findOneAndUpdate(
        { businessId },
        {
          businessId,
          history: data.ABOUT_US.HISTORY,
          visionMission: data.ABOUT_US.MISSION_AND_VISION,
          management: JSON.stringify(data.ABOUT_US.TEAM)
        },
        { upsert: true, new: true }
      );
    }

    // 2. SAVE CONTACT US
    if (data.CONTACT_US) {
      await Contact.findOneAndUpdate(
        { businessId },
        {
          businessId,
          hospitalName: "Sheela Devi Multi specialty Hospital",
          address: data.CONTACT_US.address,
          email: data.CONTACT_US.email,
          admissionPhone: data.CONTACT_US.phone,
          principalPhone: data.CONTACT_US.emergencyPhone,
          website: data.CONTACT_US.website
        },
        { upsert: true, new: true }
      );
    }

    // 3. SAVE OPD DEPARTMENTS AND DOCTORS
    if (data.OPT_OUTPATIENT_DEPARTMENT) {
      // Find all OPD sub-departments
      const opdDepartments = await Department.find({
        businessId,
        type: 'OPD',
        parentId: { $ne: null }
      });

      for (const dept of opdDepartments) {
        const deptKey = dept.name.toUpperCase().replace(/\s+/g, '_').replace(/[()]/g, '');
        const opdData = data.OPT_OUTPATIENT_DEPARTMENT[deptKey];

        if (opdData) {
          // Save each doctor
          if (opdData.doctors && Array.isArray(opdData.doctors)) {
            for (const doctorName of opdData.doctors) {
              await Doctor.findOneAndUpdate(
                { businessId, departmentId: dept._id, name: doctorName },
                {
                  businessId,
                  departmentId: dept._id,
                  name: doctorName,
                  availability: opdData.timing || '',
                  specialization: opdData.description || ''
                },
                { upsert: true, new: true }
              );
            }
          }
        }
      }
    }

    // 4. SAVE IPD WARDS
    if (data.IPD_INPATIENT_DEPARTMENT) {
      // Find IPD main department
      const ipdMain = await Department.findOne({
        businessId,
        type: 'IPD',
        parentId: null
      });

      if (ipdMain) {
        const wardMapping = {
          'GENERAL_WARD': 'General Ward (Male / Female)',
          'SEMI_PRIVATE_WARD': 'Semi-Private Ward',
          'PRIVATE_WARD': 'Private Ward',
          'ISOLATION_WARD': 'Isolation Ward',
          'PEDRIATRIC_WARD': 'Pediatric Ward',
          'MATERNITY_WARD': 'Maternity Ward'
        };

        for (const [key, wardName] of Object.entries(wardMapping)) {
          const wardData = data.IPD_INPATIENT_DEPARTMENT[key];
          
          if (wardData) {
            // Find the ward department
            const wardDept = await Department.findOne({
              businessId,
              name: wardName,
              parentId: ipdMain._id
            });

            if (wardDept) {
              // Extract bed count and charges
              const bedCount = parseInt(wardData.bedCount) || 0;
              const charges = wardData.charges.match(/[\d,]+/)?.[0]?.replace(',', '') || '0';
              
              await Ward.findOneAndUpdate(
                { businessId, departmentId: wardDept._id },
                {
                  businessId,
                  departmentId: wardDept._id,
                  name: wardName,
                  totalBeds: bedCount,
                  availableBeds: bedCount,
                  fees: parseInt(charges),
                  type: wardName.includes('General') ? 'General' : 
                        wardName.includes('Semi') ? 'Semi-Private' :
                        wardName.includes('Private') ? 'Private' :
                        wardName.includes('Isolation') ? 'Isolation' :
                        wardName.includes('Pediatric') ? 'Pediatric' : 'Maternity'
                },
                { upsert: true, new: true }
              );
            }
          }
        }
      }
    }

    // 5. SAVE EMERGENCY SERVICES
    if (data.EMERGENCY_AND_CRITICAL_CARE) {
      const emergencyMain = await Department.findOne({
        businessId,
        type: 'Emergency',
        parentId: null
      });

      if (emergencyMain) {
        const emergencyMapping = {
          'EMERGENTCY_CASUALTY': 'Emergency / Casualty',
          'TRAUMA_CARE': 'Trauma Care',
          'ICU_INTENSIVE_CARE_UNIT': 'ICU (Intensive Care Unit)',
          'CCU_CRITICAL_CARE_UNIT': 'CCU (Cardiac Care Unit)',
          'NICU_NEONATAL_INTENSIVE_CARE_UNIT': 'NICU (Neonatal ICU)',
          'PICU_PEDIATRIC_INTENSIVE_CARE_UNIT': 'PICU (Pediatric ICU)'
        };

        for (const [key, serviceName] of Object.entries(emergencyMapping)) {
          const serviceData = data.EMERGENCY_AND_CRITICAL_CARE[key];
          
          if (serviceData) {
            const emergencyDept = await Department.findOne({
              businessId,
              name: serviceName,
              parentId: emergencyMain._id
            });

            if (emergencyDept) {
              await EmergencyService.findOneAndUpdate(
                { businessId, departmentId: emergencyDept._id },
                {
                  businessId,
                  departmentId: emergencyDept._id,
                  name: serviceName,
                  type: serviceName.includes('Emergency') ? 'Emergency' :
                        serviceName.includes('Trauma') ? 'Trauma' :
                        serviceName.includes('ICU') ? 'ICU' :
                        serviceName.includes('CCU') ? 'CCU' :
                        serviceName.includes('NICU') ? 'NICU' : 'PICU'
                },
                { upsert: true, new: true }
              );
            }
          }
        }
      }
    }

    // 6. SAVE OTHER FACILITIES
    if (data.OTHER_FACILITIES) {
      const facilityMapping = {
        'CASH_LESS_INSURANCE': { name: 'Cash Less Insurance', type: 'Insurance' },
        'AMBULANCE': { name: 'Ambulance', type: 'Ambulance' },
        'PM_SWASTHYA_BIMA_YOJANA': { name: 'PM-Swasthya Bima Yojana', type: 'GovernmentScheme' },
        'BLOOD_BANK': { name: 'Blood Bank', type: 'BloodBank' }
      };

      for (const [key, facility] of Object.entries(facilityMapping)) {
        const facilityData = data.OTHER_FACILITIES[key];
        
        if (facilityData) {
          await Facility.findOneAndUpdate(
            { businessId, name: facility.name },
            {
              businessId,
              name: facility.name,
              type: facility.type,
              description: facilityData.description
            },
            { upsert: true, new: true }
          );
        }
      }
    }

    // 7. SAVE CAREERS
    if (data.CAREER && Array.isArray(data.CAREER)) {
      for (const job of data.CAREER) {
        await Career.findOneAndUpdate(
          { businessId, position: job.position },
          {
            businessId,
            position: job.position,
            description: `Department: ${job.department}`,
            requirements: job.qualification
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Hospital data saved successfully',
    });

  } catch (error) {
    console.error('Error saving hospital data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save hospital data',
      error: error.message
    });
  }
};