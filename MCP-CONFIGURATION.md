# MCP Configuration Guide

This guide explains how to configure the Ogury MCP server with different MCP clients.

## Configuration Files

### 1. Local Development (`mcp-config-cursor-test.json`)
Use this configuration for local testing with Cursor or other MCP clients:

```json
{
  "mcpServers": {
    "ogury": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "OGURY_CLIENT_ID": "your_ogury_client_id_here",
        "OGURY_CLIENT_SECRET": "your_ogury_client_secret_here"
      },
      "description": "Ogury MCP Server for accessing campaign data and reports"
    }
  }
}
```

### 2. Basic Configuration (`mcp-config.json`)
Simple configuration for local development:

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

### 3. Detailed Example (`mcp-config-example.json`)
Configuration with additional metadata:

```json
{
  "mcpServers": {
    "ogury": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": {
        "OGURY_CLIENT_ID": "your_ogury_client_id_here",
        "OGURY_CLIENT_SECRET": "your_ogury_client_secret_here"
      },
      "description": "Ogury MCP Server for accessing campaign data and reports"
    }
  }
}
```

## Setup Instructions

### For Cursor IDE

1. **Install Dependencies**:
   ```bash
   npm install
   npm run build
   ```

2. **Set Environment Variables**:
   Replace the placeholder values in the configuration:
   - `your_ogury_client_id_here` → Your actual Ogury Client ID
   - `your_ogury_client_secret_here` → Your actual Ogury Client Secret

3. **Configure Cursor**:
   - Copy one of the configuration files above
   - Place it in Cursor's MCP configuration directory
   - Restart Cursor

### For Claude Desktop

1. **Use the same configuration files** as above
2. **Place in Claude Desktop's MCP configuration directory**
3. **Restart Claude Desktop**

### For Other MCP Clients

The configuration format is standard across MCP clients. Use any of the configuration files above and place them in your client's MCP configuration directory.

## Testing the Configuration

Once configured, you can test the MCP server by asking:

- "Please provide details about campaign 12345 from 2024-01-01 to 2024-01-31"
- "Get a campaign report for the period 2024-01-01 to 2024-01-31"

## Available Tools

### 1. `get_campaign_details`
Get detailed performance metrics for a specific campaign.

**Parameters:**
- `campaignId` (required): The campaign ID to retrieve
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `accountId` (optional): Account ID filter
- `brandId` (optional): Brand ID filter

### 2. `get_campaigns_report`
Get campaign performance report with flexible filtering.

**Parameters:**
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `accountId` (optional): Account IDs (comma-separated)
- `brandId` (optional): Brand ID
- `campaignId` (optional): Specific campaign ID
- `identifier1/2/3` (optional): External identifiers

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Verify CLIENT_ID and CLIENT_SECRET are correct
   - Check that credentials have proper API access

2. **Server Not Starting**
   - Ensure Node.js 18+ is installed
   - Run `npm install` and `npm run build`
   - Check environment variables are set

3. **MCP Client Connection Issues**
   - Verify the configuration file format is correct
   - Check that the `dist/index.js` file exists
   - Ensure the MCP client supports stdio transport

### Logs

Check the console output for:
- Authentication token requests
- API call responses
- MCP protocol messages
- Error details

## Security Notes

- Credentials are stored as environment variables
- Tokens are cached in memory only (not persisted)
- All API calls use HTTPS
- No sensitive data is logged
