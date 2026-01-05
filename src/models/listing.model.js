import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    // serviceId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Service",
    //   required: true,
    //   index: true,
    // },

    catalogNodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CatalogNode",
      required: true,
      index: true,
    },
    
    type: {
      type: String,
      required: true,
      enum: [
        "DEPARTMENT",   // OPD, IPD, Emergency
        "DOCTOR",       // OPD doctors
        "WARD",         // IPD wards
        "FACILITY",     // ICU, Ambulance, Blood Bank
        "MANAGEMENT",   // Directors, admins
        "STATIC_PAGE",  // About Us pages
        "CONTACT",      // Contact details
      ],
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

listingSchema.index({ catalogNodeId: 1, type: 1 });
listingSchema.index({ isActive: 1, order: 1 });

export default mongoose.model("Listing", listingSchema);
