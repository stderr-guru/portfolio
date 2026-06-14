<script lang="ts">
  import { onMount } from 'svelte';
  import { commands } from '../lib/commands';

  let container;

  const THEME = {
    background:   '#1a1714',
    foreground:   '#e8e4dd',
    cursor:       '#9B71E8',
    cursorAccent: '#1a1714',
    black:        '#2C2925',
    brightBlack:  '#a09c95',
    white:        '#e8e4dd',
    brightWhite:  '#f5f2ec',
    blue:         '#7b8fd4',
    cyan:         '#5fb3b3',
    green:        '#99c794',
    magenta:      '#c594c5',
    red:          '#ec5f67',
    yellow:       '#fac863',
  };

  const PROMPT = '\r\n\x1b[38;5;141m❯\x1b[0m ';

  onMount(async () => {
    const { init, Terminal } = await import('ghostty-web');
    await init();

    const term = new Terminal({
      fontSize: 13,
      fontFamily: '"Courier New", Menlo, monospace',
      theme: THEME,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowProposedApi: true,
    });

    term.open(container);

    const writeln = (line: string) => term.write('\r\n' + line);

    term.write('\x1b[38;5;141m\x1b[1mJordan Lowell — Playground\x1b[0m');
    term.write(`\r\nType \x1b[1mhelp\x1b[0m to see available commands.`);
    term.write(PROMPT);

    function run(input: string) {
      const [name, ...args] = input.trim().split(/\s+/);
      if (!name) { term.write(PROMPT); return; }

      const cmd = commands[name.toLowerCase()];
      if (cmd) {
        const output = cmd.run(args);
        if (output === null) {
          term.clear();
        } else {
          output.forEach(writeln);
        }
      } else {
        writeln(`\x1b[2mcommand not found: ${name} — try \x1b[0m\x1b[1mhelp\x1b[0m`);
      }
      term.write(PROMPT);
    }

    let buf = '';

    term.onData((data: string) => {
      switch (data) {
        case '\r':
          term.write('\r\n');
          run(buf);
          buf = '';
          break;
        case '\x7f':
          if (buf.length > 0) { buf = buf.slice(0, -1); term.write('\b \b'); }
          break;
        case '\x03':
          term.write('^C');
          buf = '';
          term.write(PROMPT);
          break;
        default:
          if (data >= ' ') { buf += data; term.write(data); }
      }
    });
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
