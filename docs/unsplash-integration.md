# Unsplash Image Integration

This document describes the Unsplash image search integration in Mostage Studio.

## Overview

The Unsplash integration allows users to search and insert high-quality images directly into their markdown content. The implementation follows Unsplash API guidelines and requirements.

## Features

- **Secure API Integration**: API calls are made through AWS API Gateway and Lambda functions to keep the API key secure
- **Image Search**: Real-time search with debouncing for optimal performance
- **Image Selection**: Visual grid interface for browsing and selecting images
- **Download Tracking**: Automatically tracks image usage as required by Unsplash
- **Proper Attribution**: Automatically adds photographer and Unsplash attribution
- **Hotlinking**: Uses direct Unsplash image URLs as required

## Setup

### 1. Get Unsplash API Access Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key

### 2. Configure Infrastructure

The Unsplash API key is configured in the CDK infrastructure:

1. Set the environment variable before deploying:

   ```bash
   export UNSPLASH_ACCESS_KEY=your_access_key_here
   ```

2. Deploy the infrastructure (see [Infrastructure Setup](infrastructure.md)):

   ```bash
   cd infrastructure
   npm run deploy:dev  # or deploy:prod
   ```

The API key will be stored securely in Lambda environment variables.

### 3. Configure Frontend

After deploying the infrastructure, get the API Gateway URL from stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name StudioStack-dev \
  --query 'Stacks[0].Outputs' \
  --output table
```

Add the API URL to your frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/dev
```

**Important**:

- Never commit the `.env.local` file to version control
- The API key is stored server-side only (in Lambda functions)
- Frontend never has direct access to the API key

## Usage

1. Click the "Search Images" button (ImagePlus icon) in the markdown toolbar
2. Type your search query in the search box
3. Browse the image grid
4. Click on an image to select it
5. Optionally edit the alt text
6. Click "Insert Image" to add it to your markdown

## Implementation Details

### Backend (AWS Lambda + API Gateway)

- **`GET /unsplash/search`**: Lambda function handles image search requests
- **`POST /unsplash/download`**: Lambda function tracks image downloads (required by Unsplash)

The Lambda functions are deployed via AWS CDK and integrated with API Gateway.

### Frontend Components

- **`UnsplashImageModal`**: Main modal component for image search and selection
- **`unsplashService`**: Frontend service for API Gateway communication

### Attribution Format

Images are inserted with proper attribution in the following format:

```markdown
![Alt text](https://images.unsplash.com/photo-...)

_Photo by [Photographer Name](photographer_link) on [Unsplash](unsplash_link)_
```

## Unsplash API Requirements Compliance

✅ **Hotlink photos**: Images are hotlinked to original Unsplash URLs  
✅ **Trigger downloads**: Download events are tracked when images are used  
✅ **No Unsplash branding**: The app does not use Unsplash logo or similar naming  
✅ **Proper attribution**: Photographer and Unsplash are properly attributed with links  
✅ **Secure API key**: API key is stored server-side only

## Troubleshooting

### Images not loading

- Check that `UNSPLASH_ACCESS_KEY` is set in your environment
- Verify the API key is valid in Unsplash Developer dashboard
- Check browser console for errors
- Ensure API routes are accessible

### Search not working

- Check network tab for API request failures
- Verify API key has proper permissions
- Check server logs for errors

### Attribution not appearing

- Verify the image was selected properly
- Check that the markdown was inserted correctly
- Ensure the attribution format is correct

## API Rate Limits

Unsplash API has rate limits:

- **Demo applications**: 50 requests per hour
- **Production applications**: Higher limits (check your plan)

The implementation includes:

- Debounced search to reduce API calls
- Pagination support for loading more results
- Error handling for rate limit responses

## Security Considerations

1. **API Key Security**:

   - API key is never exposed to the frontend
   - All requests go through AWS API Gateway and Lambda functions
   - API key is stored in Lambda environment variables (server-side only)

2. **CORS**:

   - API Gateway handles CORS properly
   - No direct client-to-Unsplash requests

3. **Error Handling**:
   - Errors are handled gracefully in Lambda functions
   - User-friendly error messages
   - No sensitive information leaked in errors

## Future Enhancements

Potential improvements:

- Image filters (orientation, color, etc.)
- Collections browsing
- Recent searches
- Favorite images
- Image size selection
