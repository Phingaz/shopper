import Reading from "../models/gemini.js";
import { TMeasurementType, TUploadBody } from "../types/gemini.js";
import { errorHandler, successHandler } from "../utils/resHandler.js";
import { generateRandomUuid, processBase64Image } from "../utils/util.js";
import {
  handleUploadAndDelete,
  saveBase64Image,
} from "../utils/handleImage.js";
import { promptGemini } from "../utils/promptGemini.js";
import minioClient, { bucketName } from "../utils/minio.js";
import { measurementTypes } from "../constants.js";

const listMeasures = async (req: Req, res: Res) => {
  try {
    const { id } = req.params;
    const { measure_type } = req.query;

    const isValid = measurementTypes.includes(measure_type as TMeasurementType);

    if (measure_type && !isValid) {
      return errorHandler({
        req,
        res,
        code: 400,
        error_code: "INVALID_DATA",
        error: new Error("Tipo de medição não permitida"),
      });
    }

    const measures = await Reading.find({
      customer_code: id,
      ...(measure_type && { measure_type }),
    });

    if (!measures || measures.length === 0) {
      return errorHandler({
        req,
        res,
        code: 404,
        error_code: "MEASURES_NOT_FOUND",
        error: new Error("Nenhuma leitura encontrada"),
      });
    }

    return res.status(200).json({ customer_code: id, measures });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

const upload = async (req: Req, res: Res) => {
  try {
    const { customer_code, image, measure_datetime, measure_type } =
      req.body as TUploadBody;

    let missingFields = [];
    const validImage = processBase64Image(image);
    const isValid = measurementTypes.includes(measure_type as TMeasurementType);

    if (!image || !validImage) missingFields.push("image");
    if (!measure_type || !isValid) missingFields.push("measure_type");
    if (!customer_code) missingFields.push("customer_code");
    if (!measure_datetime) missingFields.push("measure_datetime");

    if (missingFields.length > 0) {
      return errorHandler({
        req,
        res,
        code: 400,
        error_code: "INVALID_DATA",
        error: new Error(
          `Os dados fornecidos no corpo da requisição são inválidos: ${missingFields.join(
            ", "
          )}`
        ),
      });
    }

    const exist = await Reading.findOne({
      customer_code,
      measure_datetime,
      measure_type,
    });

    if (exist)
      return errorHandler({
        code: 409,
        error_code: "DOUBLE_REPORT",
        error: new Error("Leitura do mês já realizada"),
        req,
        res,
      });

    const { data, type } = validImage;

    const geminiResult = await promptGemini(data, type);

    const formattedDate = new Date(measure_datetime)
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const fileName = `${customer_code}-${measure_type}-${formattedDate}.${type}`;

    const localImage = await saveBase64Image({
      base64: data,
      filename: fileName,
    });

    await handleUploadAndDelete({
      bucketName,
      fileName,
      localImage,
      type,
    });

    const presignedUrl = await minioClient.presignedUrl(
      "GET",
      bucketName,
      fileName,
      60 * 60 * 3
    );

    const value = parseInt(geminiResult.measure_value) || 0;
    const uuid = generateRandomUuid();

    Reading.create({
      customer_code,
      image_url: presignedUrl,
      measure_datetime,
      measure_type,
      measure_uuid: uuid,
      has_confirmed: false,
      measure_value: value,
    });

    successHandler({
      req,
      res,
      data: {
        image_url: presignedUrl,
        measure_value: value,
        measure_uuid: uuid,
      },
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

const confirm = async (req: Req, res: Res) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    if (!measure_uuid || !confirmed_value || isNaN(confirmed_value)) {
      return errorHandler({
        code: 400,
        error_code: "INVALID_DATA",
        error: new Error(
          "Os dados fornecidos no corpo da requisição são inválidos"
        ),
        req,
        res,
      });
    }

    const exist = await Reading.findOne({ measure_uuid });

    if (!exist)
      return errorHandler({
        code: 404,
        error_code: "MEASURE_NOT_FOUND",
        error: new Error("Leitura do mês já realizada"),
        req,
        res,
      });

    if (exist.has_confirmed) {
      return errorHandler({
        code: 409,
        error_code: "CONFIRMATION_DUPLICATE",
        error: new Error("Leitura já confirmada"),
        req,
        res,
      });
    }

    await Reading.updateOne(
      { measure_uuid },
      { has_confirmed: true, measure_value: confirmed_value }
    );

    successHandler({
      req,
      res,
      data: null,
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

export { listMeasures, upload, confirm };
