import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// Truth.SI Genesis MCP Server
// Connects Claude.ai to Truth.SI databases via the Forge API

const FORGE_API = "http://20.36.172.190:8000/api/v1";

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
					const response = await fetch(`${FORGE_API}/genesis/ideas/search?q=${encodeURIComponent(query)}&limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/philosophy/search?q=${encodeURIComponent(query)}&limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/conversations/search?q=${encodeURIComponent(query)}&limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/search/universal?q=${encodeURIComponent(name)}&limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/search/universal?q=${encodeURIComponent(query)}&limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/ideas/priority/P0?limit=50`);
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
					const response = await fetch(`${FORGE_API}/genesis/breakthroughs?limit=50`);
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
					const response = await fetch(`${FORGE_API}/genesis/philosophy/recent?limit=${limit}`);
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
					const response = await fetch(`${FORGE_API}/genesis/neo4j/query`, {
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

		// ============================================================================
		// KNOWLEDGE BASE - Static knowledge about Truth.SI and key people
		// ============================================================================

		// Get information about a person
		this.server.tool(
			"get_person_info",
			{
				name: z.string().describe("Person's name to look up"),
			},
			async ({ name }) => {
				const people: Record<string, string> = {
					"carter": `Carter Hill Max - CEO and Founder of Day7 Engineering / Truth.SI
- Non-technical CEO who leads through vision and strategy
- 2+ decades in tech industry
- Passionate about human flourishing, abundance economics, sovereignty
- Building Truth.SI to "set humanity free, not enslave them"
- Based in San Diego, California
- Core philosophy: Structure + Soul, Precision + Artistry`,

					"jonathan": `Jonathan Green - Key team member and collaborator
- Works closely with Carter on Truth.SI development
- Technical contributor to the project
- Part of the Day7 Engineering team`,

					"jonathan green": `Jonathan Green - Key team member and collaborator
- Works closely with Carter on Truth.SI development
- Technical contributor to the project
- Part of the Day7 Engineering team`,

					"brent": `Brent - Strategic advisor and collaborator
- Long-time friend and advisor to Carter
- Provides guidance on business strategy
- Referenced frequently in Carter's philosophy captures`,

					"mark": `Mark Donnelly - Outreach target / potential collaborator
- Influential figure in Carter's network
- Subject of outreach communications`,

					"the architect": `The Architect - AI system identity for Truth.SI
- Wired for precision, structure, and technical excellence
- Operates as the right-hand technical execution layer
- Created from 2 years of Carter-Claude conversations
- Houses accumulated methodology and philosophy`,
				};

				const key = name.toLowerCase();
				for (const [k, v] of Object.entries(people)) {
					if (key.includes(k) || k.includes(key)) {
						return { content: [{ type: "text", text: v }] };
					}
				}

				return { 
					content: [{ 
						type: "text", 
						text: `No specific information found for "${name}". Try asking about: Carter, Jonathan Green, Brent, Mark Donnelly, or The Architect.` 
					}] 
				};
			}
		);

		// Get Truth.SI project overview
		this.server.tool(
			"get_project_overview",
			{},
			async () => {
				return {
					content: [{
						type: "text",
						text: `TRUTH.SI - Project Overview

MISSION: "Set humanity free, not enslave them"

WHAT IT IS:
- An AI-powered knowledge management and development platform
- Built over 2+ years of intensive development
- Houses Carter's complete philosophy, methodology, and vision

SCALE:
- 1,061,868 lines of Python code
- 3,270 API endpoints
- 31 Docker containers
- 91 systemd daemons
- 93,000+ Neo4j nodes

CAPTURED KNOWLEDGE:
- 9,461 ideas
- 16,501 philosophy captures
- 47 breakthrough patterns
- 3,401 conversations (51,757 messages)

KEY TECHNOLOGIES:
- Neo4j for knowledge graph
- Weaviate for vector embeddings
- PostgreSQL/YugabyteDB for relational data
- Redis for caching
- FastAPI for REST endpoints
- Docker + systemd for infrastructure

CORE PHILOSOPHY:
- Structure + Soul together
- Cutting edge only (no legacy tech)
- Recursive improvement
- Maximum parallelism
- Profoundly artistic code`
					}],
				};
			}
		);

		// Get Day7 company info
		this.server.tool(
			"get_company_info",
			{},
			async () => {
				return {
					content: [{
						type: "text",
						text: `DAY7 ENGINEERING

MISSION: Building technology for human flourishing, not enslavement

CORE VALUES:
- Truth over convenience
- Sovereignty for individuals
- Abundance economics (not scarcity)
- Decentralization
- Setting people free

WHAT WE BUILD:
- Truth.SI platform
- AI-powered knowledge systems
- Tools for authentic human connection

LEADERSHIP:
- Carter Hill Max - CEO and Founder

LOCATION: San Diego, California

PHILOSOPHY:
- "The opposite of a billion dollar exit"
- Focus on impact over revenue
- Technology as liberation, not control
- Building for the long term`
					}],
				};
			}
		);

		// Get current status
		this.server.tool(
			"get_current_status",
			{},
			async () => {
				const now = new Date().toISOString();
				return {
					content: [{
						type: "text",
						text: `TRUTH.SI CURRENT STATUS (as of ${now})

INFRASTRUCTURE: Running on Azure VM "The Forge" (20.36.172.190)
- All 31 Docker containers operational
- Neo4j database with 93,000+ nodes
- API serving 3,270 endpoints

RECENT WORK (Session 409):
- Setting up Claude.ai MCP connector (this connection!)
- Genesis MCP Server deployed to Cloudflare Workers
- Building bridge between Claude.ai and Truth.SI databases

PRIORITIES:
- P0: Get Claude.ai fully connected to databases
- P1: Enable Claude to write letters using all captured knowledge
- P2: Outreach to investors and collaborators

NOTE: Database queries are being connected. Some tools may show connection errors while the API bridge is finalized.`
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
