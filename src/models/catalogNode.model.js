import mongoose from "mongoose";

const catalogNodeSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String, // CATEGORY | GROUP | SUBGROUP | LEAF
      required: true,
    },

    description: {
      type: String,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      default: null,
    },

    level: {
      type: Number,
      default: 0,
    },

    order: {
      type: Number,
      default: 0,
    },

    // ✅ THIS WAS MISSING — SHOULD STAY
    rules: {
      allowChildren: {
        type: Boolean,
        default: true,
      },
      allowOfferings: {
        type: Boolean,
        default: true,
      },
      prescriptionRequired: {
        type: Boolean,
        default: false,
      },
      visibilityRestrictions: {
        type: [String], // e.g. ['SCHEDULE_H', 'ANTIBIOTIC']
        default: [],
      },
    },

    ui: {
      icon: String,
      layout: String, // list | grid | card
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    image: {
      type: String,
    },
  },
  { timestamps: true }
);

catalogNodeSchema.index({ module: 1, key: 1 }, { unique: true });

export default mongoose.model("CatalogNode", catalogNodeSchema);
