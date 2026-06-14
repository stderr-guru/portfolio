// ─── Types ────────────────────────────────────────────────────────────────────

export type CommandOutput =
    | string[] // lines to print
    | null; // null → clear screen

export interface Command {
    description: string;
    run: (args: string[]) => CommandOutput;
}

export type CommandRegistry = Record<string, Command>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const c = {
    purple: (s: string) => `\x1b[38;5;141m${s}\x1b[0m`,
    bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
    dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};

// ─── Commands ─────────────────────────────────────────────────────────────────

export const commands: CommandRegistry = {
    help: {
        description: "list available commands",
        run: (_args) => {
            const entries = Object.entries(commands).map(
                ([name, cmd]) =>
                    `  ${c.bold(name.padEnd(14))}${c.dim(cmd.description)}`,
            );
            return ["", c.purple("Available commands:"), ...entries, ""];
        },
    },

    // whoami: {
    //   description: 'who is running this thing',
    //   run: () => [
    //     '',
    //     c.bold('Jordan Lowell'),
    //     'Systems Technical Lead @ Xtern Software',
    //     'Cloud Platform Engineer — AWS & GCP',
    //     'Greensboro, NC',
    //     '',
    //   ],
    // },

    // ls: {
    //   description: 'list projects',
    //   run: () => [
    //     '',
    //     c.purple('projects/'),
    //     `  multi-region-k8s/       ${c.dim('# EKS federation, 3 regions')}`,
    //     `  cloud-cost-reduction/   ${c.dim('# $340k ARR saved')}`,
    //     `  hpc-nasa-artemis/       ${c.dim('# 48-node EC2 compute cluster')}`,
    //     `  idp-okta-scim/          ${c.dim('# 50% faster onboarding')}`,
    //     `  observability-stack/    ${c.dim('# OpenTelemetry + SigNoz')}`,
    //     '',
    //   ],
    // },

    // stack: {
    //   description: 'current tech stack',
    //   run: () => [
    //     '',
    //     `${c.purple('cloud')}          AWS, GCP`,
    //     `${c.purple('iac')}            Terraform, OpenTofu`,
    //     `${c.purple('containers')}     Docker, GitHub Actions`,
    //     `${c.purple('observability')}  OpenTelemetry, SigNoz, CloudWatch`,
    //     `${c.purple('identity')}       Okta, OIDC, SAML, SCIM`,
    //     `${c.purple('network')}        WireGuard, Tailscale, Fortinet`,
    //     `${c.purple('languages')}      Python, Go, Bash`,
    //     '',
    //   ],
    // },
    //
    // uptime: {
    //   description: 'system stats',
    //   run: () => {
    //     const days = Math.floor((Date.now() - new Date(2022, 0, 1).getTime()) / 86_400_000);
    //     return [
    //       '',
    //       `${c.bold('uptime')}     ${days} days`,
    //       `${c.bold('sla')}        99.96%`,
    //       `${c.bold('services')}   50+ workloads`,
    //       `${c.bold('incidents')}  handled before you noticed`,
    //       '',
    //     ];
    //   },
    // },

    // resume: {
    //   description: 'print career highlights',
    //   run: () => [
    //     '',
    //     c.purple('═══ Jordan Lowell — Cloud Platform Engineer ═══'),
    //     '',
    //     c.bold('Experience'),
    //     '  Systems Technical Lead, Xtern Software  (Jun 2025–Present)',
    //     '  System Administrator, Xtern Software    (Jul 2023–Jun 2025)',
    //     '',
    //     c.bold('Highlights'),
    //     `  ${c.dim('·')} AWS HPC infra for NASA Artemis II (48-node EC2 cluster)`,
    //     `  ${c.dim('·')} SOC 2 consulting — zero critical findings`,
    //     `  ${c.dim('·')} Okta SCIM automation — 50% faster onboarding`,
    //     `  ${c.dim('·')} 99.96% uptime across 50+ production services`,
    //     '',
    //     c.bold('Education'),
    //     '  AAS Network Management, Forsyth Tech  (May 2025)',
    //     `  ${c.dim('President\'s List — all semesters')}`,
    //     '',
    //     c.bold('Certifications'),
    //     '  AWS Certified Cloud Practitioner  (2022)',
    //     '',
    //   ],
    // },

    clear: {
        description: "clear the terminal",
        run: () => null,
    },
};
