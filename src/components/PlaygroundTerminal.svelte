<script>
  import { onMount, onDestroy } from 'svelte';

  let container;
  let term;

  const PROMPT = '\r\n\x1b[38;5;141m❯\x1b[0m ';
  let inputBuffer = '';
  let cursorPos = 0;

  const COMMANDS = {
    help: () => [
      '',
      '\x1b[38;5;141mAvailable commands:\x1b[0m',
      '  \x1b[1mwhoami\x1b[0m        — who is running this thing',
      '  \x1b[1mls\x1b[0m            — list projects',
      '  \x1b[1mstack\x1b[0m         — current tech stack',
      '  \x1b[1muptime\x1b[0m        — system stats',
      '  \x1b[1mcat resume\x1b[0m    — print the highlights',
      '  \x1b[1mclear\x1b[0m         — clear the terminal',
      '  \x1b[1mhelp\x1b[0m          — show this message',
    ],
    whoami: () => [
      '',
      '\x1b[1mJordan Lowell\x1b[0m',
      'Systems Technical Lead @ Xtern Software',
      'Cloud Platform Engineer — AWS & GCP',
      'Greensboro, NC',
    ],
    ls: () => [
      '',
      '\x1b[38;5;141mprojects/\x1b[0m',
      '  multi-region-k8s/       \x1b[2m# EKS federation, 3 regions\x1b[0m',
      '  cloud-cost-reduction/   \x1b[2m# $340k ARR saved\x1b[0m',
      '  hpc-nasa-artemis/       \x1b[2m# 48-node EC2 compute cluster\x1b[0m',
      '  idp-okta-scim/          \x1b[2m# 50% faster onboarding\x1b[0m',
      '  observability-stack/    \x1b[2m# OpenTelemetry + SigNoz\x1b[0m',
    ],
    stack: () => [
      '',
      '\x1b[38;5;141mcloud\x1b[0m        AWS, GCP',
      '\x1b[38;5;141miac\x1b[0m          Terraform, OpenTofu',
      '\x1b[38;5;141mcontainers\x1b[0m   Docker, GitHub Actions',
      '\x1b[38;5;141mobservability\x1b[0m OpenTelemetry, SigNoz, CloudWatch',
      '\x1b[38;5;141midentity\x1b[0m     Okta, OIDC, SAML, SCIM',
      '\x1b[38;5;141mnetwork\x1b[0m      WireGuard, Tailscale, Fortinet',
      '\x1b[38;5;141mlanguages\x1b[0m    Python, Go, Bash',
    ],
    uptime: () => {
      const start = new Date(2022, 0, 1);
      const now = new Date();
      const days = Math.floor((now - start) / 86400000);
      return [
        '',
        `\x1b[1mSystem uptime:\x1b[0m  ${days} days`,
        `\x1b[1mProduction SLA:\x1b[0m  99.96%`,
        `\x1b[1mServices:\x1b[0m        50+ workloads`,
        `\x1b[1mLast incident:\x1b[0m   handled before you noticed`,
      ];
    },
    'cat resume': () => [
      '',
      '\x1b[38;5;141m== Jordan Lowell — Cloud Platform Engineer ==\x1b[0m',
      '',
      '\x1b[1mExperience\x1b[0m',
      '  Systems Technical Lead, Xtern Software  (Jun 2025–Present)',
      '  System Administrator, Xtern Software    (Jul 2023–Jun 2025)',
      '',
      '\x1b[1mHighlights\x1b[0m',
      '  · AWS HPC infra for NASA Artemis II (48-node EC2 cluster)',
      '  · SOC 2 audit readiness — zero critical findings',
      '  · Okta SCIM automation — 50% faster onboarding',
      '  · 99.96% uptime across 50+ production services',
      '',
      '\x1b[1mEducation\x1b[0m',
      '  AAS Network Management, Forsyth Tech  (May 2025)',
      '  President\'s List — all semesters',
      '',
      '\x1b[1mCertifications\x1b[0m',
      '  AWS Certified Cloud Practitioner  (2022)',
    ],
    clear: () => null,
  };

  function getTheme() {
    return {
      background:   '#1a1714',
      foreground:   '#e8e4dd',
      cursor:       '#9B71E8',
      cursorAccent: '#1a1714',
      black:        '#2C2925',
      brightBlack:  '#a09c95',
      white:        '#e8e4dd',
      brightWhite:  '#f5f2ec',
    };
  }

  function writeLine(line) {
    term.write('\r\n' + line);
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) { term.write(PROMPT); return; }

    const handler = COMMANDS[cmd];
    if (handler) {
      const lines = handler();
      if (lines === null) {
        term.clear();
      } else {
        lines.forEach(l => writeLine(l));
      }
    } else {
      writeLine(`\x1b[2mbash: ${cmd}: command not found — try \x1b[0m\x1b[1mhelp\x1b[0m`);
    }
    term.write(PROMPT);
  }

  onMount(async () => {
    const { init, Terminal } = await import('ghostty-web');
    await init();

    term = new Terminal({
      fontSize: 13,
      fontFamily: '"Courier New", monospace',
      theme: getTheme(),
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 1000,
      allowProposedApi: true,
    });

    term.open(container);

    // Welcome
    term.write('\x1b[38;5;141m\x1b[1mJordan Lowell — Playground\x1b[0m');
    term.write('\r\nType \x1b[1mhelp\x1b[0m to see available commands.');
    term.write(PROMPT);

    // Input handling
    term.onData(data => {
      const code = data.charCodeAt(0);

      if (data === '\r') {
        term.write('\r\n');
        runCommand(inputBuffer);
        inputBuffer = '';
        cursorPos = 0;
        return;
      }

      if (data === '\x7f' || data === '\b') {
        if (cursorPos > 0) {
          inputBuffer = inputBuffer.slice(0, cursorPos - 1) + inputBuffer.slice(cursorPos);
          cursorPos--;
          term.write('\b \b');
        }
        return;
      }

      if (data === '\x03') {
        term.write('^C');
        inputBuffer = '';
        cursorPos = 0;
        term.write(PROMPT);
        return;
      }

      // Printable characters
      if (code >= 32) {
        inputBuffer += data;
        cursorPos++;
        term.write(data);
      }
    });

    // Sync theme changes
    const observer = new MutationObserver(() => {
      term.options.theme = getTheme();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  });
</script>

<div bind:this={container} class="terminal-container"></div>

<style>
  .terminal-container {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #1a1714;
  }

  .terminal-container :global(.xterm) {
    flex: 1;
    padding: 1.25rem;
  }

  .terminal-container :global(.xterm-viewport),
  .terminal-container :global(.xterm-screen) {
    width: 100% !important;
  }
</style>
