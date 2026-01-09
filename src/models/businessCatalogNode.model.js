import mongoose from "mongoose";

const businessCatalogNodeSchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    catalogNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
      index: true,
    },

    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

/* One business – one catalog node – one state */
businessCatalogNodeSchema.index(
  { businessId: 1, catalogNodeId: 1 },
  { unique: true }
);

export default mongoose.model(
  "BusinessCatalogNode",
  businessCatalogNodeSchema
);
