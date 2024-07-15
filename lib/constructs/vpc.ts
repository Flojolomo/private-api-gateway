import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class VpcConstruct extends Construct {
  public readonly vpc = new ec2.Vpc(this, "vpc", {
    maxAzs: 1,
    cidr: "10.0.0.0/16",
    subnetConfiguration: [
      {
        name: "private-isolated",
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    ],
    flowLogs: {
      all: {},
    },
  });

  public readonly securityGroup = new ec2.SecurityGroup(
    this,
    "ssm-security-group",
    {
      vpc: this.vpc,
      securityGroupName: "SsmSecurityGroup",
    }
  );

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc.addInterfaceEndpoint("ssm-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      securityGroups: [this.securityGroup],
      privateDnsEnabled: true,
    });

    this.vpc.addInterfaceEndpoint("ssm-messages-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      securityGroups: [this.securityGroup],
      privateDnsEnabled: true,
    });

    this.vpc.addInterfaceEndpoint("ec2-messages-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      securityGroups: [this.securityGroup],
      privateDnsEnabled: true,
    });

    this.vpc.addInterfaceEndpoint("logs-messages-endpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      securityGroups: [this.securityGroup],
      privateDnsEnabled: true,
    });

    this.vpc.addGatewayEndpoint("s3-endpoint", {
      service: ec2.GatewayVpcEndpointAwsService.S3,
    });

    this.securityGroup.addIngressRule(
      ec2.Peer.ipv4(this.vpc.vpcCidrBlock),
      ec2.Port.HTTPS,
      "Allow HTTPS access for SSM"
    );
  }
}
