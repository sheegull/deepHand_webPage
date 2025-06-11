# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Directory Structure

This is a Claude Code configuration directory (`~/.claude`) containing:

- `settings.json` - Main Claude Code configuration file with permissions, environment variables, and preferences
- `settings.local.json` - Local overrides for Claude Code settings
- `projects/` - Session history files for different projects worked on with Claude Code
- `todos/` - Saved todo lists from various Claude Code sessions
- `statsig/` - Analytics and feature flag cache files

## Configuration Files

### settings.json Structure

The main configuration file supports the following options:

| Key | Description | Example |
|-----|-------------|---------|
| `model` | Preferred model (currently "opus") | `"opus"` |
| `theme` | Color theme setting | `"dark"` |
| `cleanupPeriodDays` | Days to retain chat history | `30` |
| `includeCoAuthoredBy` | Include Claude co-author in git commits | `false` |
| `permissions` | Permission rules with `allow` and `deny` lists | See below |
| `env` | Environment variables for all sessions | `{"FOO": "bar"}` |

### Permission System

The current configuration includes extensive permissions for development tools:

#### Allow Rules Examples:
- `Bash(npm:*)` - All npm commands
- `Bash(uv:*)` - UV Python package manager
- `Bash(deno:*)` - Deno runtime and tools
- `Bash(cargo:*)` - Rust Cargo package manager
- `Bash(git:*)` - All git commands
- `Read(**)` - Read any file
- `Edit(~/projects/**)` - Edit files in projects directory
- `WebFetch(domain:*)` - Fetch from any domain

#### Permission Rule Format:
- `Tool` - Allows any use of the tool
- `Tool(specifier)` - More specific permissions
- `Bash(command:*)` - Commands starting with "command"
- `Edit(path/pattern)` - File editing with gitignore-style patterns
- `Read(~/file)` - Specific file reading

#### Deny Rules:
Deny rules override allow rules. Current deny rules include:
- `Bash(rm -rf /)` - Prevent system deletion
- `Bash(sudo rm:*)` - Prevent sudo removal commands
- `Bash(curl * | sh)` - Prevent piped script execution
- `Bash(npm publish:*)` - Prevent accidental publishing
- `Bash(cargo publish:*)` - Prevent accidental Rust crate publishing
- `Bash(git push -f:*)` - Prevent force pushing to main
- `Edit(/etc/**)` - Prevent system file editing

### Settings Priority

Settings are applied in priority order:
1. Enterprise policies
2. Command line arguments
3. Local project settings
4. Shared project settings
5. User settings

## Environment Variables

Key environment variables configured:

| Variable | Purpose |
|----------|---------|
| `CLAUDE_CODE_ENABLE_TELEMETRY` | Controls telemetry (currently "0") |
| `DISABLE_COST_WARNINGS` | Disable cost warning messages |
| `BASH_DEFAULT_TIMEOUT_MS` | Default timeout for bash commands (300000ms) |
| `BASH_MAX_TIMEOUT_MS` | Maximum timeout for bash commands (1200000ms) |
| `SHELL` | Preferred shell (/opt/homebrew/bin/fish) |
| `UV_CACHE_DIR` | UV package manager cache directory |
| `UV_PYTHON_PREFERENCE` | UV Python installation preference (managed) |
| `DENO_DIR` | Deno cache directory |
| `CARGO_HOME` | Rust Cargo home directory |
| `RUSTUP_HOME` | Rustup home directory |
| `GOPATH` | Go workspace directory |
| `NODE_OPTIONS` | Node.js memory settings |

## Working with This Directory

When working in this Claude configuration directory:

1. **Reading Configuration**: Use Read tool to examine settings files
2. **Modifying Permissions**: Edit settings.json to adjust tool permissions
3. **Environment Variables**: Modify the `env` section for session variables
4. **Project History**: Session histories stored as JSONL files by project path
5. **Todo Management**: Historical todos preserved as JSON files

## Permission Management Commands

Use `/permissions` in Claude Code to:
- View current permission rules
- See which settings.json file provides each rule
- Manage allow/deny lists interactively

## Security Considerations

- Deny rules always override allow rules
- File editing permissions use gitignore-style patterns
- System directories are protected by default deny rules
- SSH keys and sensitive files are explicitly denied for editing
- Regular cleanup of session data (30 days by default)

## Common Configuration Tasks

1. **Add new tool permission**: Add to `permissions.allow` array
2. **Block specific command**: Add to `permissions.deny` array
3. **Set environment variable**: Add to `env` object
4. **Change cleanup period**: Modify `cleanupPeriodDays` value
5. **Disable telemetry**: Set `CLAUDE_CODE_ENABLE_TELEMETRY` to "0"


## Critical Rules - DO NOT VIOLATE
- **NEVER create mock data or simplified components** unless explicitly told to do so
- **NEVER replace existing complex components with simplified versions** - always fix the actual problem
- **ALWAYS work with the existing codebase** - do not create new simplified alternatives
- **ALWAYS find and fix the root cause** of issues instead of creating workarounds
- When debugging issues, focus on fixing the existing implementation, not replacing it
- When something doesn't work, debug and fix it - don't start over with a simple version
