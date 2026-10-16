# CueMap Agent Plugin v0.7.5

CueMap's portable [Agent Plugins](https://agent-plugins.org/) package. It combines the CueMap MCP server with a repository-memory skill for compatible AI coding agents.

## Contents

- `plugin.json` — Agent Plugins 1.0.0 manifest.
- `mcp.json` — launches `cuemap-mcp@0.7.5` over stdio.
- `skills/cuemap-memory/SKILL.md` — preview, confirmation, ingestion, status, and recall guidance.
- `CHANGELOG.md` — plugin release history.

## Installation

This package is published separately from [`cuemap-mcp`](https://www.npmjs.com/package/cuemap-mcp). Install or download `cuemap-agent-plugin@0.7.5`, then point your Agent Plugins-compatible client at the extracted package directory according to that client's installation flow.

The plugin launches the MCP server with `npx`, so the client environment needs Node.js/npm and network access to install the pinned `cuemap-mcp@0.7.5` dependency on first launch.

## Repository workflow

The bundled skill requires a read-only `cuemap_init_preview` before initialization, explicit confirmation before ingestion, and status polling until `verified_complete`. It also carries the returned repository `project_id` into subsequent project-scoped calls because Agent Plugin clients launch from the plugin directory.

## Trust and permissions

Only install this package from a trusted source. Loading it allows the client to launch `npx` and the CueMap MCP server, which can read and index local files that the user explicitly places in scope. CueMap's destructive memory and Lexicon tools retain their explicit confirmation requirements.

## Versioning

The plugin and MCP server are released together at the same version, while remaining separate npm packages. The plugin's `mcp.json` pins the compatible MCP server version.
