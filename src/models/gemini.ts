import mongoose from "mongoose";
import { TMeasurementType } from "../types/gemini";

const ReadingSchema = new mongoose.Schema(
  {
    // image: {
    //   type: String,
    //   required: [true, "Base64 image is required"],
    // },
    customer_code: {
      type: String,
      required: [true, "Customer code is required"],
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
  },
  { timestamps: true }
);

const Reading = mongoose.model("Reading", ReadingSchema);

export default Reading;
