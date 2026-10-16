const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const defaultPluginRoot = path.resolve(__dirname, "..");

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseFrontmatter(filePath) {
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    assert.equal(lines[0], "---", `${filePath} must begin with YAML frontmatter`);

    const end = lines.indexOf("---", 1);
    assert.ok(end > 1, `${filePath} must close its YAML frontmatter`);

    const fields = {};
    for (const line of lines.slice(1, end)) {
        const separator = line.indexOf(":");
        assert.ok(separator > 0, `${filePath} has invalid frontmatter line: ${line}`);
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim();
        assert.match(key, /^[a-z-]+$/, `${filePath} has invalid frontmatter key: ${key}`);
        assert.ok(value.length > 0, `${filePath} has an empty ${key} field`);
        fields[key] = value;
    }
    return { fields, body: lines.slice(end + 1).join("\n") };
}

function verifyAgentPlugin(pluginRoot = defaultPluginRoot) {
    const manifestPath = path.join(pluginRoot, "plugin.json");
    const mcpPath = path.join(pluginRoot, "mcp.json");
    const packagePath = path.join(pluginRoot, "package.json");
    const skillPath = path.join(pluginRoot, "skills", "cuemap-memory", "SKILL.md");

    const manifest = readJson(manifestPath);
    const manifestKeys = new Set([
        "$schema",
        "name",
        "version",
        "description",
        "author",
        "homepage",
        "repository",
        "license",
        "keywords",
        "extensions",
    ]);
    for (const key of Object.keys(manifest)) {
        assert.ok(manifestKeys.has(key), `plugin.json has an unsupported top-level field: ${key}`);
    }
    assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
    assert.equal(manifest.name, "cuemap");
    assert.match(manifest.name, /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/);
    assert.doesNotMatch(manifest.name, /(?:--|\.\.)/);
    assert.equal(manifest.version, "0.7.5");
    assert.equal(manifest.license, "MIT");
    assert.ok(Array.isArray(manifest.keywords) && manifest.keywords.length > 0);

    const packageManifest = readJson(packagePath);
    assert.equal(packageManifest.name, "cuemap-agent-plugin");
    assert.equal(packageManifest.version, manifest.version);
    assert.ok(packageManifest.files.includes("plugin.json"));
    assert.ok(packageManifest.files.includes("mcp.json"));
    assert.ok(packageManifest.files.includes("skills"));
    assert.ok(packageManifest.files.includes("CHANGELOG.md"));

    const mcp = readJson(mcpPath);
    assert.equal(mcp.$schema, "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json");
    assert.deepEqual(Object.keys(mcp).sort(), ["$schema", "mcpServers"].sort());
    assert.deepEqual(Object.keys(mcp.mcpServers), ["cuemap"]);
    assert.deepEqual(mcp.mcpServers.cuemap, {
        type: "stdio",
        command: "npx",
        args: ["-y", "cuemap-mcp@0.7.5"],
    });

    const skill = parseFrontmatter(skillPath);
    assert.equal(skill.fields.name, "cuemap-memory");
    assert.match(skill.fields.name, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(skill.fields.description.length <= 1024);
    assert.ok(skill.body.includes("cuemap_init_preview"));
    assert.ok(skill.body.includes("confirmed: true"));
    assert.ok(skill.body.includes("verified_complete"));
    assert.ok(skill.body.includes("project_id"));

    return { manifest, mcp, skill };
}

if (require.main === module) {
    verifyAgentPlugin();
    console.log("Agent Plugin package is valid.");
}

module.exports = { verifyAgentPlugin };
