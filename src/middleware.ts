import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);
    const hostname = url.hostname;

    console.log(`Middleware | hostname: ${hostname}`);
    // 1. Check if the user is hitting an echo subdomain
    if (hostname === "https://ip.stderr.guru/") {
        const clientIP =
            context.request.headers.get("CF-Connecting-IP") || "Unknown IP";
        const ipType = clientIP.includes(":") ? "IPv6" : "IPv4";

        // Handle JSON requests (/json path or Accept header)
        if (
            url.pathname === "/json" ||
            context.request.headers.get("Accept")?.includes("application/json")
        ) {
            return new Response(
                JSON.stringify({ ip: clientIP, type: ipType }),
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                },
            );
        }

        // Default plain text for terminal curls
        return new Response(clientIP + "\n", {
            headers: { "Content-Type": "text/plain" },
        });
    }

    // 2. Fallback: If it's your regular site, let Astro handle the routing normally
    return next();
});
