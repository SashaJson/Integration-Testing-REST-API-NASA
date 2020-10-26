"use strict";

const fetch = require('node-fetch');
const moment = require("moment");
const util = require("util");
const defaults = require("../../config/defaults");
const utils = require("../../libs/utils");
const validate = require("../../libs/ajvValidator");
const checkStatusCode = require("../../libs/checkStatusCode");
const checkStatusText = require("../../libs/checkStatusText");
const missApiKey = require("../../libs/funcApiKeyMissing");
const ranValidDate = require("../../libs/getRandomDate");

const DATE_FORMAT = "YYYY-MM-DD";
const CURRENTLY_DATE = utils.getCurrentlyDate();
const TODAY_DATE = moment().format(DATE_FORMAT);

const INVALID_DATE = "1919-03-06";
const MINIMAL_DATE = "1995-06-16";
const MIN_DATE_MINUS_1 = "1995-06-15";
const MAX_DATE_PLUS_1 = moment().add(1, "days").format(DATE_FORMAT);
const randomValidDate = ranValidDate.randomValidDate();

let errMessInDate;

jest.setTimeout(defaults.jestTimeout); // it is necessary to increase timeout, because default timeout in Jest 5000ms

describe("Integration REST-API Testing APOD", () => {

    describe("Testing query parameter 'date'", () => {

        it("0. Make GET request with default query parameter to endpoint apod and received correct date", async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ]
                    }
                ]
            });

            expect(responseJSON.date).toBe(todaysDate);
            expect(responseJSON.media_type).toBe("image");

        });

        it(`1. Make GET request with query parameter 'date=${invalidDate}' to endpoint apod and expect 'Error'`, async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${invalidDate}`);

            checkStatusCode.Status400(response.status);
            checkStatusText.statusTextBadRequest(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "code",
                            "msg",
                            "service_version"
                        ]
                    }
                ]
            });

            expect(responseJSON.msg).toBe(`Date must be between Jun 16, 1995 and ${currentlyDate.month} ${currentlyDate.day}, ${currentlyDate.years}.`);

        });

        it(`2. Make GET request with query parameter minimal 'date=${minimalDate}' to endpoint apod`, async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${minimalDate}`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "hdurl",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ]
                    }
                ]
            });

            expect(responseJSON.date).toBe(minimalDate);
            expect(responseJSON.media_type).toBe("image");

        });

        it(`3. Make GET request with query parameter min date - 1 'date=${minDateMinus1}' to endpoint apod`, async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${minDateMinus1}`);

            checkStatusCode.Status400(response.status);
            checkStatusText.statusTextBadRequest(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "code",
                            "msg",
                            "service_version"
                        ]
                    }
                ]
            });

            expect(responseJSON.msg).toBe(`Date must be between Jun 16, 1995 and ${currentlyDate.month} ${currentlyDate.day}, ${currentlyDate.years}.`);

            errMessInDate = responseJSON.msg.slice(0, 37);

        });

        it("4. Make GET request with query parameter max 'date=currently date' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${todaysDate}`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ]
                    }
                ]
            });

            expect(responseJSON.date).toBe(todaysDate);
            expect(responseJSON.media_type).toBe("image");

        });

        it(`5. Make GET request with query parameter max date + 1 'date=${maxDatePlus1}' to endpoint apod`, async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${maxDatePlus1}`);

            checkStatusCode.Status400(response.status);
            checkStatusText.statusTextBadRequest(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",

                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "code",
                            "msg",
                            "service_version"
                        ]
                    }
                ]
            });

            expect(responseJSON.msg).toBe(`${errMessInDate} ${currentlyDate.month} ${currentlyDate.day}, ${currentlyDate.years}.`);

        });

        it(`6. Make GET request with query parameter random valid date 'date=${randomValidDate}' to endpoint apod`, async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&date=${randomValidDate}`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",

                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "hdurl",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ]
                    }
                ]
            });

            expect(responseJSON.date).toBe(randomValidDate);
            expect(responseJSON.media_type).toBe("image");

        });

    }); // describe (Testing query parameter 'date')

    describe("Testing query parameter 'hd'", () => {

        it("7. Make GET request with query parameter 'hd = true' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&hd=true`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "hdurl",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ]
                    }
                ]
            });

            expect(responseJSON.date).toBe(todaysDate);
            expect(responseJSON.media_type).toBe("image");

        });

        it("8. Make GET request with query parameter 'hd = false' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?api_key=${defaults.API_KEY}&hd=false`);

            checkStatusCode.Status200(response.status);
            checkStatusText.statusTextOk(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);
            expect(response.headers.get('x-ratelimit-limit')).toBe(defaults.rateLimit);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, {
                "type": "object",
                "allOf": [
                    {
                        "$ref": "apod.json#"
                    },
                    {
                        "required": [
                            "date",
                            "explanation",
                            "media_type",
                            "service_version",
                            "title",
                            "url"
                        ],
                        "not": {"required": ["hdurl"]}
                    }
                ]
            });

            expect(responseJSON.date).toBe(todaysDate);
            expect(responseJSON.media_type).toBe("image");

        });

    }); // describe (Testing query parameter 'hd')

    describe("Testing parameter 'api_key'", () => {

        it("9. Make GET request with query parameter 'api_key =' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("10. Make GET request with query parameter 'api_key =' and 'hd=true' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?hd=true`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("11. Make GET request with query parameter 'api_key =' and 'hd=false' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?hd=false`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("12. Make GET request with query parameter 'api_key =' and 'date=currently' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?date=${currentlyDate}`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("13. Make GET request with query parameter 'api_key =' and 'date=' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?date=`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("14. Make GET request with query parameter 'api_key =', 'date=' and 'hd=' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?date=&hd=`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

        it("15. Make GET request with query parameter 'api_key =' and 'hd=' to endpoint apod", async () => {

            const response = await fetch(`${defaults.URL_APOD}?hd=`);

            checkStatusCode.Status403(response.status);
            checkStatusText.statusTextForbidden(response.statusText);

            expect(response.headers.get('content-type')).toBe(defaults.contentType);

            const responseJSON = await utils.transformResponseToJson(response);

            validate.validationCheckJsonSchema(responseJSON, missApiKey.returnJsonSchemaMissingApiKey());

        });

    }) // describe (Testing parameter 'api_key')

    describe("Testing query parameter: date, hd and date", () => {

    }) // describe (Testing query parameter: date, hd and date)

}); // describe (Integration REST-API Testing APOD)