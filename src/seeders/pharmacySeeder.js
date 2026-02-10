import Category from '../models/medicalModels/category.model.js';

const categories = [
  // LEVEL 0 - Main Categories
  {
    name: 'Ayurveda & Nutrition',
    key: 'AYURVEDA_NUTRITION',
    description: 'Ayurvedic and nutritional products',
    level: 0,
    parentId: null,
    isActive: true
  },
  {
    name: 'Home & Patient Care',
    key: 'HOME_PATIENT_CARE',
    description: 'Home and patient care products',
    level: 0,
    parentId: null,
    isActive: true
  },
  {
    name: 'Medical Devices',
    key: 'MEDICAL_DEVICES',
    description: 'Medical devices and equipment',
    level: 0,
    parentId: null,
    isActive: true
  },
  {
    name: 'OTC Medicines',
    key: 'OTC_MEDICINES',
    description: 'Over-the-counter medicines',
    level: 0,
    parentId: null,
    isActive: true
  },
  {
    name: 'Personal & Baby Care',
    key: 'PERSONAL_BABY_CARE',
    description: 'Personal and baby care products',
    level: 0,
    parentId: null,
    isActive: true
  },
  {
    name: 'Wound Care & First Aid',
    key: 'WOUND_CARE_FIRST_AID',
    description: 'Wound care and first aid products',
    level: 0,
    parentId: null,
    isActive: true
  },

  // LEVEL 1 - Ayurveda & Nutrition Subcategories
  {
    name: 'General Nutrition',
    key: 'GENERAL_NUTRITION',
    description: 'General nutritional products',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },
  {
    name: 'Herbal & Ayurveda',
    key: 'HERBAL_AYURVEDA',
    description: 'Herbal and Ayurvedic products',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },
  {
    name: 'Intimate Wellness',
    key: 'INTIMATE_WELLNESS',
    description: 'Intimate wellness products',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },
  {
    name: 'Sports Nutrition',
    key: 'SPORTS_NUTRITION',
    description: 'Sports and fitness nutrition',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },
  {
    name: 'Vitality & Detox',
    key: 'VITALITY_DETOX',
    description: 'Vitality and detox products',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },
  {
    name: 'Vitamins & Wellness',
    key: 'VITAMINS_WELLNESS',
    description: 'Vitamins and wellness supplements',
    level: 1,
    parentKey: 'AYURVEDA_NUTRITION',
    isActive: true
  },

  // LEVEL 1 - Home & Patient Care Subcategories
  {
    name: 'Bathroom Safety',
    key: 'BATHROOM_SAFETY',
    description: 'Bathroom safety products',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Daily Living Tools',
    key: 'DAILY_LIVING_TOOLS',
    description: 'Daily living assistance tools',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Feeding & Activity',
    key: 'FEEDING_ACTIVITY',
    description: 'Feeding and activity products',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Medical Carry & Wear',
    key: 'MEDICAL_CARRY_WEAR',
    description: 'Medical carry and wear items',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Medication Support',
    key: 'MEDICATION_SUPPORT',
    description: 'Medication support products',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Patient Bedding',
    key: 'PATIENT_BEDDING',
    description: 'Patient bedding products',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Safety & Alerts',
    key: 'SAFETY_ALERTS',
    description: 'Safety and alert systems',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },
  {
    name: 'Toilet Aids',
    key: 'TOILET_AIDS',
    description: 'Toilet assistance products',
    level: 1,
    parentKey: 'HOME_PATIENT_CARE',
    isActive: true
  },

  // LEVEL 1 - Medical Devices Subcategories
  {
    name: 'Diabetes Monitoring',
    key: 'DIABETES_MONITORING',
    description: 'Diabetes monitoring devices',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Diagnostic Instruments',
    key: 'DIAGNOSTIC_INSTRUMENTS',
    description: 'Diagnostic medical instruments',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Eye & Ear Care',
    key: 'EYE_EAR_CARE',
    description: 'Eye and ear care devices',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Respiratory Devices',
    key: 'RESPIRATORY_DEVICES',
    description: 'Respiratory care devices',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Testing Kits',
    key: 'TESTING_KITS',
    description: 'Medical testing kits',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Vision Devices',
    key: 'VISION_DEVICES',
    description: 'Vision care devices',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },
  {
    name: 'Vitals Monitoring',
    key: 'VITALS_MONITORING',
    description: 'Vital signs monitoring devices',
    level: 1,
    parentKey: 'MEDICAL_DEVICES',
    isActive: true
  },

  // LEVEL 1 - OTC Medicines Subcategories
  {
    name: 'Cold & Fever',
    key: 'COLD_FEVER',
    description: 'Cold and fever medicines',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },
  {
    name: 'Pain Relief',
    key: 'PAIN_RELIEF',
    description: 'Pain relief medications',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },
  {
    name: 'Digestive Relief',
    key: 'DIGESTIVE_RELIEF',
    description: 'Digestive health medicines',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },
  {
    name: 'Hydration & Essentials',
    key: 'HYDRATION_ESSENTIALS',
    description: 'Hydration and essential medicines',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },
  {
    name: 'Mental Wellness',
    key: 'MENTAL_WELLNESS',
    description: 'Mental wellness products',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },
  {
    name: 'Organ Support',
    key: 'ORGAN_SUPPORT',
    description: 'Organ support medications',
    level: 1,
    parentKey: 'OTC_MEDICINES',
    isActive: true
  },

  // LEVEL 1 - Personal & Baby Care Subcategories
  {
    name: 'Baby Care',
    key: 'BABY_CARE',
    description: 'Baby care products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Bath & Hygiene',
    key: 'BATH_HYGIENE',
    description: 'Bath and hygiene products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Foot Care',
    key: 'FOOT_CARE',
    description: 'Foot care products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Grooming',
    key: 'GROOMING',
    description: 'Grooming products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Hair Care',
    key: 'HAIR_CARE',
    description: 'Hair care products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Oral Care',
    key: 'ORAL_CARE',
    description: 'Oral care products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: 'Skin & Face Care',
    key: 'SKIN_FACE_CARE',
    description: 'Skin and face care products',
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },
  {
    name: "Women's Care",
    key: 'WOMENS_CARE',
    description: "Women's personal care products",
    level: 1,
    parentKey: 'PERSONAL_BABY_CARE',
    isActive: true
  },

  // LEVEL 1 - Wound Care & First Aid Subcategories
  {
    name: 'Disinfection',
    key: 'DISINFECTION',
    description: 'Disinfection products',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'Dressings & Gauze',
    key: 'DRESSINGS_GAUZE',
    description: 'Wound dressings and gauze',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'First Aid',
    key: 'FIRST_AID',
    description: 'First aid supplies',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'Disposables & Protection',
    key: 'DISPOSABLES_PROTECTION',
    description: 'Disposable and protection items',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'Scar Care',
    key: 'SCAR_CARE',
    description: 'Scar care products',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'Surgical & Antiseptic',
    key: 'SURGICAL_ANTISEPTIC',
    description: 'Surgical and antiseptic products',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },
  {
    name: 'Wound Treatment',
    key: 'WOUND_TREATMENT',
    description: 'Wound treatment products',
    level: 1,
    parentKey: 'WOUND_CARE_FIRST_AID',
    isActive: true
  },

  // LEVEL 2 - General Nutrition Subcategories
  {
    name: 'Protein Supplements',
    key: 'PROTEIN_SUPPLEMENTS',
    description: 'Protein supplement products',
    level: 2,
    parentKey: 'GENERAL_NUTRITION',
    isActive: true
  },
  {
    name: 'Diabetic Drinks',
    key: 'DIABETIC_DRINKS',
    description: 'Diabetic-friendly drinks',
    level: 2,
    parentKey: 'GENERAL_NUTRITION',
    isActive: true
  },
  {
    name: "Women's Health",
    key: 'WOMENS_HEALTH',
    description: "Women's health products",
    level: 2,
    parentKey: 'GENERAL_NUTRITION',
    isActive: true
  },
  {
    name: 'Supplements',
    key: 'SUPPLEMENTS',
    description: 'General supplements',
    level: 2,
    parentKey: 'GENERAL_NUTRITION',
    isActive: true
  }
];

// Seeder function
export async function seedCategories() {
  try {
    const createdCategories = new Map();
    const sortedCategories = categories.sort((a, b) => a.level - b.level);

    for (const cat of sortedCategories) {
      const { parentKey, ...categoryData } = cat;

      // If has parent, find parent's _id
      if (parentKey && createdCategories.has(parentKey)) {
        categoryData.parentId = createdCategories.get(parentKey);
      }

      // Update if exists, create if not
      const category = await Category.findOneAndUpdate(
        { key: categoryData.key },
        categoryData,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );

      createdCategories.set(category.key, category._id);
      console.log(`✓ Upserted: ${category.name} (Level ${category.level})`);
    }

    console.log(`\n✓ Successfully processed ${sortedCategories.length} categories`);
  } catch (error) {
    console.error('✗ Error seeding categories:', error.message);
    throw error;
  }
}