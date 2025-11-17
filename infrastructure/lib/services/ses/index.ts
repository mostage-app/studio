import * as ses from "aws-cdk-lib/aws-ses";
import { Construct } from "constructs";

export interface SesConstructProps {
  environment: "dev" | "prod";
  createResources: boolean;
  fromEmail?: string;
  replyToEmail?: string;
  configurationSetName?: string;
}

export class SesConstruct extends Construct {
  public readonly fromEmail: string;
  public readonly replyToEmail: string;
  public readonly configurationSetName: string;
  public readonly emailIdentity?: ses.EmailIdentity;
  public readonly configurationSet?: ses.ConfigurationSet;

  constructor(scope: Construct, id: string, props: SesConstructProps) {
    super(scope, id);

    const {
      environment,
      createResources,
      fromEmail = "",
      replyToEmail = "",
      configurationSetName = "",
    } = props;

    this.fromEmail = fromEmail;
    this.replyToEmail = replyToEmail;
    this.configurationSetName = configurationSetName;

    if (createResources && fromEmail) {
      // SES Email Identity
      this.emailIdentity = new ses.EmailIdentity(this, "EmailIdentity", {
        identity: ses.Identity.email(fromEmail),
      });

      // SES Configuration Set (optional)
      if (configurationSetName) {
        this.configurationSet = new ses.ConfigurationSet(
          this,
          "ConfigurationSet",
          {
            configurationSetName:
              configurationSetName ||
              `mostage-studio-ses-config-${environment}`,
          }
        );
      }
    }
  }
}
