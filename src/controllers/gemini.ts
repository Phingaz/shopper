import Reading from "../models/gemini.js";
import { TUploadBody } from "../types/gemini.js";
import { errorHandler, successHandler } from "../utils/resHandler.js";
import { processBase64Image } from "../utils/util.js";
import {
  handleUploadAndDelete,
  saveBase64Image,
} from "../utils/handleImage.js";
import { promptGemini } from "../utils/promptGemini.js";
import minioClient, { bucketName } from "../utils/minio.js";

const listMeasures = async (req: Req, res: Res) => {
  try {
    successHandler({
      message: "Measures listed successfully",
      req,
      res,
      data: null,
    });
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

    if (!image || !validImage) missingFields.push("image");
    if (!measure_type) missingFields.push("measure_type");
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

    const getGeminiResult = promptGemini(data, type);

    const saveReading = Reading.create({
      customer_code,
      measure_datetime,
      measure_type,
    });

    const [_, geminiResult] = await Promise.all([saveReading, getGeminiResult]);

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

    successHandler({
      req,
      res,
      data: {
        image_url: presignedUrl,
        measure_value: geminiResult.measure_value,
        measure_uuid: geminiResult.measure_uuid,
      },
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

const confirm = async (req: Req, res: Res) => {
  try {
    successHandler({
      message: "Confirm",
      req,
      res,
      data: null,
    });
  } catch (error) {
    errorHandler({ code: 400, error, req, res });
  }
};

export { listMeasures, upload, confirm };
