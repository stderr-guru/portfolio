<script lang="ts">
  import { onMount } from 'svelte';
  import { commands } from '../lib/commands';
  import type { ProjectEntry, PostEntry } from '../lib/commands';

  export let projects: ProjectEntry[] = [];
  export let posts: PostEntry[] = [];

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

    const measurer = document.createElement('span');
    measurer.style.cssText = 'position:absolute;visibility:hidden;font-family:"Courier New",Menlo,monospace;font-size:13px;white-space:pre';
    measurer.textContent = 'X';
    document.body.appendChild(measurer);
    const charW = measurer.getBoundingClientRect().width;
    const charH = measurer.getBoundingClientRect().height;
    document.body.removeChild(measurer);

    const PAD = 20; // 1.25rem padding on .xterm
    function fit() {
      const cols = Math.max(1, Math.floor((container.clientWidth  - PAD * 2) / charW));
      const rows = Math.max(1, Math.floor(container.clientHeight / charH));
      term.resize(cols, rows);
    }

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);

    // Hide native browser caret without touching xterm's position management
    if (term.textarea) {
      term.textarea.style.opacity = '0';
      term.textarea.style.caretColor = 'transparent';
      term.textarea.style.color = 'transparent';

      container.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (history.length === 0) return;
          histIdx = Math.min(histIdx + 1, history.length - 1);
          replaceBuf(history[histIdx]);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (histIdx <= 0) { histIdx = -1; replaceBuf(''); return; }
          histIdx--;
          replaceBuf(history[histIdx]);
        }
      });
    }

    const writeln = (line: string) => term.write('\r\n' + line);
    const ctx = { projects, posts };

    term.write('\x1b[38;5;141m\x1b[1mJordan Lowell — Playground\x1b[0m');
    term.write(`\r\nType \x1b[1mhelp\x1b[0m to see available commands.`);
    term.write(PROMPT);

    function run(input: string) {
      const [name, ...args] = input.trim().split(/\s+/);
      if (!name) { term.write(PROMPT); return; }

      if (name.toLowerCase() === 'history') {
        if (history.length === 0) {
          writeln('\x1b[2mno history\x1b[0m');
        } else {
          history.slice().reverse().forEach((cmd, i) =>
            writeln(`  \x1b[2m${String(i + 1).padStart(3)}\x1b[0m  ${cmd}`)
          );
        }
        term.write(PROMPT);
        return;
      }

      const cmd = commands[name.toLowerCase()];
      if (cmd) {
        const output = cmd.run(args, ctx);
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
    const history: string[] = [];
    let histIdx = -1;

    function replaceBuf(next: string) {
      if (buf.length > 0) term.write(`\x1b[${buf.length}D\x1b[K`);
      buf = next;
      if (buf.length > 0) term.write(buf);
    }

    term.onData((data: string) => {
      switch (data) {
        case '\r':
          term.write('\r\n');
          if (buf.trim()) { history.unshift(buf); histIdx = -1; }
          run(buf);
          buf = '';
          break;
        case '\x7f':
          if (buf.length > 0) { buf = buf.slice(0, -1); term.write('\b \b'); }
          break;
        case '\x03':
          term.write('^C');
          buf = '';
          histIdx = -1;
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
    position: relative;
    overflow: hidden;
    caret-color: transparent;
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
