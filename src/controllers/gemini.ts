import Reading from "../models/gemini.js";
import { TMeasurementType, TUploadBody } from "../types/gemini.js";
import { errorHandler, successHandler } from "../utils/resHandler.js";
import { generateRandomUuid, processBase64Image } from "../utils/util.js";
import { handleImage } from "../utils/handleImage.js";
import { promptGemini } from "../utils/promptGemini.js";
import { measurementTypes } from "../constants.js";

const listMeasures = async (req: Req, res: Res) => {
  try {
    const { id } = req.params;
    const { measure_type } = req.query;

    // Validate measure_type
    const isValid = measurementTypes.includes(measure_type as TMeasurementType);
    if (measure_type && !isValid) {
      return errorHandler({
        req,
        res,
        code: 400,
        error_code: "INVALID_TYPE",
        error: new Error("Tipo de medição não permitida"),
      });
    }

    // Fetch measures
    const measures = await Reading.find({
      customer_code: id,
      ...(measure_type && { measure_type }),
    }).select("-_id -__v -createdAt -updatedAt -customer_code");

    if (!measures.length) {
      return errorHandler({
        req,
        res,
        code: 404,
        error_code: "MEASURES_NOT_FOUND",
        error: new Error("Nenhuma leitura encontrada"),
      });
    }

    return successHandler({
      req,
      res,
      data: { customer_code: id, measures },
      message: "Operação realizada com sucesso",
    });
  } catch (error) {
    return errorHandler({ code: 500, error, req, res });
  }
};

const upload = async (req: Req, res: Res) => {
  try {
    const { customer_code, image, measure_datetime, measure_type } =
      req.body as TUploadBody;

    // Validate Req body
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

    // Check if reading already exists
    const exist = await Reading.findOne({
      customer_code,
      measure_datetime,
      measure_type,
    });

    if (exist) {
      return errorHandler({
        code: 409,
        error_code: "DOUBLE_REPORT",
        error: new Error("Leitura do mês já realizada"),
        req,
        res,
      });
    }

    const { data, type } = validImage;

    // Process image and get result from Gemini
    const geminiResult = await promptGemini(data, type);

    const formattedDate = new Date(measure_datetime)
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, 14);

    const fileName = `${customer_code}-${measure_type}-${formattedDate}.${type}`;

    const imgUrl = await handleImage({
      fileName,
      base64: data,
      delayMinutes: 300, // 5 hours
    });

    console.log("Gemini Result:", geminiResult);

    const value = geminiResult?.measure_value
      ? parseInt(geminiResult.measure_value)
      : 0;
    const uuid = generateRandomUuid();

    // Save reading to the database
    await Reading.create({
      customer_code,
      image_url: imgUrl,
      measure_datetime,
      measure_type,
      measure_uuid: uuid,
      has_confirmed: false,
      measure_value: value,
    });

    return successHandler({
      req,
      res,
      data: {
        image_url: imgUrl,
        measure_value: value,
        measure_uuid: uuid,
      },
      message: "Operação realizada com sucesso",
    });
  } catch (error) {
    return errorHandler({ code: 500, error, req, res });
  }
};

const confirm = async (req: Req, res: Res) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;

    // Validate Req body
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

    // Check if reading exists
    const exist = await Reading.findOne({ measure_uuid });
    if (!exist) {
      return errorHandler({
        code: 404,
        error_code: "MEASURE_NOT_FOUND",
        error: new Error("Leitura não encontrada"),
        req,
        res,
      });
    }

    if (exist.has_confirmed) {
      return errorHandler({
        code: 409,
        error_code: "CONFIRMATION_DUPLICATE",
        error: new Error("Leitura já confirmada"),
        req,
        res,
      });
    }

    // Update reading
    await Reading.updateOne(
      { measure_uuid },
      { has_confirmed: true, measure_value: confirmed_value }
    );

    return successHandler({
      req,
      res,
      data: null,
      message: "Operação realizada com sucesso",
    });
  } catch (error) {
    return errorHandler({ code: 500, error, req, res });
  }
};

export { listMeasures, upload, confirm };
