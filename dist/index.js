import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import express from 'express';
import cors from 'cors';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
class OguryMCPServer {
    server;
    app;
    accessToken = null;
    tokenExpiry = null;
    baseUrl = 'https://api.ogury.com';
    clientId;
    clientSecret;
    constructor() {
        this.clientId = process.env.OGURY_CLIENT_ID || '';
        this.clientSecret = process.env.OGURY_CLIENT_SECRET || '';
        if (!this.clientId || !this.clientSecret) {
            throw new Error('OGURY_CLIENT_ID and OGURY_CLIENT_SECRET environment variables are required');
        }
        this.server = new Server({
            name: 'ogury-mcp-server',
            version: '0.1.0',
            capabilities: {
                tools: {},
            },
        });
        this.app = express();
        this.setupExpress();
        this.setupToolHandlers();
    }
    setupExpress() {
        this.app.use(cors());
        this.app.use(express.json());
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', server: 'ogury-mcp-server' });
        });
        // Handle GET requests to /mcp (some clients might try this)
        this.app.get('/mcp', (req, res) => {
            res.json({
                status: 'ok',
                message: 'Ogury MCP Server is running',
                endpoint: 'Use POST /mcp for MCP requests',
                availableMethods: ['tools/list', 'tools/call']
            });
        });
        // MCP endpoint
        this.app.post('/mcp', async (req, res) => {
            try {
                const { method, params, id } = req.body;
                switch (method) {
                    case 'tools/list':
                        // Return the list of available tools
                        res.json({
                            jsonrpc: '2.0',
                            id: id || 1,
                            result: {
                                tools: [
                                    {
                                        name: 'get_campaign_details',
                                        description: 'Get campaign performance details by campaign ID',
                                        inputSchema: {
                                            type: 'object',
                                            properties: {
                                                campaignId: {
                                                    type: 'number',
                                                    description: 'The campaign ID to retrieve details for',
                                                },
                                                startDate: {
                                                    type: 'string',
                                                    description: 'Start date in YYYY-MM-DD format (required)',
                                                },
                                                endDate: {
                                                    type: 'string',
                                                    description: 'End date in YYYY-MM-DD format (required)',
                                                },
                                                accountId: {
                                                    type: 'string',
                                                    description: 'Optional account ID filter',
                                                },
                                                brandId: {
                                                    type: 'string',
                                                    description: 'Optional brand ID filter',
                                                },
                                            },
                                            required: ['campaignId', 'startDate', 'endDate'],
                                        },
                                    },
                                    {
                                        name: 'get_campaigns_report',
                                        description: 'Get campaign performance report with flexible filtering',
                                        inputSchema: {
                                            type: 'object',
                                            properties: {
                                                startDate: {
                                                    type: 'string',
                                                    description: 'Start date in YYYY-MM-DD format (required)',
                                                },
                                                endDate: {
                                                    type: 'string',
                                                    description: 'End date in YYYY-MM-DD format (required)',
                                                },
                                                accountId: {
                                                    type: 'string',
                                                    description: 'Account IDs (comma-separated)',
                                                },
                                                brandId: {
                                                    type: 'string',
                                                    description: 'Brand ID',
                                                },
                                                campaignId: {
                                                    type: 'number',
                                                    description: 'Campaign ID',
                                                },
                                                identifier1: {
                                                    type: 'string',
                                                    description: 'External identifier 1',
                                                },
                                                identifier2: {
                                                    type: 'string',
                                                    description: 'External identifier 2',
                                                },
                                                identifier3: {
                                                    type: 'string',
                                                    description: 'External identifier 3',
                                                },
                                            },
                                            required: ['startDate', 'endDate'],
                                        },
                                    },
                                ],
                            },
                        });
                        break;
                    case 'tools/call':
                        // Handle tool calls
                        const { name, arguments: args } = params;
                        try {
                            let result;
                            switch (name) {
                                case 'get_campaign_details':
                                    result = await this.getCampaignDetails(args);
                                    break;
                                case 'get_campaigns_report':
                                    result = await this.getCampaignsReport(args);
                                    break;
                                default:
                                    throw new Error(`Unknown tool: ${name}`);
                            }
                            res.json({
                                jsonrpc: '2.0',
                                id: id || 1,
                                result: result,
                            });
                        }
                        catch (error) {
                            res.json({
                                jsonrpc: '2.0',
                                id: id || 1,
                                error: {
                                    code: -32603,
                                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                                },
                            });
                        }
                        break;
                    default:
                        res.status(400).json({
                            jsonrpc: '2.0',
                            id: id || 1,
                            error: {
                                code: -32601,
                                message: `Unsupported method: ${method}`,
                            },
                        });
                }
            }
            catch (error) {
                res.status(500).json({
                    jsonrpc: '2.0',
                    id: req.body.id || 1,
                    error: {
                        code: -32603,
                        message: error instanceof Error ? error.message : 'Unknown error',
                    },
                });
            }
        });
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'get_campaign_details',
                        description: 'Get campaign performance details by campaign ID',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                campaignId: {
                                    type: 'number',
                                    description: 'The campaign ID to retrieve details for',
                                },
                                startDate: {
                                    type: 'string',
                                    description: 'Start date in YYYY-MM-DD format (required)',
                                },
                                endDate: {
                                    type: 'string',
                                    description: 'End date in YYYY-MM-DD format (required)',
                                },
                                accountId: {
                                    type: 'string',
                                    description: 'Optional account ID filter',
                                },
                                brandId: {
                                    type: 'string',
                                    description: 'Optional brand ID filter',
                                },
                            },
                            required: ['campaignId', 'startDate', 'endDate'],
                        },
                    },
                    {
                        name: 'get_campaigns_report',
                        description: 'Get campaign performance report with flexible filtering',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                startDate: {
                                    type: 'string',
                                    description: 'Start date in YYYY-MM-DD format (required)',
                                },
                                endDate: {
                                    type: 'string',
                                    description: 'End date in YYYY-MM-DD format (required)',
                                },
                                accountId: {
                                    type: 'string',
                                    description: 'Account IDs (comma-separated)',
                                },
                                brandId: {
                                    type: 'string',
                                    description: 'Brand ID',
                                },
                                campaignId: {
                                    type: 'number',
                                    description: 'Campaign ID',
                                },
                                identifier1: {
                                    type: 'string',
                                    description: 'External identifier 1',
                                },
                                identifier2: {
                                    type: 'string',
                                    description: 'External identifier 2',
                                },
                                identifier3: {
                                    type: 'string',
                                    description: 'External identifier 3',
                                },
                            },
                            required: ['startDate', 'endDate'],
                        },
                    },
                ],
            };
        });
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'get_campaign_details':
                        return await this.getCampaignDetails(args);
                    case 'get_campaigns_report':
                        return await this.getCampaignsReport(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
                        },
                    ],
                };
            }
        });
    }
    async getAccessToken() {
        console.error(`[LOG] getAccessToken called`);
        console.error(`[LOG] Client ID: ${this.clientId ? 'SET' : 'NOT SET'}`);
        console.error(`[LOG] Client Secret: ${this.clientSecret ? 'SET' : 'NOT SET'}`);
        // Check if token is still valid (with 5 minute buffer)
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 300000) {
            console.error(`[LOG] Using cached token`);
            return this.accessToken;
        }
        const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
        console.error(`[LOG] Making auth request to: ${this.baseUrl}/oauth2/token`);
        try {
            const response = await fetch(`${this.baseUrl}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials',
            });
            console.error(`[LOG] Auth response status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[LOG] Auth error response: ${errorText}`);
                throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
            }
            const authData = await response.json();
            console.error(`[LOG] Auth successful, token expires in: ${authData.expires_in} seconds`);
            this.accessToken = authData.access_token;
            this.tokenExpiry = Date.now() + (authData.expires_in * 1000);
            return this.accessToken;
        }
        catch (error) {
            console.error(`[LOG] Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getCampaignDetails(args) {
        console.error(`[LOG] getCampaignDetails called with args:`, JSON.stringify(args));
        const token = await this.getAccessToken();
        console.error(`[LOG] Got access token: ${token ? 'YES' : 'NO'}`);
        const params = new URLSearchParams({
            startDate: args.startDate,
            endDate: args.endDate,
            campaignId: args.campaignId.toString(),
        });
        if (args.accountId)
            params.append('accountId', args.accountId);
        if (args.brandId)
            params.append('brandId', args.brandId);
        const url = `${this.baseUrl}/v1/reporting/campaigns?${params}`;
        console.error(`[LOG] Making API request to: ${url}`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            console.error(`[LOG] API response status: ${response.status} ${response.statusText}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[LOG] API error response: ${errorText}`);
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            const responseText = await response.text();
            console.error(`[LOG] API response body: ${responseText}`);
            const campaignData = JSON.parse(responseText);
            console.error(`[LOG] Parsed campaign data:`, JSON.stringify(campaignData));
            // Safe number formatting with null checks
            const formatNumber = (value) => {
                if (value === null || value === undefined)
                    return 'N/A';
                return typeof value === 'number' ? value.toLocaleString() : String(value);
            };
            const formatPercentage = (value) => {
                if (value === null || value === undefined)
                    return 'N/A';
                return typeof value === 'number' ? `${value}%` : String(value);
            };
            return {
                content: [
                    {
                        type: 'text',
                        text: `Campaign Details for ID ${args.campaignId}:

Campaign: ${campaignData.campaign || 'N/A'}
Brand: ${campaignData.brand || 'N/A'}
Strategy: ${campaignData.strategy || 'N/A'}
Cost Model: ${campaignData.costModel || 'N/A'}
Campaign Goal: ${campaignData.campaignGoal || 'N/A'}

Performance Metrics:
• Impressions: ${formatNumber(campaignData.impressions)}
• Clicks: ${formatNumber(campaignData.clicks)}
• CTR: ${formatPercentage(campaignData.ctr)}
• Video Completes: ${formatNumber(campaignData.videoCompletes)}
• VTR: ${formatPercentage(campaignData.vtr)}
• Engagement: ${formatNumber(campaignData.engagement)}
• Engagement Rate: ${formatPercentage(campaignData.engagementRate)}
• Reach: ${formatNumber(campaignData.reach)}
• Frequency: ${formatNumber(campaignData.frequency)}

Financial:
• Spend: ${formatNumber(campaignData.spend)} ${campaignData.currency || ''}

${campaignData.identifier1 ? `External ID 1: ${campaignData.identifier1}` : ''}
${campaignData.identifier2 ? `External ID 2: ${campaignData.identifier2}` : ''}
${campaignData.identifier3 ? `External ID 3: ${campaignData.identifier3}` : ''}

Date Range: ${args.startDate} to ${args.endDate}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch campaign details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getCampaignsReport(args) {
        const token = await this.getAccessToken();
        const params = new URLSearchParams({
            startDate: args.startDate,
            endDate: args.endDate,
        });
        if (args.accountId)
            params.append('accountId', args.accountId);
        if (args.brandId)
            params.append('brandId', args.brandId);
        if (args.campaignId)
            params.append('campaignId', args.campaignId.toString());
        if (args.identifier1)
            params.append('identifier1', args.identifier1);
        if (args.identifier2)
            params.append('identifier2', args.identifier2);
        if (args.identifier3)
            params.append('identifier3', args.identifier3);
        try {
            const response = await fetch(`${this.baseUrl}/v1/reporting/campaigns?${params}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            const campaignData = await response.json();
            const campaigns = Array.isArray(campaignData) ? campaignData : [campaignData];
            // Safe number formatting with null checks
            const formatNumber = (value) => {
                if (value === null || value === undefined)
                    return 'N/A';
                return typeof value === 'number' ? value.toLocaleString() : String(value);
            };
            const formatPercentage = (value) => {
                if (value === null || value === undefined)
                    return 'N/A';
                return typeof value === 'number' ? `${value}%` : String(value);
            };
            const report = campaigns.map(campaign => `Campaign ID: ${campaign.campaignId || 'N/A'} | ${campaign.campaign || 'N/A'}
Brand: ${campaign.brand || 'N/A'} | Strategy: ${campaign.strategy || 'N/A'}
Impressions: ${formatNumber(campaign.impressions)} | Clicks: ${formatNumber(campaign.clicks)} | CTR: ${formatPercentage(campaign.ctr)}
Spend: ${formatNumber(campaign.spend)} ${campaign.currency || ''} | Reach: ${formatNumber(campaign.reach)}
`).join('\n---\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `Campaigns Report (${args.startDate} to ${args.endDate}):

${report}

Total campaigns: ${campaigns.length}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch campaigns report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async run() {
        // Check if we should run HTTP server (for Railway deployment)
        if (process.env.PORT) {
            const port = process.env.PORT || 3000;
            this.app.listen(port, () => {
                console.error(`Ogury MCP HTTP server running on port ${port}`);
            });
        }
        else {
            // Run stdio server for local development
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.error('Ogury MCP server running on stdio');
        }
    }
}
// Start the server
const server = new OguryMCPServer();
server.run().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map