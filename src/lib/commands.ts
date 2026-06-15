// ─── Types ────────────────────────────────────────────────────────────────────

export type CommandOutput = string[] | null;

export interface ProjectEntry {
    id: string;
    title: string;
    category: string;
    year: string;
    description: string;
    tags: string[];
    body: string;
}

export interface PostEntry {
    id: string;
    title: string;
    category: string;
    date: string;
    readTime: string;
    excerpt: string;
    body: string;
}

export interface CommandContext {
    projects: ProjectEntry[];
    posts: PostEntry[];
}

export interface Command {
    description: string;
    run: (args: string[], ctx: CommandContext) => CommandOutput;
}

export type CommandRegistry = Record<string, Command>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const c = {
    purple: (s: string) => `\x1b[38;5;141m${s}\x1b[0m`,
    bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
    dim:    (s: string) => `\x1b[2m${s}\x1b[0m`,
    red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
};

// ─── Commands ─────────────────────────────────────────────────────────────────

export const commands: CommandRegistry = {

    help: {
        description: 'list available commands',
        run: (_args, _ctx) => {
            const entries = Object.entries(commands).map(
                ([name, cmd]) => `  ${c.bold(name.padEnd(14))}${c.dim(cmd.description)}`
            );
            return ['', c.purple('Available commands:'), ...entries, ''];
        },
    },

    ls: {
        description: 'list projects or posts  usage: ls [projects|posts]',
        run: (args, ctx) => {
            const target = args[0]?.toLowerCase();

            if (!target) {
                return [
                    '',
                    `${c.purple('projects/')}   ${c.dim(`${ctx.projects.length} entries`)}`,
                    `${c.purple('posts/')}      ${c.dim(`${ctx.posts.length} entries`)}`,
                    '',
                    c.dim('usage: ls projects  |  ls posts'),
                    '',
                ];
            }

            if (target === 'projects') {
                if (ctx.projects.length === 0) return ['', c.dim('no projects found.'), ''];
                return [
                    '',
                    ...ctx.projects.map(p =>
                        `  ${c.purple(p.id.padEnd(36))} ${c.dim(p.year)}  ${p.title}`
                    ),
                    '',
                    c.dim('  cat <id> for full details'),
                    '',
                ];
            }

            if (target === 'posts') {
                if (ctx.posts.length === 0) return ['', c.dim('no posts found.'), ''];
                return [
                    '',
                    ...ctx.posts.map(p =>
                        `  ${c.purple(p.id.padEnd(44))} ${c.dim(p.date)}`
                    ),
                    '',
                    c.dim('  cat <id> for full details'),
                    '',
                ];
            }

            return [`ls: ${target}: no such directory`];
        },
    },

    cat: {
        description: 'read a project or post  usage: cat <id>',
        run: (args, ctx) => {
            const id = args[0];
            if (!id) return [c.dim('usage: cat <id>')];

            const project = ctx.projects.find(p => p.id.toLowerCase() === id.toLowerCase());
            if (project) {
                const bodyLines = project.body.trim().split('\n').map(l => '  ' + l);
                return [
                    '',
                    c.purple(`── ${project.title} ──`),
                    `${c.bold('year')}      ${project.year}`,
                    `${c.bold('category')}  ${project.category}`,
                    `${c.bold('tags')}      ${project.tags.join(', ')}`,
                    '',
                    ...bodyLines,
                    '',
                ];
            }

            const post = ctx.posts.find(p => p.id.toLowerCase() === id.toLowerCase());
            if (post) {
                const bodyLines = post.body.trim().split('\n').map(l => '  ' + l);
                return [
                    '',
                    c.purple(`── ${post.title} ──`),
                    `${c.bold('date')}      ${post.date}`,
                    `${c.bold('category')}  ${post.category}`,
                    `${c.bold('read')}      ${post.readTime}`,
                    '',
                    ...bodyLines,
                    '',
                ];
            }

            return [`cat: ${id}: no such file`];
        },
    },

    whoami: {
        description: 'who is running this thing',
        run: () => [
            '',
            c.bold('Jordan Lowell'),
            'Systems Technical Lead @ Xtern Software',
            'Cloud Platform Engineer — AWS & GCP',
            'Greensboro, NC',
            '',
        ],
    },

    history: {
        description: 'show command history',
        run: () => [],
    },

    clear: {
        description: 'clear the terminal',
        run: () => null,
    },

};
