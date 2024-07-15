import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  public readonly vpc = new ec2.Vpc(this, "vpc", {
    availabilityZones: ["eu-west-1a"],
    subnetConfiguration: [
      { name: "private-isolated", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
    ],
  });

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    const securityGroup = new ec2.SecurityGroup(this, "ClientSecurityGroup", {
      vpc: this.vpc,
      securityGroupName: "clientSecurityGroup",
    });

    this.vpc.addInterfaceEndpoint("BackendSsmEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      securityGroups: [securityGroup],
    });

    this.vpc.addInterfaceEndpoint("BackendSsmMessagesEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      securityGroups: [securityGroup],
    });

    this.vpc.addInterfaceEndpoint("Ec2MessagesEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      securityGroups: [securityGroup],
    });
  }
}
