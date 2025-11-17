"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
/**
 * Lambda handler for Unsplash download tracking
 * Tracks image download as required by Unsplash API guidelines
 */
const handler = async (event) => {
    try {
        // Check API key
        if (!UNSPLASH_ACCESS_KEY) {
            return {
                statusCode: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Unsplash API key not configured" }),
            };
        }
        // Parse request body
        const body = JSON.parse(event.body || "{}");
        const { downloadLocation } = body;
        // Validate download location
        if (!downloadLocation) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Download location is required" }),
            };
        }
        // Build download URL with client_id if not present
        const downloadUrl = new URL(downloadLocation);
        if (!downloadUrl.searchParams.has("client_id")) {
            downloadUrl.searchParams.append("client_id", UNSPLASH_ACCESS_KEY);
        }
        // Trigger the download event
        const response = await fetch(downloadUrl.toString(), {
            method: "GET",
            headers: {
                "Accept-Version": "v1",
            },
        });
        if (!response.ok) {
            return {
                statusCode: response.status,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: "Failed to trigger download" }),
            };
        }
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ success: true }),
        };
    }
    catch (error) {
        console.error("Unsplash download tracking error:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};
exports.handler = handler;
