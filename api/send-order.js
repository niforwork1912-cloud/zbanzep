const orderHandler = require("../netlify/functions/send-order").handler;

function encodeBody(body) {
  if (typeof body === "string") return body;
  if (Buffer.isBuffer(body)) return body.toString("utf8");
  if (!body || typeof body !== "object" || Array.isArray(body)) return "";

  const params = new URLSearchParams();
  Object.entries(body).forEach(function (entry) {
    const key = entry[0];
    const value = entry[1];
    const values = Array.isArray(value) ? value : [value];
    values.forEach(function (item) {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        params.append(key, String(item));
      }
    });
  });
  return params.toString();
}

module.exports = async function (request, response) {
  const result = await orderHandler({
    httpMethod: request.method,
    body: encodeBody(request.body),
    isBase64Encoded: false
  });

  Object.entries(result.headers).forEach(function (header) {
    response.setHeader(header[0], header[1]);
  });
  response.statusCode = result.statusCode;
  response.end(result.body);
};
