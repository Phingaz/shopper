import mongoose from "mongoose";
import { TMeasurementType } from "../types/gemini";

const ReadingSchema = new mongoose.Schema(
  {
    measure_uuid: {
      type: String,
      required: [true, "Measure uuid is required"],
    },
    measure_value: {
      type: Number,
      required: [true, "Measure value is required"],
    },
    image_url: {
      type: String,
      required: [true, "Image url is required"],
    },
    has_confirmed: {
      type: Boolean,
      default: false,
    },
    measure_datetime: {
      type: Date,
      required: [true, "Measure datetime is required"],
    },
    measure_type: {
      type: String,
      enum: ["WATER", "GAS"] as TMeasurementType[],
      required: [true, "Measure type is required"],
    },
    customer_code: {
      type: String,
      required: [true, "Customer code is required"],
    },
  },
  { timestamps: true }
);

const Reading = mongoose.model("Reading", ReadingSchema);

export default Reading;
