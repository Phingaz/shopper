export type TMeasurementType = "WATER" | "GAS";

export type TUploadBody = {
  image: string;
  customer_code: string;
  measure_datetime: Date;
  measure_type: TMeasurementType;
};

export type TConfirmBody = {
  measure_uuid: string;
  confirmed_value: Number;
};
