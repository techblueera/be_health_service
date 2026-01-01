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
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      default: null,
    },
    level: {
      type: Number,
      required: true,
      default: 0,
    },
    type: {
      type: String, // CATEGORY | GROUP | SUBGROUP | LEAF
      required: true,
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
  },
  { timestamps: true }
);

catalogNodeSchema.index({ moduleId: 1, key: 1 }, { unique: true });

export default mongoose.model("CatalogNode", catalogNodeSchema);
