#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack";

const app = new cdk.App();

new AuthStack(app, "MostageStudioAuthStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "eu-central-1",
  },
  description: "Authentication infrastructure for Mostage Studio",
});
