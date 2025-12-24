import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    config: {
      allowsInventory: {
        type: Boolean,
        default: false,
      },
      allowsPrescription: {
        type: Boolean,
        default: false,
      },
      allowsAppointments: {
        type: Boolean,
        default: false,
      },
      allowsPackages: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Module', moduleSchema);
