Ogury MCP Server
An MCP (Model Context Protocol) server that provides Claude with access to Ogury's campaign reporting API.

Features
Authentication: Automatic OAuth2 token management with refresh
Campaign Details: Get detailed performance metrics for specific campaigns
Campaign Reports: Flexible reporting with multiple filter options
Error Handling: Comprehensive error handling and logging
Tools Available
1. get_campaign_details
Get detailed performance metrics for a specific campaign.

Parameters:

campaignId (required): The campaign ID to retrieve
startDate (required): Start date in YYYY-MM-DD format
endDate (required): End date in YYYY-MM-DD format
accountId (optional): Account ID filter
brandId (optional): Brand ID filter
Example usage:

"Please provide details about campaign 12345 for the period from 2024-01-01 to 2024-01-31"
2. get_campaigns_report
Get campaign performance report with flexible filtering options.

Parameters:

startDate (required): Start date in YYYY-MM-DD format
endDate (required): End date in YYYY-MM-DD format
accountId (optional): Account IDs (comma-separated)
brandId (optional): Brand ID
campaignId (optional): Specific campaign ID
identifier1/2/3 (optional): External identifiers
## Setup

### MCP Client Configuration

To use this MCP server with an MCP client (like Claude Desktop), create a configuration file:

**mcp-config.json:**
```json
{
  "mcpServers": {
    "ogury": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "OGURY_CLIENT_ID": "your_ogury_client_id_here",
        "OGURY_CLIENT_SECRET": "your_ogury_client_secret_here"
      }
    }
  }
}
```

**For deployed servers (Railway), use:**
```json
{
  "mcpServers": {
    "ogury": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "OGURY_CLIENT_ID": "your_ogury_client_id_here",
        "OGURY_CLIENT_SECRET": "your_ogury_client_secret_here"
      }
    }
  }
}
```

### Environment Variables
Create a .env file with your Ogury API credentials:

```env
OGURY_CLIENT_ID=your_client_id_here
OGURY_CLIENT_SECRET=your_client_secret_here
```
Local Development
Install dependencies:
bash
npm install
Run in development mode:
bash
npm run dev
Build for production:
bash
npm run build
npm start
Deployment on Railway
Quick Deploy
Create Railway Project
Go to Railway
Create new project from GitHub repo
Connect your repository
Set Environment Variables In Railway dashboard:
OGURY_CLIENT_ID=your_actual_client_id
OGURY_CLIENT_SECRET=your_actual_client_secret
Deploy Railway will automatically:
Install dependencies (npm install)
Build the project (npm run build)
Start the server (npm start)
Railway Configuration
Railway will use these commands automatically:

Build Command: npm run build
Start Command: npm start
Project Structure
ogury-mcp-server/
├── src/
│   └── index.ts          # Main MCP server implementation
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Node.js dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
How It Works
Authentication Flow:
Server automatically obtains OAuth2 tokens using client credentials
Tokens are cached and refreshed automatically (1-hour expiry)
Uses HTTP Basic Auth with base64 encoded CLIENT_ID:CLIENT_SECRET
API Integration:
Wraps Ogury's /v1/reporting/campaigns endpoint
Handles authentication headers and error responses
Formats data for Claude consumption
MCP Protocol:
Exposes tools that Claude can invoke
Handles tool discovery and execution
Returns structured responses to Claude
Testing
Once deployed on Railway, you can test by asking Claude:

"Please provide details about campaign 12345 from 2024-01-01 to 2024-01-31"
Claude will use the MCP server to:

Authenticate with Ogury API
Fetch campaign performance data
Format and present the results
Error Handling
The server includes comprehensive error handling for:

Authentication failures
API rate limits
Network timeouts
Invalid parameters
Missing environment variables
Security Notes
Credentials are stored as environment variables
Tokens are cached in memory only (not persisted)
All API calls use HTTPS
No sensitive data is logged
Troubleshooting
Common Issues
Authentication Failed
Verify CLIENT_ID and CLIENT_SECRET are correct
Check that credentials have proper API access
Campaign Not Found
Verify campaign ID exists
Check date range is valid for the campaign
Ensure account/brand filters are correct
Railway Deployment Issues
Check environment variables are set
Verify build logs in Railway dashboard
Ensure Node.js version compatibility (18+)
Logs
Check Railway logs for detailed error information:

Authentication token requests
API call responses
MCP protocol messages
