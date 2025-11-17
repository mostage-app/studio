#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StudioStackDev } from "../lib/stacks/dev";
import { StudioStackProd } from "../lib/stacks/prod";

const app = new cdk.App();

// Development Stack
new StudioStackDev(app, "StudioStack-dev", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "eu-central-1",
  },
});

// Production Stack
new StudioStackProd(app, "StudioStack-prod", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "eu-central-1",
  },
});
