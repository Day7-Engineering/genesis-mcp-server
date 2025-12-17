import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Truth.SI Genesis MCP Server
// Connects Claude.ai to Truth.SI databases via the Forge API

const FORGE_API = "http://20.36.172.190:8000";

// Define our MCP agent with Truth.SI tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Truth.SI Genesis",
		version: "1.0.0",
	});

	async init() {
		// ============================================================================
		// SEARCH TOOLS - Find information across all databases
		// ============================================================================

		// Search ideas by keyword
		this.server.tool(
			"search_ideas",
			{
				query: z.string().describe("Keyword or phrase to search for in ideas"),
				limit: z.number().optional().describe("Max results (default 20)"),
			},
			async ({ query, limit = 20 }) => {
				try {
					const response = await fetch(`${FORGE_API}/ideas/search?q=${encodeURIComponent(query)}&limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error searching ideas: ${error}` }],
					};
				}
			}
		);

		// Search philosophy captures
		this.server.tool(
			"search_philosophy",
			{
				query: z.string().describe("Keyword or phrase to search in philosophy captures"),
				limit: z.number().optional().describe("Max results (default 20)"),
			},
			async ({ query, limit = 20 }) => {
				try {
					const response = await fetch(`${FORGE_API}/philosophy/search?q=${encodeURIComponent(query)}&limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error searching philosophy: ${error}` }],
					};
				}
			}
		);

		// Search conversations
		this.server.tool(
			"search_conversations",
			{
				query: z.string().describe("Search term for conversations"),
				limit: z.number().optional().describe("Max results (default 10)"),
			},
			async ({ query, limit = 10 }) => {
				try {
					const response = await fetch(`${FORGE_API}/chat/search?q=${encodeURIComponent(query)}&limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error searching conversations: ${error}` }],
					};
				}
			}
		);

		// Search by person name
		this.server.tool(
			"search_by_person",
			{
				name: z.string().describe("Person's name to search for (e.g., 'Brent', 'Mark')"),
				limit: z.number().optional().describe("Max results (default 30)"),
			},
			async ({ name, limit = 30 }) => {
				try {
					const response = await fetch(`${FORGE_API}/search/universal?q=${encodeURIComponent(name)}&limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error searching for person: ${error}` }],
					};
				}
			}
		);

		// Universal search across all content
		this.server.tool(
			"universal_search",
			{
				query: z.string().describe("Search across all ideas, philosophy, conversations"),
				limit: z.number().optional().describe("Max results (default 50)"),
			},
			async ({ query, limit = 50 }) => {
				try {
					const response = await fetch(`${FORGE_API}/search/universal?q=${encodeURIComponent(query)}&limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error in universal search: ${error}` }],
					};
				}
			}
		);

		// ============================================================================
		// DIRECT DATA ACCESS TOOLS
		// ============================================================================

		// Get P0 (critical priority) ideas
		this.server.tool(
			"get_critical_ideas",
			{},
			async () => {
				try {
					const response = await fetch(`${FORGE_API}/ideas/priority/P0?limit=50`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error getting critical ideas: ${error}` }],
					};
				}
			}
		);

		// Get breakthrough patterns
		this.server.tool(
			"get_breakthrough_patterns",
			{},
			async () => {
				try {
					const response = await fetch(`${FORGE_API}/breakthroughs?limit=50`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error getting breakthroughs: ${error}` }],
					};
				}
			}
		);

		// Get recent philosophy captures
		this.server.tool(
			"get_recent_philosophy",
			{
				limit: z.number().optional().describe("Number of recent captures (default 20)"),
			},
			async ({ limit = 20 }) => {
				try {
					const response = await fetch(`${FORGE_API}/philosophy/recent?limit=${limit}`);
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error getting philosophy: ${error}` }],
					};
				}
			}
		);

		// ============================================================================
		// QUERY TOOLS - Direct database access
		// ============================================================================

		// Run a Cypher query on Neo4j
		this.server.tool(
			"query_neo4j",
			{
				cypher: z.string().describe("Cypher query to execute on Neo4j knowledge graph"),
			},
			async ({ cypher }) => {
				try {
					const response = await fetch(`${FORGE_API}/neo4j/query`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ query: cypher }),
					});
					const data = await response.json();
					return {
						content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
					};
				} catch (error) {
					return {
						content: [{ type: "text", text: `Error executing Cypher: ${error}` }],
					};
				}
			}
		);

		// Get system metrics
		this.server.tool(
			"get_system_metrics",
			{},
			async () => {
				return {
					content: [{
						type: "text",
						text: JSON.stringify({
							system: "Truth.SI",
							python_loc: 1061868,
							api_endpoints: 3270,
							docker_containers: 31,
							systemd_daemons: 91,
							neo4j_nodes: "93,000+",
							ideas_captured: 9461,
							philosophy_files: 16501,
							breakthrough_patterns: 47,
							conversations: 3401,
							messages: 51757,
						}, null, 2)
					}],
				};
			}
		);

		// Get Carter's voice/style
		this.server.tool(
			"get_writing_style",
			{},
			async () => {
				return {
					content: [{
						type: "text",
						text: `Carter's Writing Style Guide:
						
- Direct and bold - no corporate speak
- Passion-driven with clear vision
- Uses metaphors from construction, building, craftsmanship
- Values truth, sovereignty, human flourishing
- Speaks from experience (2+ decades in tech industry)
- Anti-enslavement, pro-human themes
- References Day7, abundance economics, decentralization
- Authentic voice - sounds like a real person, not a press release
- Often uses "we" to include the team/mission
- Concrete examples over abstract concepts`
					}],
				};
			}
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		if (url.pathname === "/") {
			return new Response("Truth.SI Genesis MCP Server - Use /sse for Claude.ai connection", { status: 200 });
		}

		return new Response("Not found", { status: 404 });
	},
};
