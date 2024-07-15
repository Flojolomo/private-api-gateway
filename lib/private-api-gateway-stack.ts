import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { JumphostEc2Construct } from "./constructs/jumphost-ec2";
import { VpcConstruct } from "./constructs/vpc";
import { ApiGatewayConstruct } from "./constructs/api-gatway";

export class PrivateApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const { vpc, securityGroup } = new VpcConstruct(this, "vpc");
    new JumphostEc2Construct(this, "jumphost-ec2", {
      ec2SecurityGroup: securityGroup,
      vpc,
    });

    new ApiGatewayConstruct(this, "api-gateway", {
      endpointSecurityGroup: securityGroup,
      vpc,
    });
  }
}
