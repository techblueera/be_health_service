import mongoose from "mongoose";

const catalogNodeSchema = new mongoose.Schema(
  {
    moduleId: {
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
        type: [String],
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

catalogNodeSchema.index({ moduleId: 1, key: 1 }, { unique: true });

export default mongoose.model("CatalogNode", catalogNodeSchema);
