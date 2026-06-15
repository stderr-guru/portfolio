import { handle } from "@astrojs/cloudflare/handler";

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname, search } = url;
        console.log(url);
        console.log(pathname);
        // Do anything before Astro handles the request

        if (url.hostname === "ip.stderr.guru" || url.hostname === "localhost") {
            const clientIP =
                request.headers.get("CF-Connecting-IP") || "Unknown IP";
            const ipType = clientIP.includes(":") ? "IPv6" : "IPv4";

            // Handle JSON requests (/json path or Accept header)
            if (
                url.pathname === "/json" ||
                request.headers.get("Accept")?.includes("application/json")
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

        const response = await handle(request, env, ctx);

        // Do anything after

        return response;
    },
};
