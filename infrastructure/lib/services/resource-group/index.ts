import * as resourcegroups from "aws-cdk-lib/aws-resourcegroups";
import { Construct } from "constructs";

export interface ResourceGroupProps {
  environment: "dev" | "prod";
  applicationName?: string;
}

/**
 * Resource Group service construct
 * Creates an AWS Resource Group to organize all resources for the application
 */
export class ResourceGroupConstruct extends Construct {
  public readonly resourceGroup: resourcegroups.CfnGroup;

  constructor(scope: Construct, id: string, props: ResourceGroupProps) {
    super(scope, id);

    const { environment, applicationName = "mostage-studio" } = props;

    // Create Resource Group query based on tags
    this.resourceGroup = new resourcegroups.CfnGroup(this, "ResourceGroup", {
      name: `${applicationName}-${environment}`,
      description: `Resource group for ${applicationName} ${environment} environment`,
      resourceQuery: {
        type: "TAG_FILTERS_1_0",
        query: {
          resourceTypeFilters: ["AWS::AllSupported"],
          tagFilters: [
            {
              key: "Application",
              values: [applicationName],
            },
            {
              key: "Environment",
              values: [environment],
            },
          ],
        },
      },
    });
  }
}
