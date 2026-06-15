import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
    const url = new URL(context.request.url);
    const hostname = url.hostname;

    // 1. Check if the user is hitting an echo subdomain
    if (
        hostname === "ip.stderr.guru" ||
        hostname === "ipv4.stderr.guru" ||
        hostname === "ipv6.stderr.guru" ||
        hostname === "dev-portfolio.jordandlowell.workers.dev"
    ) {
        // Cloudflare exposes the request context via context.locals.runtime
        const cfProperties = context.locals.runtime?.cf;

        // Fall back to the standard header if needed
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
